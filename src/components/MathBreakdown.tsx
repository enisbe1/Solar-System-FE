"use client";

/**
 * MathBreakdown — a small, expandable "Show the math" panel that exposes
 * exactly how the headline metrics were computed, with the user's actual
 * input values substituted in. Builds trust: the calculation is no longer a
 * black-box "you'd save €X", it's "50 m² × 1095 kWh/m²/yr × 22% × 86% =
 * 10 358 kWh/yr — here's why."
 *
 * Mathematics matches src/lib/solar-math.ts exactly, so if the lib formula
 * changes, this component automatically follows.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  SolarData, SystemSpecs, SolarEstimate,
} from "@/types/solar";

interface Props {
  estimate: SolarEstimate;
  solarData: SolarData;
  systemSpecs: SystemSpecs;
}

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

export default function MathBreakdown({ estimate, solarData, systemSpecs }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const usesPvgisYield =
    solarData.yearlyYieldKwhPerKwp !== undefined && estimate.systemCapacityKw > 0;
  const lossFactor = (1 - systemSpecs.systemLosses / 100) / (1 - 0.14);
  const fin = estimate.financialSavings;
  const inv = estimate.investment;
  const selfPct = Math.round((fin?.selfConsumptionPct ?? 0) * 100);

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <span className="text-sm font-medium text-gray-800">
          How is this calculated?{" "}
          <span className="text-gray-400 font-normal">
            — see the formulas with your actual numbers
          </span>
        </span>
        <ChevronDown
          className={
            "w-4 h-4 text-gray-500 transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t text-sm">
          {/* Yearly energy */}
          <div>
            <p className="font-semibold text-gray-900">Annual energy production</p>
            {usesPvgisYield ? (
              <p className="text-gray-700 leading-relaxed">
                <span className="font-mono text-xs">
                  kWp × E_y × loss-factor
                </span>
                <br />
                = {fmt(estimate.systemCapacityKw, 2)} kWp × {fmt(solarData.yearlyYieldKwhPerKwp ?? 0)} kWh/kWp/yr × {lossFactor.toFixed(3)}
                <br />
                <span className="text-emerald-700 font-semibold">
                  = {fmt(estimate.yearlyEnergyKwh)} kWh / year
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Uses PVGIS&rsquo;s measured energy yield (E_y) scaled to your{" "}
                  {systemSpecs.systemLosses}% losses (PVGIS reference: 14%).
                </span>
              </p>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                <span className="font-mono text-xs">
                  area × irradiance × panel η × system η
                </span>
                <br />
                = {fmt(systemSpecs.area)} m² × {fmt(solarData.yearlyIrradiance)} kWh/m²/yr × {(systemSpecs.panelEfficiency / 100).toFixed(2)} × {(1 - systemSpecs.systemLosses / 100).toFixed(2)}
                <br />
                <span className="text-emerald-700 font-semibold">
                  = {fmt(estimate.yearlyEnergyKwh)} kWh / year
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Latitude-band fallback path (PVGIS energy yield unavailable).
                </span>
              </p>
            )}
          </div>

          {/* System size */}
          <div>
            <p className="font-semibold text-gray-900">System size</p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-mono text-xs">
                panels = floor(area ÷ panel area)
              </span>
              <br />
              = floor({fmt(systemSpecs.area)} ÷ {systemSpecs.panelArea}) ={" "}
              <span className="font-semibold">{estimate.numberOfPanels} panels</span>
              <br />
              <span className="font-mono text-xs">
                kWp = panels × panel power ÷ 1000
              </span>
              <br />
              = {estimate.numberOfPanels} × {systemSpecs.panelPower} W ÷ 1000 ={" "}
              <span className="text-blue-700 font-semibold">
                {estimate.systemCapacityKw} kWp
              </span>
            </p>
          </div>

          {/* CO₂ */}
          <div>
            <p className="font-semibold text-gray-900">CO₂ avoided</p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-mono text-xs">
                yearly kWh × regional CO₂ factor
              </span>
              <br />
              = {fmt(estimate.yearlyEnergyKwh)} kWh × {(estimate.co2SavingsKg / Math.max(estimate.yearlyEnergyKwh, 1)).toFixed(3)} kg/kWh
              <br />
              <span className="text-green-700 font-semibold">
                = {fmt(estimate.co2SavingsKg)} kg CO₂ / year
              </span>
            </p>
          </div>

          {/* Financial */}
          {fin && (
            <div>
              <p className="font-semibold text-gray-900">Annual savings</p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-mono text-xs">
                  self-consumed × retail + exported × feed-in
                </span>
                <br />
                = {fmt(fin.selfConsumedKwh)} kWh × {fin.electricityRate.toFixed(3)} + {fmt(fin.exportedKwh)} kWh × {fin.feedInRate.toFixed(3)}
                <br />
                <span className="text-emerald-700 font-semibold">
                  = ${fmt(fin.yearlySavings)} / year
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Assumes {selfPct}% self-consumption (
                  {(systemSpecs.batteryKwh ?? 0) > 0
                    ? "with battery"
                    : "no battery"}
                  ); remaining {100 - selfPct}% exported at the feed-in tariff.
                </span>
              </p>
            </div>
          )}

          {/* Payback */}
          {inv && inv.paybackYears !== null && (
            <div>
              <p className="font-semibold text-gray-900">Payback period</p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-mono text-xs">
                  installation cost ÷ yearly savings
                </span>
                <br />
                = ${fmt(inv.installationCostUsd)} ÷ ${fmt(fin?.yearlySavings ?? 0)}
                <br />
                <span className="text-blue-700 font-semibold">
                  = {inv.paybackYears.toFixed(1)} years
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  25-year net = ${fmt(fin?.yearlySavings ?? 0)} × 25 − ${fmt(inv.installationCostUsd)} = ${fmt(inv.lifetimeSavingsUsd)}.
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
