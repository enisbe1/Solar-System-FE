import { NextRequest, NextResponse } from 'next/server';
import { SolarData, SystemSpecs, SolarEstimate } from '@/types/solar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solarData, systemSpecs }: { solarData: SolarData; systemSpecs: SystemSpecs } = body;

    if (!solarData || !systemSpecs) {
      return NextResponse.json(
        { error: 'Solar data and system specifications are required' },
        { status: 400 }
      );
    }

    // Validate input data
    if (systemSpecs.area <= 0 || systemSpecs.panelEfficiency <= 0 || systemSpecs.panelEfficiency > 100) {
      return NextResponse.json(
        { error: 'Invalid system specifications' },
        { status: 400 }
      );
    }

    const estimate = calculateSolarEstimate(solarData, systemSpecs);
    
    return NextResponse.json(estimate);

  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed' },
      { status: 500 }
    );
  }
}

function calculateSolarEstimate(solarData: SolarData, systemSpecs: SystemSpecs): SolarEstimate {
  // Core calculation formulas
  
  // 1. Convert panel efficiency from percentage to decimal
  const panelEfficiencyDecimal = systemSpecs.panelEfficiency / 100;
  const systemLossesDecimal = systemSpecs.systemLosses / 100;
  const systemEfficiency = 1 - systemLossesDecimal;

  // 2. Calculate yearly energy production
  // Formula: Energy (kWh) = Area (m²) × Solar Irradiance (kWh/m²/year) × Panel Efficiency × System Efficiency
  const yearlyEnergyKwh = 
    systemSpecs.area * 
    solarData.yearlyIrradiance * 
    panelEfficiencyDecimal * 
    systemEfficiency;

  // 3. Calculate number of panels needed
  const numberOfPanels = Math.floor(systemSpecs.area / systemSpecs.panelArea);

  // 4. Calculate system capacity in kW
  const systemCapacityKw = (numberOfPanels * systemSpecs.panelPower) / 1000;

  // 5. Calculate CO₂ savings
  // Average grid CO₂ emissions factor (varies by region, using US average: ~0.4 kg CO₂/kWh)
  const co2FactorKgPerKwh = getCO2Factor(solarData.location.lat, solarData.location.lng);
  const co2SavingsKg = yearlyEnergyKwh * co2FactorKgPerKwh;

  // 6. Calculate monthly energy production if monthly data is available
  let monthlySavings: number[] | undefined;
  if (solarData.monthlyData && solarData.monthlyData.length === 12) {
    monthlySavings = solarData.monthlyData.map(monthlyIrradiance => 
      systemSpecs.area * 
      monthlyIrradiance * 
      panelEfficiencyDecimal * 
      systemEfficiency
    );
  }

  // 7. Calculate financial savings (using average electricity rates)
  const electricityRate = getElectricityRate(solarData.location.lat, solarData.location.lng);
  const yearlySavings = yearlyEnergyKwh * electricityRate;

  const estimate: SolarEstimate = {
    yearlyEnergyKwh: Math.round(yearlyEnergyKwh),
    numberOfPanels,
    systemCapacityKw: Math.round(systemCapacityKw * 100) / 100, // Round to 2 decimal places
    co2SavingsKg: Math.round(co2SavingsKg),
    monthlySavings: monthlySavings?.map(val => Math.round(val)),
    financialSavings: {
      yearlySavings: Math.round(yearlySavings),
      electricityRate: Math.round(electricityRate * 1000) / 1000, // Round to 3 decimal places
    },
  };

  return estimate;
}

// Get CO₂ emissions factor based on location (simplified regional estimates)
function getCO2Factor(lat: number, lng: number): number {
  // CO₂ emissions factors in kg CO₂/kWh by region (simplified)
  
  // European Union average
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    return 0.276; // EU average (getting cleaner)
  }
  
  // United States
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) {
    return 0.386; // US average
  }
  
  // China region
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) {
    return 0.555; // China average (coal-heavy)
  }
  
  // India region
  if (lat > 6 && lat < 37 && lng > 68 && lng < 97) {
    return 0.708; // India average (coal-heavy)
  }
  
  // Australia
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) {
    return 0.634; // Australia average
  }
  
  // Brazil
  if (lat > -34 && lat < 5 && lng > -74 && lng < -34) {
    return 0.074; // Brazil (hydro-heavy)
  }
  
  // Default world average
  return 0.475;
}

// Get electricity rates based on location (USD/kWh)
function getElectricityRate(lat: number, lng: number): number {
  // Electricity rates in USD/kWh by region (simplified estimates)
  
  // European Union
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    return 0.28; // EU average (higher rates)
  }
  
  // United States
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) {
    // Vary by state - using regional averages
    if (lng > -104) return 0.13; // Eastern US average
    if (lng < -104) return 0.15; // Western US average
    return 0.14; // Central US average
  }
  
  // China region
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) {
    return 0.08; // China average (subsidized)
  }
  
  // Australia
  if (lat > -44 && lat < -10 && lng > 113 && lng < 154) {
    return 0.25; // Australia average
  }
  
  // Default world average
  return 0.15;
}
