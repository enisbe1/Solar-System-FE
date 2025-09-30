'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sun, MapPin, Settings, Calculator } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';
import SolarResults from '@/components/SolarResults';
import { Location, SolarData, SystemSpecs, SolarEstimate } from '@/types/solar';
import axios from 'axios';

// Dynamically import GoogleMap to prevent SSR issues
const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-50 rounded-lg border" style={{ height: '500px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs>({
    area: 100, // Default 100 m²
    panelEfficiency: 22, // 22% (modern panels)
    systemLosses: 14, // 14% standard losses
    panelPower: 400, // 400W per panel
    panelArea: 2.0, // 2 m² per panel
  });
  
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [estimate, setEstimate] = useState<SolarEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setError(null);
    // Reset previous results when location changes
    setSolarData(null);
    setEstimate(null);
  };

  const handleCalculate = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map first');
      return;
    }

    if (systemSpecs.area <= 0) {
      setError('Please enter a valid area size');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch solar irradiance data
      const solarResponse = await axios.get('/api/solar', {
        params: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          provider: 'pvgis',
        },
      });

      const fetchedSolarData: SolarData = solarResponse.data;
      setSolarData(fetchedSolarData);

      // 2. Calculate solar estimate
      const calculateResponse = await axios.post('/api/calculate', {
        solarData: fetchedSolarData,
        systemSpecs,
      });

      const calculatedEstimate: SolarEstimate = calculateResponse.data;
      setEstimate(calculatedEstimate);

    } catch (err) {
      console.error('Calculation error:', err);
      if (axios.isAxiosError(err)) {
        setError(`Error: ${err.response?.data?.error || err.message}`);
      } else {
        setError('Failed to calculate solar estimation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sun className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Solar Energy Calculator</h1>
            </div>
            <div className="hidden sm:block text-sm text-gray-600 ml-4">
              Estimate your solar potential with precision
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!estimate ? (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Calculate Your Solar Energy Potential
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select your location on the map, enter your available space, and get detailed 
                solar energy estimates with environmental and financial impact analysis.
              </p>
            </div>

            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Step 1: Select Location
                  </h3>
                </div>
                
                <ClientOnly fallback={
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg border" style={{ height: '500px' }}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading map...</p>
                    </div>
                  </div>
                }>
                  <GoogleMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    height="500px"
                  />
                </ClientOnly>

                {selectedLocation && (
                  <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Location:</h4>
                    <p className="text-sm text-gray-600">
                      {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                    </p>
                  </div>
                )}
              </div>

              {/* System Specs Form */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Step 2: System Details
                  </h3>
                </div>

                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                  {/* Available Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Area (m²) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={systemSpecs.area}
                      onChange={(e) => setSystemSpecs(prev => ({
                        ...prev,
                        area: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rooftop or land area available for solar panels
                    </p>
                  </div>

                  {/* Panel Efficiency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panel Efficiency (%)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="25"
                      step="0.1"
                      value={systemSpecs.panelEfficiency}
                      onChange={(e) => setSystemSpecs(prev => ({
                        ...prev,
                        panelEfficiency: parseFloat(e.target.value) || 22
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Modern panels: 20-22% (default: 22%)
                    </p>
                  </div>

                  {/* System Losses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Losses (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="20"
                      step="0.1"
                      value={systemSpecs.systemLosses}
                      onChange={(e) => setSystemSpecs(prev => ({
                        ...prev,
                        systemLosses: parseFloat(e.target.value) || 14
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wiring, inverter, dirt losses (default: 14%)
                    </p>
                  </div>

                  {/* Panel Specifications */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Panel Power (W)
                      </label>
                      <input
                        type="number"
                        min="300"
                        max="600"
                        value={systemSpecs.panelPower}
                        onChange={(e) => setSystemSpecs(prev => ({
                          ...prev,
                          panelPower: parseFloat(e.target.value) || 400
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Panel Area (m²)
                      </label>
                      <input
                        type="number"
                        min="1.5"
                        max="3"
                        step="0.1"
                        value={systemSpecs.panelArea}
                        onChange={(e) => setSystemSpecs(prev => ({
                          ...prev,
                          panelArea: parseFloat(e.target.value) || 2.0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <button
                    onClick={handleCalculate}
                    disabled={!selectedLocation || isLoading || systemSpecs.area <= 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        Calculate Solar Potential
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Results Section */
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setEstimate(null);
                setSolarData(null);
                setError(null);
              }}
              className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← Back to Calculator
            </button>
            
            {solarData && (
              <ClientOnly fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading results...</p>
                  </div>
                </div>
              }>
                <SolarResults
                  estimate={estimate}
                  solarData={solarData}
                  systemArea={systemSpecs.area}
                />
              </ClientOnly>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>
              Solar data provided by PVGIS (Photovoltaic Geographical Information System) | 
              Built with Next.js and Google Maps
            </p>
            <p className="mt-2">
              Estimates are for reference only. Consult with solar professionals for accurate system design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
