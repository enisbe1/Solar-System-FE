import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SolarData } from '@/types/solar';

// PVGIS API endpoint for photovoltaic geographical information system
const PVGIS_API_URL = 'https://re.jrc.ec.europa.eu/api/v5_2/PVcalc';

// NREL API endpoint (alternative)
const NREL_API_URL = 'https://developer.nrel.gov/api/solar/solar_resource/v1.json';

interface PVGISResponse {
  meta: {
    'inputs': {
      'location': {
        'latitude': number;
        'longitude': number;
        'elevation': number;
      };
      'mounting_system': {
        'fixed': {
          'slope': {
            'value': number; // optimal tilt
          };
          'azimuth': {
            'value': number; // optimal azimuth
          };
        };
      };
    };
  };
  outputs: {
    totals: {
      fixed: {
        'E_y': number; // Yearly PV energy production (kWh/kWp)
        'H(i)_y': number; // Yearly sum of global irradiation per unit area (kWh/m²)
        'SD_y': number; // Standard deviation of yearly sums
      };
    };
    monthly: {
      fixed: Array<{
        month: number;
        'E_m': number; // Monthly PV energy production (kWh/kWp)  
        'H(i)_m': number; // Monthly sum of global irradiation (kWh/m²)
        'SD_m': number; // Standard deviation
      }>;
    };
    meta: {
      'inputs': {
        'location': {
          'latitude': number;
          'longitude': number;
          'elevation': number;
        };
        'mounting_system': {
          'fixed': {
            'slope': {
              'value': number; // optimal tilt
            };
            'azimuth': {
              'value': number; // optimal azimuth
            };
          };
        };
      };
    };
  };
  inputs: {
    mounting_system: {
      fixed: {
        slope: {
          value: number; // optimal tilt
        };
        azimuth: {
          value: number; // optimal azimuth
        };
      };
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const provider = searchParams.get('provider') || 'pvgis';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      );
    }

    let solarData: SolarData;

    if (provider === 'pvgis') {
      solarData = await fetchPVGISData(latitude, longitude);
    } else {
      // Could implement NREL or other providers here
      return NextResponse.json(
        { error: 'Provider not supported yet' },
        { status: 400 }
      );
    }

    return NextResponse.json(solarData);

  } catch (error) {
    console.error('Solar API error:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: `External API error: ${error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchPVGISData(lat: number, lng: number): Promise<SolarData> {
  try {
    // PVGIS API parameters
    const params = {
      lat,
      lon: lng,
      raddatabase: 'PVGIS-SARAH2', // European coverage
      outputformat: 'json',
      userhorizon: '', // No horizon limitations
      usehorizon: 1,
      angle: '', // Let PVGIS determine optimal angle
      aspect: '', // Let PVGIS determine optimal azimuth
      startyear: 2016,
      endyear: 2020,
      pvcalculation: 1,
      peakpower: 1, // 1 kWp for per-unit calculations
      pvtechchoice: 'crystSi', // Crystalline Silicon
      mountingplace: 'free', // Free-standing
      loss: 14, // 14% system losses (standard)
      trackingtype: 0, // Fixed mounting
      optimalinclination: 1, // Calculate optimal inclination
      optimalangles: 1, // Calculate optimal angles
    };

    const response = await axios.get<PVGISResponse>(PVGIS_API_URL, {
      params,
      timeout: 10000,
    });

    const data = response.data;
    
    if (!data.outputs) {
      throw new Error('Invalid PVGIS response format');
    }


    const totals = data.outputs.totals.fixed;
    const monthly = data.outputs.monthly.fixed;
    const meta = data.inputs;

    // Extract monthly irradiance data
    const monthlyIrradiance = monthly.map(month => month['H(i)_m']);

    const solarData: SolarData = {
      location: {
        lat,
        lng: lng,
      },
      yearlyIrradiance: totals['H(i)_y'], // kWh/m²/year
      optimalTilt: meta.mounting_system.fixed.slope.value,
      optimalAzimuth: meta.mounting_system.fixed.azimuth.value,
      monthlyData: monthlyIrradiance,
    };

    return solarData;

  } catch (error) {
    console.error('PVGIS API error:', error);
    
    // Fallback to estimated values based on latitude if API fails
    const estimatedIrradiance = estimateIrradianceByLatitude(lat);
    
    return {
      location: { lat, lng },
      yearlyIrradiance: estimatedIrradiance,
      optimalTilt: Math.abs(lat) > 40 ? Math.abs(lat) - 10 : Math.abs(lat),
      optimalAzimuth: lat >= 0 ? 180 : 0, // South in Northern hemisphere, North in Southern
      monthlyData: generateEstimatedMonthlyData(estimatedIrradiance, lat),
    };
  }
}

// Fallback estimation based on latitude
function estimateIrradianceByLatitude(lat: number): number {
  const absLat = Math.abs(lat);
  
  // Rough estimates based on latitude bands (kWh/m²/year)
  if (absLat < 10) return 2100; // Near equator - high irradiance
  if (absLat < 20) return 1900; // Tropical
  if (absLat < 30) return 1700; // Subtropical  
  if (absLat < 40) return 1500; // Temperate
  if (absLat < 50) return 1200; // Higher temperate
  if (absLat < 60) return 900;  // Subarctic
  return 600; // Arctic
}

// Generate estimated monthly data with seasonal variation
function generateEstimatedMonthlyData(yearlyTotal: number, lat: number): number[] {
  const monthlyAvg = yearlyTotal / 12;
  const seasonal = lat >= 0 ? // Northern hemisphere seasonal pattern
    [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6] :
    [1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3, 1.4]; // Southern hemisphere
  
  return seasonal.map(factor => monthlyAvg * factor);
}
