/**
 * Unit tests for the deterministic solar-math helpers.
 *
 * These tests are the runnable form of the NFR / FR test cases listed in
 * §6.3 of the Phase-1 portfolio document — most importantly TC-FUNC-01
 * (Berlin reference) and TC-REL-01 (PVGIS fallback). They also pin down the
 * regional CO₂ factor table (FR-6.2) so changes to it become visible in CI.
 */

import { describe, it, expect } from "vitest";
import {
  getCO2Factor,
  getElectricityRate,
  estimateIrradianceByLatitude,
  generateEstimatedMonthlyData,
  yearlyEnergyKwh,
  yearlyEnergyFromPvgisYield,
  monthlyEnergyFromPvgisYield,
  lossAdjustmentFactor,
  panelCount,
  systemCapacityKw,
  treesEquivalent,
  calculateSolarEstimate,
  estimateInstallationCost,
  paybackYears,
  lifetimeSavings,
} from "@/lib/solar-math";

describe("regional CO₂ factor table (FR-6.2)", () => {
  it("uses the EU factor for Berlin", () => {
    expect(getCO2Factor(52.52, 13.405)).toBe(0.276);
  });
  it("uses the US factor for New York", () => {
    expect(getCO2Factor(40.7128, -74.006)).toBe(0.386);
  });
  it("uses the China factor for Shanghai", () => {
    expect(getCO2Factor(31.2304, 121.4737)).toBe(0.555);
  });
  it("uses the India factor for Delhi", () => {
    expect(getCO2Factor(28.6139, 77.209)).toBe(0.708);
  });
  it("uses the Australia factor for Sydney", () => {
    expect(getCO2Factor(-33.8688, 151.2093)).toBe(0.634);
  });
  it("uses the Brazil factor for São Paulo", () => {
    expect(getCO2Factor(-23.5505, -46.6333)).toBe(0.074);
  });
  it("falls back to world average for nothing-matched coordinates", () => {
    expect(getCO2Factor(0, 0)).toBe(0.475);
  });
});

describe("regional electricity rate table (FR-5.1)", () => {
  it("uses the EU rate for Berlin", () => {
    expect(getElectricityRate(52.52, 13.405)).toBe(0.28);
  });
  it("uses Eastern US rate for NYC", () => {
    expect(getElectricityRate(40.7128, -74.006)).toBe(0.13);
  });
  it("uses Western US rate for LA", () => {
    expect(getElectricityRate(34.0522, -118.2437)).toBe(0.15);
  });
  it("uses China subsidised rate", () => {
    expect(getElectricityRate(31.23, 121.47)).toBe(0.08);
  });
  it("uses Australia rate", () => {
    expect(getElectricityRate(-33.87, 151.21)).toBe(0.25);
  });
});

describe("estimateIrradianceByLatitude (FR-3.3 fallback)", () => {
  it("returns highest band for equatorial latitudes", () => {
    expect(estimateIrradianceByLatitude(5)).toBe(2100);
  });
  it("returns 1500 for 30°–40° (Berlin/Madrid band)", () => {
    expect(estimateIrradianceByLatitude(35)).toBe(1500);
  });
  it("treats negative latitudes symmetrically", () => {
    expect(estimateIrradianceByLatitude(-35)).toBe(estimateIrradianceByLatitude(35));
  });
  it("returns lowest band for polar latitudes", () => {
    expect(estimateIrradianceByLatitude(70)).toBe(600);
  });
});

describe("generateEstimatedMonthlyData seasonal distribution", () => {
  it("returns 12 monthly values", () => {
    expect(generateEstimatedMonthlyData(1200, 50)).toHaveLength(12);
  });
  it("peaks in summer in the Northern hemisphere", () => {
    const monthly = generateEstimatedMonthlyData(1200, 50);
    const peakMonth = monthly.indexOf(Math.max(...monthly));
    expect([5, 6]).toContain(peakMonth); // June or July
  });
  it("peaks in summer in the Southern hemisphere", () => {
    const monthly = generateEstimatedMonthlyData(1200, -33);
    const peakMonth = monthly.indexOf(Math.max(...monthly));
    expect([0, 11]).toContain(peakMonth); // Jan or Dec
  });
  it("sum of months stays close to yearly total (within 10%)", () => {
    const yearly = 1500;
    const monthly = generateEstimatedMonthlyData(yearly, 40);
    const sum = monthly.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(yearly * 0.9);
    expect(sum).toBeLessThan(yearly * 1.1);
  });
});

describe("core formulas (FR-4.x)", () => {
  it("computes yearly energy correctly", () => {
    const e = yearlyEnergyKwh(50, 1095, 22, 14);
    // 50 × 1095 × 0.22 × 0.86 = 10358.7
    expect(e).toBeCloseTo(10358.7, 1);
  });
  it("computes panel count via floor()", () => {
    expect(panelCount(50, 2)).toBe(25);
    expect(panelCount(51, 2)).toBe(25);
    expect(panelCount(0, 2)).toBe(0);
  });
  it("rejects zero panel area without dividing by zero", () => {
    expect(panelCount(50, 0)).toBe(0);
  });
  it("computes kWp from panels × power / 1000", () => {
    expect(systemCapacityKw(25, 400)).toBe(10);
  });
  it("scales PVGIS yield when user losses differ from the PVGIS reference", () => {
    expect(lossAdjustmentFactor(14)).toBeCloseTo(1, 5);
    expect(lossAdjustmentFactor(20)).toBeCloseTo(0.93, 2);
  });
  it("computes energy from PVGIS E_y × kWp", () => {
    expect(yearlyEnergyFromPvgisYield(50, 1319.2, 14)).toBeCloseTo(65960, 0);
  });
  it("computes monthly energy from PVGIS E_m × kWp", () => {
    const monthlyYield = [55, 70, 95, 115, 125, 130, 130, 120, 105, 85, 60, 50]; // sums to 1140 kWh/kWp/yr
    const monthly = monthlyEnergyFromPvgisYield(50, monthlyYield, 14);
    expect(monthly).toHaveLength(12);
    expect(monthly[6]).toBeCloseTo(6500, 0); // July: 130 × 50
    expect(monthly.reduce((a, b) => a + b, 0)).toBeCloseTo(57000, 0);
  });
  it("rounds tree equivalent", () => {
    expect(treesEquivalent(2177)).toBe(100);
  });
});

describe("TC-FUNC-01 — Berlin reference (Phase-1 §6.3)", () => {
  // Inputs as documented in the test case spec:
  //   lat = 52.5200, lng = 13.4050; area = 50 m²; defaults.
  // Expected yearlyIrradiance ≈ 1095 kWh/m²/yr ± 10%.
  // Expected kWh ≈ 10 350 ± 10%.
  // Expected numberOfPanels = 25; systemCapacityKw = 10.00.
  const solarData = {
    location: { lat: 52.52, lng: 13.405 },
    yearlyIrradiance: 1095,
    optimalTilt: 35,
    optimalAzimuth: 180,
    monthlyData: undefined,
  };
  const systemSpecs = {
    area: 50,
    panelEfficiency: 22,
    systemLosses: 14,
    panelPower: 400,
    panelArea: 2.0,
  };

  it("produces the expected estimate within tolerance", () => {
    const r = calculateSolarEstimate(solarData, systemSpecs);

    // Numeric outputs within ±10 %
    expect(r.yearlyEnergyKwh).toBeGreaterThanOrEqual(10350 * 0.9);
    expect(r.yearlyEnergyKwh).toBeLessThanOrEqual(10350 * 1.1);

    // Exact-value expectations
    expect(r.numberOfPanels).toBe(25);
    expect(r.systemCapacityKw).toBe(10);

    // CO₂ savings present and positive (uses EU factor 0.276)
    expect(r.co2SavingsKg).toBeGreaterThan(0);

    // Financial savings present, in USD
    expect(r.financialSavings?.yearlySavings).toBeGreaterThan(0);
    expect(r.financialSavings?.electricityRate).toBe(0.28);
  });
});

describe("PVGIS yield path (E_y × kWp)", () => {
  // Pristina-area reference: PVGIS E_y ≈ 1319 kWh/kWp/yr, 250 m² → 50 kWp
  const solarData = {
    location: { lat: 42.241, lng: 21.244 },
    yearlyIrradiance: 1691,
    yearlyYieldKwhPerKwp: 1319.2,
    monthlyYieldKwhPerKwp: [40, 50, 80, 100, 120, 130, 130, 120, 100, 80, 50, 40].map(
      (v) => (v / 1040) * 1319.2,
    ),
    optimalTilt: 35,
    optimalAzimuth: 180,
    monthlyData: Array(12).fill(1691 / 12),
  };
  const systemSpecs = {
    area: 250,
    panelEfficiency: 22,
    systemLosses: 14,
    panelPower: 400,
    panelArea: 2.0,
  };

  it("uses E_y instead of area × irradiance (≈66 MWh, not ≈80 MWh)", () => {
    const r = calculateSolarEstimate(solarData, systemSpecs);
    expect(r.systemCapacityKw).toBe(50);
    expect(r.numberOfPanels).toBe(125);
    expect(r.yearlyEnergyKwh).toBeGreaterThanOrEqual(65960 * 0.99);
    expect(r.yearlyEnergyKwh).toBeLessThanOrEqual(65960 * 1.01);
    expect(r.yearlyEnergyKwh).toBeLessThan(75000);
  });
});

describe("TC-REL-01 — PVGIS fallback path (Phase-1 §6.3)", () => {
  // Simulates the situation where /api/solar fell back to the latitude
  // estimator. Athens (37.98°N) sits firmly in the 30°–40° band → 1500
  // kWh/m²/yr per the doc's R-T-2 mitigation.
  const solarData = {
    location: { lat: 37.9838, lng: 23.7275 },
    yearlyIrradiance: estimateIrradianceByLatitude(37.9838),
    optimalTilt: 30,
    optimalAzimuth: 180,
  };

  it("uses the 1500 kWh/m²/yr fallback band", () => {
    expect(solarData.yearlyIrradiance).toBe(1500);
  });

  it("still produces a sensible estimate", () => {
    const r = calculateSolarEstimate(solarData, {
      area: 30,
      panelEfficiency: 22,
      systemLosses: 14,
      panelPower: 400,
      panelArea: 2.0,
    });
    // 30 × 1500 × 0.22 × 0.86 = 8514
    expect(r.yearlyEnergyKwh).toBeCloseTo(8514, 0);
    expect(r.numberOfPanels).toBe(15);
    expect(r.systemCapacityKw).toBe(6);
  });
});


describe("user-overridable electricity rate (TD-2)", () => {
  const solarData = {
    location: { lat: 52.52, lng: 13.405 }, // Berlin → EU default 0.28
    yearlyIrradiance: 1095,
    optimalTilt: 35,
    optimalAzimuth: 180,
  };
  const baseSpecs = {
    area: 50,
    panelEfficiency: 22,
    systemLosses: 14,
    panelPower: 400,
    panelArea: 2.0,
  };

  it("uses the regional default when override is undefined", () => {
    const r = calculateSolarEstimate(solarData, baseSpecs);
    expect(r.financialSavings?.electricityRate).toBe(0.28);
  });

  it("honours a user override", () => {
    const r = calculateSolarEstimate(solarData, {
      ...baseSpecs,
      electricityRateOverride: 0.42,
    });
    expect(r.financialSavings?.electricityRate).toBe(0.42);
    // Energy = 50 × 1095 × 0.22 × 0.86 ≈ 10358.7 kWh
    // Default self-consumption (no battery) = 30%; feed-in = 0.42 × 0.30 = 0.126
    //   savings = 10358.7 × 0.30 × 0.42  +  10358.7 × 0.70 × 0.126
    //          ≈ 1305.20 + 913.64 = 2218.84 → rounded 2219
    expect(r.financialSavings?.yearlySavings).toBeCloseTo(2219, 0);
  });

  it("returns to ~100% self-consumption equivalent when overridden", () => {
    const r = calculateSolarEstimate(solarData, {
      ...baseSpecs,
      electricityRateOverride: 0.42,
      selfConsumptionPct: 1,
    });
    // Now matches the legacy single-rate formula:
    // 50 × 1095 × 0.22 × 0.86 × 0.42 ≈ 4351
    expect(r.financialSavings?.yearlySavings).toBeCloseTo(4351, 0);
  });

  it("ignores override when it's zero or negative", () => {
    const r = calculateSolarEstimate(solarData, {
      ...baseSpecs,
      electricityRateOverride: 0,
    });
    expect(r.financialSavings?.electricityRate).toBe(0.28);
  });
});


describe("self-consumption defaults (TD-1)", () => {
  // Use the Pristina yield case so we have a known energy figure.
  // 250 m² → 50 kWp; PVGIS E_y 1319.2 → 65960 kWh/yr at 14% losses.
  // Berlin EU box → retail 0.28; feed-in default 0.084.
  const solarData = {
    location: { lat: 42.241, lng: 21.244 },
    yearlyIrradiance: 1691,
    yearlyYieldKwhPerKwp: 1319.2,
    optimalTilt: 35,
    optimalAzimuth: 180,
  };
  const baseSpecs = {
    area: 250,
    panelEfficiency: 22,
    systemLosses: 14,
    panelPower: 400,
    panelArea: 2.0,
  };

  it("defaults to 30% self-consumption with no battery", () => {
    const r = calculateSolarEstimate(solarData, baseSpecs);
    expect(r.financialSavings?.selfConsumptionPct).toBe(0.3);
    // Pristina is OUTSIDE EU box (lng 21.244 > -10 but lat 42 → EU box hits).
    // Retail 0.28 USD/kWh; feed-in default 0.28 × 0.30 = 0.084.
    // Self-consumed: 65960 × 0.3 × 0.28 = 5540.64
    // Exported:      65960 × 0.7 × 0.084 = 3878.43
    // Total:                              ≈ 9419
    expect(r.financialSavings?.yearlySavings).toBeCloseTo(9419, -1);
  });

  it("defaults to 75% self-consumption when a battery is present", () => {
    const r = calculateSolarEstimate(solarData, {
      ...baseSpecs,
      batteryKwh: 10,
    });
    expect(r.financialSavings?.selfConsumptionPct).toBe(0.75);
    // Self-consumed: 65960 × 0.75 × 0.28 = 13851.6
    // Exported:      65960 × 0.25 × 0.084 = 1385.16
    // Total:                              ≈ 15237
    expect(r.financialSavings?.yearlySavings).toBeCloseTo(15237, -1);
  });

  it("battery raises savings by ~60% in this case", () => {
    const no  = calculateSolarEstimate(solarData, baseSpecs);
    const yes = calculateSolarEstimate(solarData, { ...baseSpecs, batteryKwh: 10 });
    // Sanity: with battery should be clearly better than without
    expect((yes.financialSavings?.yearlySavings ?? 0) /
           (no.financialSavings?.yearlySavings ?? 1)).toBeGreaterThan(1.4);
  });
});

describe("installation cost estimation", () => {
  it("estimates $1,650/kWp for a no-battery system", () => {
    expect(estimateInstallationCost(10, 0)).toBe(16500);
  });
  it("adds $700/kWh for the battery", () => {
    expect(estimateInstallationCost(10, 10)).toBe(16500 + 7000);
  });
  it("clamps negative battery sizes to zero", () => {
    expect(estimateInstallationCost(10, -5)).toBe(16500);
  });
});

describe("payback period", () => {
  it("computes years to recover the up-front cost", () => {
    expect(paybackYears(16500, 1500)).toBeCloseTo(11, 2);
  });
  it("returns null when yearly savings are zero or negative", () => {
    expect(paybackYears(16500, 0)).toBeNull();
    expect(paybackYears(16500, -5)).toBeNull();
  });
});

describe("lifetime savings", () => {
  it("subtracts up-front cost from 25 × yearly savings", () => {
    expect(lifetimeSavings(2000, 16500)).toBe(2000 * 25 - 16500);
  });
  it("can be negative when payback isn't achievable in 25 years", () => {
    expect(lifetimeSavings(500, 100000)).toBeLessThan(0);
  });
});

describe("calculateSolarEstimate — investment block", () => {
  const solarData = {
    location: { lat: 52.52, lng: 13.405 },
    yearlyIrradiance: 1095,
    yearlyYieldKwhPerKwp: 1100,
    optimalTilt: 35,
    optimalAzimuth: 180,
  };
  const specs = {
    area: 50,
    panelEfficiency: 22,
    systemLosses: 14,
    panelPower: 400,
    panelArea: 2.0,
  };

  it("emits an investment block with auto-estimated cost", () => {
    const r = calculateSolarEstimate(solarData, specs);
    expect(r.investment).toBeDefined();
    // 25 panels × 400 W = 10 kWp → $16 500 installation
    expect(r.investment?.installationCostUsd).toBe(16500);
    expect(r.investment?.batteryCostUsd).toBe(0);
    expect(r.investment?.paybackYears).toBeGreaterThan(0);
    expect(r.investment?.lifetimeSavingsUsd).toBeGreaterThan(-1_000_000);
  });

  it("honours user-supplied installation cost", () => {
    const r = calculateSolarEstimate(solarData, {
      ...specs,
      installationCostUsd: 12000,
    });
    expect(r.investment?.installationCostUsd).toBe(12000);
  });
});
