/**
 * Pure, deterministic helpers for the solar energy calculator.
 *
 * Two complementary calculation paths are supported:
 *
 *  - **PVGIS-yield path** (preferred). When PVGIS returns yearlyYieldKwhPerKwp
 *    (its E_y figure), we use systemCapacityKwp × E_y, scaled for the user's
 *    chosen losses relative to PVGIS's 14% reference. This is more accurate
 *    than reapplying our own efficiency model because PVGIS already factors
 *    in panel orientation, climate, geometry and shading.
 *
 *  - **Irradiance fallback** (legacy). Used when yieldKwhPerKwp is missing —
 *    e.g. when the PVGIS API was unreachable and we fell back to a
 *    latitude-band estimate (R-T-2 in the doc).
 *
 * Financial helpers (installation cost, self-consumption, payback, lifetime
 * savings) close part of TD-1 from the Phase-1 portfolio.
 *
 * Module rules:
 *   - dependency-free (no fetch, no fs, no NextResponse)
 *   - exported function-by-function so each can be imported individually
 *   - JSDoc on everything; backwards-compatible signatures
 */

import type { SolarData, SystemSpecs, SolarEstimate } from "@/types/solar";

// --- Physical / financial constants ------------------------------------

export const DEFAULT_PANEL_AREA_M2 = 2.0;
export const DEFAULT_PANEL_POWER_W = 400;
export const DEFAULT_PANEL_EFFICIENCY_PCT = 22;
export const DEFAULT_SYSTEM_LOSSES_PCT = 14;
export const KG_CO2_PER_TREE_YEAR = 21.77;

/** PVGIS's default system-losses figure when computing E_y / E_m. */
export const PVGIS_REFERENCE_LOSSES_PCT = 14;

export const COST_PER_KWP_USD = 1650;
export const COST_PER_KWH_BATTERY_USD = 700;
export const DEFAULT_SELF_CONSUMPTION_NO_BATTERY = 0.30;
/** @deprecated Legacy binary value (75%). Replaced by the smooth curve
 *  in defaultSelfConsumption(batteryKwh, systemCapacityKwp). Kept for
 *  backwards-compatible imports. */
export const DEFAULT_SELF_CONSUMPTION_WITH_BATTERY = 0.75;
export const DEFAULT_FEED_IN_FRACTION_OF_RETAIL = 0.30;
export const PANEL_LIFETIME_YEARS = 25;

// --- Regional factors --------------------------------------------------

export function getCO2Factor(lat: number, lng: number): number {
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 0.276;
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) return 0.386;
  if (lat > 6 && lat < 37 && lng > 68 && lng < 97) return 0.708;
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) return 0.555;
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) return 0.634;
  if (lat > -34 && lat < 5 && lng > -74 && lng < -34) return 0.074;
  return 0.475;
}

export function getElectricityRate(lat: number, lng: number): number {
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 0.28;
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) {
    if (lng > -104) return 0.13;
    if (lng < -104) return 0.15;
    return 0.14;
  }
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) return 0.08;
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) return 0.25;
  return 0.15;
}

// --- Fallback irradiance ------------------------------------------------

export function estimateIrradianceByLatitude(lat: number): number {
  const abs = Math.abs(lat);
  if (abs < 10) return 2100;
  if (abs < 20) return 1900;
  if (abs < 30) return 1700;
  if (abs < 40) return 1500;
  if (abs < 50) return 1200;
  if (abs < 60) return 900;
  return 600;
}

export function generateEstimatedMonthlyData(yearlyTotal: number, lat: number): number[] {
  const monthlyAvg = yearlyTotal / 12;
  const seasonal = lat >= 0
    ? [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
    : [1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3, 1.4];
  return seasonal.map((f) => monthlyAvg * f);
}

// --- Sizing helpers -----------------------------------------------------

export function panelCount(areaM2: number, panelAreaM2: number): number {
  if (panelAreaM2 <= 0) return 0;
  return Math.floor(areaM2 / panelAreaM2);
}

export function systemCapacityKw(panels: number, panelPowerW: number): number {
  return (panels * panelPowerW) / 1000;
}

export function treesEquivalent(co2SavingsKg: number): number {
  return Math.round(co2SavingsKg / KG_CO2_PER_TREE_YEAR);
}

// --- Energy helpers -----------------------------------------------------

/** Legacy irradiance-based formula. Still used when PVGIS yield is unavailable. */
export function yearlyEnergyKwh(
  areaM2: number,
  yearlyIrradiance: number,
  panelEfficiencyPct: number,
  systemLossesPct: number,
): number {
  const eta = panelEfficiencyPct / 100;
  const systemEta = 1 - systemLossesPct / 100;
  return areaM2 * yearlyIrradiance * eta * systemEta;
}

/**
 * Scale factor that adjusts PVGIS-derived energy for a user-chosen losses
 * value different from PVGIS's 14% reference.
 *
 *   factor = (1 − userLosses/100) / (1 − 0.14)
 *
 * userLosses = 14% returns 1.0; 20% returns ≈ 0.93.
 */
export function lossAdjustmentFactor(userLossesPct: number): number {
  const userSystemEta = 1 - userLossesPct / 100;
  const pvgisSystemEta = 1 - PVGIS_REFERENCE_LOSSES_PCT / 100;
  return userSystemEta / pvgisSystemEta;
}

/**
 * Yearly energy from PVGIS yield: kWp × E_y × lossAdjustmentFactor.
 * E_y is the yearly PV energy yield in kWh per installed kWp.
 */
export function yearlyEnergyFromPvgisYield(
  systemCapacityKwp: number,
  yieldKwhPerKwp: number,
  userLossesPct: number,
): number {
  return systemCapacityKwp * yieldKwhPerKwp * lossAdjustmentFactor(userLossesPct);
}

/**
 * Monthly energy from PVGIS monthly yields (kWh per kWp per month).
 * Returns 12 numbers, each in kWh.
 */
export function monthlyEnergyFromPvgisYield(
  systemCapacityKwp: number,
  monthlyYieldKwhPerKwp: number[],
  userLossesPct: number,
): number[] {
  const factor = lossAdjustmentFactor(userLossesPct);
  return monthlyYieldKwhPerKwp.map((y) => systemCapacityKwp * y * factor);
}

// --- Financial helpers --------------------------------------------------

export function estimateInstallationCost(
  systemCapacityKwp: number,
  batteryKwh: number = 0,
): number {
  const pvCost = systemCapacityKwp * COST_PER_KWP_USD;
  const batteryCost = Math.max(0, batteryKwh) * COST_PER_KWH_BATTERY_USD;
  return Math.round(pvCost + batteryCost);
}

/**
 * Default self-consumption fraction, scaled smoothly with battery size.
 *
 * The previous binary model (30% without battery, 75% with any battery)
 * broke down for large systems: a 10 kWh battery on a 1 MW PV array
 * functionally adds no storage, yet the binary tier would claim 75%
 * self-consumption — overstating savings by a factor of 2+ for the
 * with-battery scenario.
 *
 * New model uses the battery-to-PV ratio in *hours of storage*
 * (batteryKwh / systemCapacityKwp). Self-consumption follows an
 * asymptotic curve:
 *
 *     pct = baseline + (ceiling - baseline) × (1 - e^(-k × hours))
 *
 * with:
 *   baseline = 0.30 (no storage)
 *   ceiling  = 0.95 (very large battery, time-shift dominates)
 *   k = 0.55      (tuned so 1 h ≈ 58%, 2 h ≈ 74%, 4 h ≈ 89%)
 *
 * Callers can still pass batteryKwh=0 (returns baseline exactly), and the
 * second argument defaults to 0 so any legacy call site continues to work
 * (returns 30% in that case, matching the no-storage baseline).
 */
export function defaultSelfConsumption(
  batteryKwh: number = 0,
  systemCapacityKwp: number = 0,
): number {
  if (batteryKwh <= 0 || systemCapacityKwp <= 0) {
    return DEFAULT_SELF_CONSUMPTION_NO_BATTERY;
  }
  const hours = batteryKwh / systemCapacityKwp;
  const baseline = DEFAULT_SELF_CONSUMPTION_NO_BATTERY; // 0.30
  const ceiling = 0.95;
  const k = 0.55;
  return baseline + (ceiling - baseline) * (1 - Math.exp(-k * hours));
}

export function splitYearlySavings(
  yearlyEnergyKwhValue: number,
  selfConsumptionPct: number,
  retailRateUsd: number,
  feedInRateUsd: number,
): { yearlySavings: number; selfConsumedKwh: number; exportedKwh: number } {
  const consumed = yearlyEnergyKwhValue * selfConsumptionPct;
  const exported = yearlyEnergyKwhValue - consumed;
  return {
    yearlySavings: consumed * retailRateUsd + exported * feedInRateUsd,
    selfConsumedKwh: consumed,
    exportedKwh: exported,
  };
}

export function paybackYears(
  installationCostUsd: number,
  yearlySavingsUsd: number,
): number | null {
  if (yearlySavingsUsd <= 0) return null;
  return installationCostUsd / yearlySavingsUsd;
}

export function lifetimeSavings(
  yearlySavingsUsd: number,
  installationCostUsd: number,
  years: number = PANEL_LIFETIME_YEARS,
): number {
  return Math.round(yearlySavingsUsd * years - installationCostUsd);
}

// --- Top-level: full estimate ------------------------------------------

export function calculateSolarEstimate(
  solarData: SolarData,
  systemSpecs: SystemSpecs,
): SolarEstimate {
  const panels = panelCount(systemSpecs.area, systemSpecs.panelArea);
  const capacity = systemCapacityKw(panels, systemSpecs.panelPower);

  // Prefer PVGIS yield when present (more accurate); otherwise legacy formula.
  let energy: number;
  let monthlyEnergy: number[] | undefined;

  if (solarData.yearlyYieldKwhPerKwp !== undefined && capacity > 0) {
    energy = yearlyEnergyFromPvgisYield(
      capacity,
      solarData.yearlyYieldKwhPerKwp,
      systemSpecs.systemLosses,
    );

    if (solarData.monthlyYieldKwhPerKwp?.length === 12) {
      monthlyEnergy = monthlyEnergyFromPvgisYield(
        capacity,
        solarData.monthlyYieldKwhPerKwp,
        systemSpecs.systemLosses,
      );
    }
  } else {
    energy = yearlyEnergyKwh(
      systemSpecs.area,
      solarData.yearlyIrradiance,
      systemSpecs.panelEfficiency,
      systemSpecs.systemLosses,
    );
    monthlyEnergy = solarData.monthlyData?.length === 12
      ? solarData.monthlyData.map((m) =>
          yearlyEnergyKwh(systemSpecs.area, m * 12, systemSpecs.panelEfficiency, systemSpecs.systemLosses) / 12,
        )
      : undefined;
  }

  const co2Factor = getCO2Factor(solarData.location.lat, solarData.location.lng);
  const co2 = energy * co2Factor;

  const retailRate =
    systemSpecs.electricityRateOverride !== undefined &&
    systemSpecs.electricityRateOverride > 0
      ? systemSpecs.electricityRateOverride
      : getElectricityRate(solarData.location.lat, solarData.location.lng);

  const feedInRate =
    systemSpecs.feedInRateUsd !== undefined && systemSpecs.feedInRateUsd >= 0
      ? systemSpecs.feedInRateUsd
      : retailRate * DEFAULT_FEED_IN_FRACTION_OF_RETAIL;

  const batteryKwh = Math.max(0, systemSpecs.batteryKwh ?? 0);
  const selfConsumption =
    systemSpecs.selfConsumptionPct !== undefined
      ? Math.max(0, Math.min(1, systemSpecs.selfConsumptionPct))
      : defaultSelfConsumption(batteryKwh, capacity);

  const { yearlySavings, selfConsumedKwh, exportedKwh } = splitYearlySavings(
    energy,
    selfConsumption,
    retailRate,
    feedInRate,
  );

  const installationCost =
    systemSpecs.installationCostUsd !== undefined && systemSpecs.installationCostUsd > 0
      ? systemSpecs.installationCostUsd
      : estimateInstallationCost(capacity, batteryKwh);

  const batteryCost =
    systemSpecs.batteryCostUsd !== undefined && systemSpecs.batteryCostUsd >= 0
      ? systemSpecs.batteryCostUsd
      : batteryKwh * COST_PER_KWH_BATTERY_USD;

  const payback = paybackYears(installationCost, yearlySavings);
  const lifetime = lifetimeSavings(yearlySavings, installationCost);

  return {
    yearlyEnergyKwh: Math.round(energy),
    numberOfPanels: panels,
    systemCapacityKw: Math.round(capacity * 100) / 100,
    co2SavingsKg: Math.round(co2),
    monthlySavings: monthlyEnergy?.map((v) => Math.round(v)),
    financialSavings: {
      yearlySavings: Math.round(yearlySavings),
      electricityRate: Math.round(retailRate * 1000) / 1000,
      feedInRate: Math.round(feedInRate * 1000) / 1000,
      selfConsumptionPct: Math.round(selfConsumption * 100) / 100,
      selfConsumedKwh: Math.round(selfConsumedKwh),
      exportedKwh: Math.round(exportedKwh),
    },
    investment: {
      installationCostUsd: Math.round(installationCost),
      batteryCostUsd: Math.round(batteryCost),
      paybackYears: payback === null ? null : Math.round(payback * 10) / 10,
      lifetimeSavingsUsd: lifetime,
    },
  };
}
