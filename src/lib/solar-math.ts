/**
 * Pure, deterministic helpers for the solar energy calculator.
 *
 * Extracting these out of /api/calculate and /api/solar means they can be
 * unit-tested with vitest. The test cases TC-FUNC-01 (Berlin) and TC-REL-01
 * (PVGIS fallback) from the Phase-1 portfolio document target these helpers.
 *
 * Keep this module:
 *   - dependency-free (no fetch, no fs, no NextResponse)
 *   - exported function-by-function so each can be re-imported individually
 *   - fully typed and documented with JSDoc
 */

import type { SolarData, SystemSpecs, SolarEstimate } from "@/types/solar";

// --- Constants -----------------------------------------------------------

/** Standard panel area in m² (a typical 60-cell crystalline silicon panel). */
export const DEFAULT_PANEL_AREA_M2 = 2.0;

/** Standard panel power in Wp. */
export const DEFAULT_PANEL_POWER_W = 400;

/** Default panel efficiency (%) — modern crystalline silicon. */
export const DEFAULT_PANEL_EFFICIENCY_PCT = 22;

/** Default whole-system losses (%) — inverter, wiring, soiling. */
export const DEFAULT_SYSTEM_LOSSES_PCT = 14;

/** Loss % baked into PVGIS E_y / E_m when we call the PVcalc API. */
export const PVGIS_REFERENCE_LOSS_PCT = 14;

/** kg CO₂ absorbed per mature tree per year (used for the tree equivalent). */
export const KG_CO2_PER_TREE_YEAR = 21.77;

// --- Regional factors ---------------------------------------------------

/**
 * Region-specific grid CO₂ emission factor in kg CO₂ / kWh.
 *
 * Coarse regional averages — explicitly listed as TD-3 (technical debt)
 * in the Phase-1 document and cross-referenced against IEA 2023 estimates.
 */
export function getCO2Factor(lat: number, lng: number): number {
  // European Union average
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 0.276;
  // United States
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) return 0.386;
  // India (checked first — its box overlaps China at lng 73-97)
  if (lat > 6 && lat < 37 && lng > 68 && lng < 97) return 0.708;
  // China
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) return 0.555;
  // Australia
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) return 0.634;
  // Brazil (hydro-heavy grid)
  if (lat > -34 && lat < 5 && lng > -74 && lng < -34) return 0.074;
  // World average
  return 0.475;
}

/**
 * Region-specific retail electricity rate in USD / kWh.
 * Source URLs and revision dates are tracked in docs/data-sources.md.
 */
export function getElectricityRate(lat: number, lng: number): number {
  // European Union
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 0.28;
  // United States — split between coasts and centre
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) {
    if (lng > -104) return 0.13; // Eastern US
    if (lng < -104) return 0.15; // Western US
    return 0.14;                 // Central US
  }
  // China
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) return 0.08;
  // Australia
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) return 0.25;
  return 0.15;
}

// --- Fallback estimation (PVGIS unavailable) -----------------------------

/**
 * Rough yearly irradiance estimate in kWh/m²/year, based on latitude band.
 * Used by the PVGIS fallback path when the external API is unreachable —
 * see test case TC-REL-01 in §6.3 of the Phase-1 document.
 */
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

/**
 * Distribute a yearly irradiance figure into 12 monthly values that respect
 * the seasonal pattern of the relevant hemisphere.
 */
export function generateEstimatedMonthlyData(yearlyTotal: number, lat: number): number[] {
  const monthlyAvg = yearlyTotal / 12;
  const seasonal = lat >= 0
    ? [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
    : [1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3, 1.4];
  return seasonal.map((f) => monthlyAvg * f);
}

// --- Core calculation ----------------------------------------------------

/**
 * Calculate yearly energy production in kWh.
 * Formula: area × irradiance × η_panel × η_system.
 */
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

/** Panels = floor(area / panel area). */
export function panelCount(areaM2: number, panelAreaM2: number): number {
  if (panelAreaM2 <= 0) return 0;
  return Math.floor(areaM2 / panelAreaM2);
}

/** System capacity in kWp = (panels × panel power) / 1000. */
export function systemCapacityKw(panels: number, panelPowerW: number): number {
  return (panels * panelPowerW) / 1000;
}

/**
 * Scale PVGIS yield when the user picks a different system-loss % than the
 * reference used in the PVGIS request (see PVGIS_REFERENCE_LOSS_PCT).
 */
export function lossAdjustmentFactor(
  userLossPct: number,
  referenceLossPct: number = PVGIS_REFERENCE_LOSS_PCT,
): number {
  return (1 - userLossPct / 100) / (1 - referenceLossPct / 100);
}

/** Yearly production from PVGIS E_y (kWh/kWp) × installed kWp. */
export function yearlyEnergyFromPvgisYield(
  capacityKw: number,
  yieldKwhPerKwp: number,
  systemLossesPct: number,
): number {
  return capacityKw * yieldKwhPerKwp * lossAdjustmentFactor(systemLossesPct);
}

/** Monthly production from PVGIS E_m (kWh/kWp per month) × installed kWp. */
export function monthlyEnergyFromPvgisYield(
  capacityKw: number,
  monthlyYieldKwhPerKwp: number[],
  systemLossesPct: number,
): number[] {
  const factor = lossAdjustmentFactor(systemLossesPct);
  return monthlyYieldKwhPerKwp.map((y) => capacityKw * y * factor);
}

/** Tree-equivalent for environmental impact. */
export function treesEquivalent(co2SavingsKg: number): number {
  return Math.round(co2SavingsKg / KG_CO2_PER_TREE_YEAR);
}

/**
 * Run the full calculation. Mirrors the body of /api/calculate so the API
 * route stays a thin transport wrapper around a pure function.
 */
export function calculateSolarEstimate(
  solarData: SolarData,
  systemSpecs: SystemSpecs,
): SolarEstimate {
  const panels = panelCount(systemSpecs.area, systemSpecs.panelArea);
  const capacity = systemCapacityKw(panels, systemSpecs.panelPower);

  const usePvgisYield =
    solarData.yearlyYieldKwhPerKwp != null && solarData.yearlyYieldKwhPerKwp > 0;

  const energy = usePvgisYield
    ? yearlyEnergyFromPvgisYield(
        capacity,
        solarData.yearlyYieldKwhPerKwp!,
        systemSpecs.systemLosses,
      )
    : yearlyEnergyKwh(
        systemSpecs.area,
        solarData.yearlyIrradiance,
        systemSpecs.panelEfficiency,
        systemSpecs.systemLosses,
      );

  const co2Factor = getCO2Factor(solarData.location.lat, solarData.location.lng);
  const co2 = energy * co2Factor;
  const rate = getElectricityRate(solarData.location.lat, solarData.location.lng);
  const savings = energy * rate;

  const monthlyEnergy = usePvgisYield && solarData.monthlyYieldKwhPerKwp?.length === 12
    ? monthlyEnergyFromPvgisYield(
        capacity,
        solarData.monthlyYieldKwhPerKwp,
        systemSpecs.systemLosses,
      )
    : solarData.monthlyData?.length === 12
      ? solarData.monthlyData.map((m) =>
          yearlyEnergyKwh(
            systemSpecs.area,
            m * 12,
            systemSpecs.panelEfficiency,
            systemSpecs.systemLosses,
          ) / 12)
      : undefined;

  return {
    yearlyEnergyKwh: Math.round(energy),
    numberOfPanels: panels,
    systemCapacityKw: Math.round(capacity * 100) / 100,
    co2SavingsKg: Math.round(co2),
    monthlySavings: monthlyEnergy?.map((v) => Math.round(v)),
    financialSavings: {
      yearlySavings: Math.round(savings),
      electricityRate: Math.round(rate * 1000) / 1000,
    },
  };
}
