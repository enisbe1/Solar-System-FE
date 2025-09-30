'use client';

import { SolarEstimate, SolarData } from '@/types/solar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line} from 'recharts';
import { Sun, Zap, Leaf, DollarSign, MapPin, Calculator } from 'lucide-react';

interface SolarResultsProps {
  estimate: SolarEstimate;
  solarData: SolarData;
  systemArea: number;
}

export default function SolarResults({ estimate, solarData, systemArea }: SolarResultsProps) {
  // Prepare monthly data for chart
  const monthlyData = estimate.monthlySavings?.map((energy, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    energy: Math.round(energy),
    irradiance: solarData.monthlyData?.[index] ? Math.round(solarData.monthlyData[index] * 10) / 10 : 0,
  })) || [];

  // Environmental impact data
  const environmentalData = [
    { name: 'CO₂ Saved', value: estimate.co2SavingsKg, color: '#10B981' },
    { name: 'Trees Equivalent', value: Math.round(estimate.co2SavingsKg / 21.77), color: '#059669' }, // 1 tree absorbs ~21.77 kg CO2/year
  ];

  // System overview data
  const systemData = [
    { name: 'Solar Panels', value: estimate.numberOfPanels, color: '#3B82F6' },
    { name: 'System Size (kW)', value: estimate.systemCapacityKw, color: '#6366F1' },
    { name: 'Available Area (m²)', value: systemArea, color: '#8B5CF6' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Solar Energy Estimation Results</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{solarData.location.address || `${solarData.location.lat.toFixed(4)}, ${solarData.location.lng.toFixed(4)}`}</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Annual Energy</p>
              <p className="text-3xl font-bold">{formatNumber(estimate.yearlyEnergyKwh)}</p>
              <p className="text-yellow-100 text-sm">kWh/year</p>
            </div>
            <Sun className="w-12 h-12 text-yellow-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">System Capacity</p>
              <p className="text-3xl font-bold">{estimate.systemCapacityKw}</p>
              <p className="text-blue-100 text-sm">kW ({estimate.numberOfPanels} panels)</p>
            </div>
            <Zap className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">CO₂ Savings</p>
              <p className="text-3xl font-bold">{formatNumber(estimate.co2SavingsKg)}</p>
              <p className="text-green-100 text-sm">kg/year</p>
            </div>
            <Leaf className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Annual Savings</p>
              <p className="text-3xl font-bold">{formatCurrency(estimate.financialSavings?.yearlySavings || 0)}</p>
              <p className="text-emerald-100 text-sm">@ {(estimate.financialSavings?.electricityRate || 0).toFixed(3)}/kWh</p>
            </div>
            <DollarSign className="w-12 h-12 text-emerald-100" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Energy Production */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Energy Production</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'energy' ? `${value} kWh` : `${value} kWh/m²`,
                    name === 'energy' ? 'Energy Production' : 'Solar Irradiance'
                  ]}
                />
                <Bar dataKey="energy" fill="#3B82F6" name="energy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Solar Irradiance Pattern */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Solar Irradiance Pattern</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kWh/m²`, 'Irradiance']} />
                <Line 
                  type="monotone" 
                  dataKey="irradiance" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Technical Specifications */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">System Specifications</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Available Area</span>
              <span className="font-semibold text-gray-900">{systemArea} m²</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Number of Panels</span>
              <span className="font-semibold text-gray-900">{estimate.numberOfPanels}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">System Capacity</span>
              <span className="font-semibold text-gray-900">{estimate.systemCapacityKw} kW</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Optimal Tilt Angle</span>
              <span className="font-semibold text-gray-900">{Math.round(solarData.optimalTilt)}°</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Optimal Azimuth</span>
              <span className="font-semibold text-gray-900">{Math.round(solarData.optimalAzimuth)}°</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Solar Irradiance</span>
              <span className="font-semibold text-gray-900">{Math.round(solarData.yearlyIrradiance)} kWh/m²/year</span>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Environmental Impact</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-green-600 mb-2">{formatNumber(estimate.co2SavingsKg)} kg</h4>
              <p className="text-gray-600">CO₂ emissions prevented annually</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{Math.round(estimate.co2SavingsKg / 21.77)}</p>
                <p className="text-sm text-gray-600">Trees equivalent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{Math.round(estimate.co2SavingsKg / 411)}</p>
                <p className="text-sm text-gray-600">Cars off road</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Calculator className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Calculation Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Calculations assume 22% panel efficiency and 14% system losses (industry standard)</li>
              <li>• Solar irradiance data provided by PVGIS (Photovoltaic Geographical Information System)</li>
              <li>• Financial savings based on regional electricity rates</li>
              <li>• CO₂ savings based on regional grid emission factors</li>
              <li>• Actual performance may vary based on weather, shading, and maintenance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
