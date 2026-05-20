export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface SolarData {
  location: Location;
  /** Yearly global irradiance on the surface, in kWh/m²/year. */
  yearlyIrradiance: number;
  /** Yearly PV energy yield from PVGIS — kWh per kWp installed per year.
   *  Preferred over irradiance × efficiency when available because PVGIS
   *  already accounts for orientation, tilt, climate and geometry. */
  yearlyYieldKwhPerKwp?: number;
  optimalTilt: number;
  optimalAzimuth: number;
  /** Monthly irradiance values (12). */
  monthlyData?: number[];
  /** Monthly PV energy yield (12), each in kWh per kWp installed. */
  monthlyYieldKwhPerKwp?: number[];
}

export interface SystemSpecs {
  area: number;            // m²
  panelEfficiency: number; // %
  systemLosses: number;    // %
  panelPower: number;      // W per panel
  panelArea: number;       // m² per panel

  // ---- Financial assumptions (all optional; sensible defaults applied) ----

  /** Optional override for the local retail electricity rate (USD/kWh).
   *  Addresses TD-2 (Phase-1 doc). */
  electricityRateOverride?: number;

  /** Feed-in tariff (USD/kWh) for energy exported to the grid. Defaults to
   *  ~30% of the retail rate when unset. */
  feedInRateUsd?: number;

  /** Up-front installation cost (USD). When unset, estimated from kWp
   *  (≈ $1,650/kWp) plus battery cost if any. Closes part of TD-1. */
  installationCostUsd?: number;

  /** Battery capacity (kWh). Default 0 = no battery. */
  batteryKwh?: number;

  /** Optional override for battery cost (USD). Defaults to ~$700/kWh. */
  batteryCostUsd?: number;

  /** Optional override for self-consumption fraction (0–1). Defaults to
   *  0.30 with no battery and 0.75 with a battery. */
  selfConsumptionPct?: number;
}

export interface SolarEstimate {
  yearlyEnergyKwh: number;
  numberOfPanels: number;
  systemCapacityKw: number;
  co2SavingsKg: number;
  monthlySavings?: number[];
  financialSavings?: {
    yearlySavings: number;
    electricityRate: number;
    feedInRate: number;
    selfConsumptionPct: number;
    selfConsumedKwh: number;
    exportedKwh: number;
  };
  investment?: {
    installationCostUsd: number;
    batteryCostUsd: number;
    paybackYears: number | null;
    lifetimeSavingsUsd: number;
  };
}
