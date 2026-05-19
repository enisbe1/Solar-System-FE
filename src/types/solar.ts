export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface SolarData {
  location: Location;
  yearlyIrradiance: number; // kWh/m²/year (H(i)_y) — charts & fallback calc
  optimalTilt: number; // degrees
  optimalAzimuth: number; // degrees
  monthlyData?: number[]; // Monthly irradiance H(i)_m (kWh/m²)
  /** PVGIS modeled yield per kWp (E_y). Preferred for energy estimates. */
  yearlyYieldKwhPerKwp?: number;
  /** PVGIS monthly yield per kWp (E_m), 12 values. */
  monthlyYieldKwhPerKwp?: number[];
}

export interface SystemSpecs {
  area: number; // m²
  panelEfficiency: number; // percentage (e.g., 22 for 22%)
  systemLosses: number; // percentage (e.g., 14 for 14% losses)
  panelPower: number; // Watts per panel (e.g., 400W)
  panelArea: number; // m² per panel (e.g., 2.0)
}

export interface SolarEstimate {
  yearlyEnergyKwh: number;
  numberOfPanels: number;
  systemCapacityKw: number;
  co2SavingsKg: number;
  monthlySavings?: number[];
  financialSavings?: {
    yearlySavings: number;
    electricityRate: number; // $/kWh
  };
}
