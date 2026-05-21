'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Settings, Calculator } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';
import SolarResults from '@/components/SolarResults';
import QuickPresets from '@/components/QuickPresets';
import ResultsSkeleton from '@/components/ResultsSkeleton';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import InfoTooltip from '@/components/InfoTooltip';
import TrustStrip from '@/components/TrustStrip';
import SiteFooter from '@/components/SiteFooter';
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

// Lazy-loaded PDF download button — @react-pdf/renderer is large and runs
// only in the browser, so we keep it out of the initial bundle.
const DownloadPdfButton = dynamic(
  () => import('@/components/SolarReportPDF'),
  { ssr: false, loading: () => (
      <span className="text-sm text-gray-500">Preparing PDF tools…</span>
  ) },
);


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

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setError(null);
    // Reset previous results when location changes
    setSolarData(null);
    setEstimate(null);
  }, []);

  // Fired by GoogleMap when the user finishes drawing a roof outline.
  // Updates the area field so the existing calculation pipeline picks it up.
  const handleAreaDrawn = useCallback((areaM2: number) => {
    if (areaM2 <= 0) return; // 0 means cleared — keep existing value
    setSystemSpecs((prev) => ({ ...prev, area: Math.round(areaM2) }));
    // Invalidate previous results — the area changed
    setEstimate(null);
    setSolarData(null);
  }, []);

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
      {/* Hero + How it works */}
      <Hero />
      <HowItWorks />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!estimate ? (
          <div className="space-y-8">
            {/* Section heading (the hero already pitched the product) */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Let&apos;s analyse your roof
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Steps 1–2 take about a minute. Everything happens in your browser.
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

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                  <QuickPresets
                    onSelect={handleLocationSelect}
                    selectedLat={selectedLocation?.lat}
                    selectedLng={selectedLocation?.lng}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Tip: click a city to test the calculator instantly, or pick any spot on the map.
                  </p>
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
                    onAreaDrawn={handleAreaDrawn}
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
                      Available Area (m²) * <InfoTooltip>The rooftop or land area available for panels. You can also draw the outline on the satellite map and the area is computed automatically.</InfoTooltip>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="e.g., 100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rooftop or land area available for solar panels — or trace your
                      roof on the satellite map to fill this in automatically.
                    </p>
                  </div>

                  {/* Panel Efficiency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panel Efficiency (%) <InfoTooltip>Percentage of incoming sunlight a panel converts to electricity. Modern crystalline-silicon panels sit around 20–22%.</InfoTooltip>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Modern panels: 20-22% (default: 22%)
                    </p>
                  </div>

                  {/* System Losses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Losses (%) <InfoTooltip>Energy lost in the inverter, wiring, soiling and temperature effects. PVGIS uses 14% as the default reference.</InfoTooltip>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Financial assumptions — collapsible (TD-1, TD-2) */}
                  <div className="border-t pt-4">
                    <details className="group">
                      <summary className="cursor-pointer select-none flex items-center justify-between text-sm font-medium text-gray-800 hover:text-blue-600">
                        <span>Financial assumptions <span className="text-gray-400 font-normal">— optional</span></span>
                        <span className="text-xs text-gray-400 group-open:hidden">show</span>
                        <span className="text-xs text-gray-400 hidden group-open:inline">hide</span>
                      </summary>

                      <div className="mt-4 space-y-4">
                        {/* Electricity rate override */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Retail electricity rate (USD/kWh)
                          </label>
                          <input
                            type="number" min="0" max="2" step="0.01"
                            value={systemSpecs.electricityRateOverride ?? ''}
                            placeholder="Auto (regional default)"
                            onChange={(e) => {
                              const v = e.target.value;
                              setSystemSpecs(prev => ({
                                ...prev,
                                electricityRateOverride: v === '' ? undefined : parseFloat(v),
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Your tariff per kWh; leave blank for the regional default (EU ≈ 0.28).
                          </p>
                        </div>

                        {/* Feed-in tariff override */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feed-in tariff (USD/kWh)
                          </label>
                          <input
                            type="number" min="0" max="2" step="0.01"
                            value={systemSpecs.feedInRateUsd ?? ''}
                            placeholder="Auto (30% of retail)"
                            onChange={(e) => {
                              const v = e.target.value;
                              setSystemSpecs(prev => ({
                                ...prev,
                                feedInRateUsd: v === '' ? undefined : parseFloat(v),
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Price paid for energy exported to the grid.
                          </p>
                        </div>

                        {/* Battery + self-consumption */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Battery (kWh)
                            </label>
                            <input
                              type="number" min="0" max="100" step="1"
                              value={systemSpecs.batteryKwh ?? ''}
                              placeholder="0"
                              onChange={(e) => {
                                const v = e.target.value;
                                setSystemSpecs(prev => ({
                                  ...prev,
                                  batteryKwh: v === '' ? undefined : parseFloat(v),
                                  // Drop a manual self-consumption override so the
                                  // default reflects the new battery state.
                                  selfConsumptionPct: undefined,
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Adding a battery typically lifts self-consumption from 30% to 75%.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Self-consumption (%)
                            </label>
                            <input
                              type="number" min="0" max="100" step="5"
                              value={
                                systemSpecs.selfConsumptionPct !== undefined
                                  ? Math.round(systemSpecs.selfConsumptionPct * 100)
                                  : ''
                              }
                              placeholder={(systemSpecs.batteryKwh ?? 0) > 0 ? '75' : '30'}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSystemSpecs(prev => ({
                                  ...prev,
                                  selfConsumptionPct: v === '' ? undefined : parseFloat(v) / 100,
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Share of generation used on-site.
                            </p>
                          </div>
                        </div>

                        {/* Installation cost override */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Installation cost (USD)
                          </label>
                          <input
                            type="number" min="0" step="100"
                            value={systemSpecs.installationCostUsd ?? ''}
                            placeholder="Auto ($1,650/kWp + $700/kWh battery)"
                            onChange={(e) => {
                              const v = e.target.value;
                              setSystemSpecs(prev => ({
                                ...prev,
                                installationCostUsd: v === '' ? undefined : parseFloat(v),
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Up-front cost. Drives the payback calculation.
                          </p>
                        </div>
                      </div>
                    </details>
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

            {/* Skeleton placeholder while the PVGIS call is in flight */}
            {isLoading && !estimate && <ResultsSkeleton />}
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
            
            {estimate && solarData && (
              <div className="mb-6 flex justify-end">
                <DownloadPdfButton
                  estimate={estimate}
                  solarData={solarData}
                  systemSpecs={systemSpecs}
                />
              </div>
            )}

            {solarData && (
              <ClientOnly fallback={<ResultsSkeleton />}>
                <SolarResults
                  estimate={estimate}
                  solarData={solarData}
                  systemArea={systemSpecs.area}
                  systemSpecs={systemSpecs}
                />
              </ClientOnly>
            )}
        </div>
        )}
      </main>

      <TrustStrip />
      <SiteFooter />
    </div>
  );
}
