"use client";

/**
 * PaybackTimeline — interactive chart that visualises the payback story.
 *
 * Plots cumulative net savings over the 25-year panel lifetime:
 *   year 0  →  -installationCost  (negative — you just paid for the system)
 *   year N  →  -cost + N * yearlySavings
 *   year 25 →  lifetimeSavings  (positive — pure profit)
 *
 * Includes:
 *   - An area fill that turns from red (below break-even) to green (above).
 *   - A reference line at the break-even point (= paybackYears).
 *   - A draggable year scrubber so the user can answer "at year N how am I
 *     doing?" without doing arithmetic.
 *
 * Mathematics matches the lifetime-savings formula in src/lib/solar-math.ts
 * (yearlySavings * years - installationCost), so this component never makes
 * an inference the back end wouldn't make.
 */

import { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, ReferenceDot,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { SolarEstimate } from "@/types/solar";

const LIFETIME_YEARS = 25;

interface Props {
  estimate: SolarEstimate;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PaybackTimeline({ estimate }: Props) {
  const investment = estimate.investment;
  const yearlySavings = estimate.financialSavings?.yearlySavings ?? 0;

  // Build the 26-point timeline (years 0..25 inclusive).
  const data = useMemo(() => {
    if (!investment) return [];
    const cost = investment.installationCostUsd;
    return Array.from({ length: LIFETIME_YEARS + 1 }, (_, year) => {
      const cumulative = -cost + yearlySavings * year;
      return {
        year,
        cumulative,
        // Two series so we can fill below zero red and above zero green:
        below: cumulative < 0 ? cumulative : 0,
        above: cumulative >= 0 ? cumulative : 0,
      };
    });
  }, [investment, yearlySavings]);

  const [scrubYear, setScrubYear] = useState<number>(() => {
    if (!investment?.paybackYears) return LIFETIME_YEARS;
    return Math.min(LIFETIME_YEARS, Math.ceil(investment.paybackYears));
  });

  if (!investment || data.length === 0) return null;

  const cost = investment.installationCostUsd;
  const breakEven = investment.paybackYears;
  const scrubbed = data[scrubYear];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Payback timeline (25 years)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Cumulative net savings from day one through year 25. Drag the
            slider to inspect any year.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border rounded-lg px-4 py-3 min-w-[230px]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Year {scrubYear}
          </p>
          <p
            className={
              "text-2xl font-bold " +
              (scrubbed.cumulative >= 0 ? "text-emerald-600" : "text-rose-600")
            }
          >
            {formatCurrency(scrubbed.cumulative)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {scrubbed.cumulative >= 0
              ? `Net profit so far — you broke even ${breakEven?.toFixed(1)} years in`
              : `Still ${formatCurrency(-scrubbed.cumulative)} below break-even`}
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="paybackGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10B981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="paybackRed" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor="#F43F5E" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickFormatter={(v) => `Y${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 12,
              }}
            />

            {/* Break-even reference line + dot */}
            {breakEven !== null && breakEven > 0 && breakEven <= LIFETIME_YEARS && (
              <>
                <ReferenceLine
                  x={breakEven}
                  stroke="#1F4E79"
                  strokeDasharray="4 4"
                  label={{
                    value: `Break-even • Y${breakEven.toFixed(1)}`,
                    position: "top",
                    fill: "#1F4E79",
                    fontSize: 11,
                  }}
                />
                <ReferenceDot
                  x={breakEven}
                  y={0}
                  r={4}
                  fill="#1F4E79"
                  stroke="white"
                  strokeWidth={2}
                />
              </>
            )}
            <ReferenceLine y={0} stroke="#9CA3AF" />

            {/* Year scrubber position */}
            <ReferenceLine
              x={scrubYear}
              stroke="#F59E0B"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />

            <Area
              type="monotone"
              dataKey="below"
              stroke="#F43F5E"
              fill="url(#paybackRed)"
              isAnimationActive
              animationDuration={900}
            />
            <Area
              type="monotone"
              dataKey="above"
              stroke="#10B981"
              fill="url(#paybackGreen)"
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Year scrubber slider */}
      <div className="mt-4">
        <label
          htmlFor="payback-scrubber"
          className="flex items-center justify-between text-xs text-gray-600 mb-1"
        >
          <span>Year 0</span>
          <span className="font-medium text-gray-700">
            Inspect year {scrubYear} / {LIFETIME_YEARS}
          </span>
          <span>Year {LIFETIME_YEARS}</span>
        </label>
        <input
          id="payback-scrubber"
          type="range"
          min={0}
          max={LIFETIME_YEARS}
          step={1}
          value={scrubYear}
          onChange={(e) => setScrubYear(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gradient-to-r from-rose-200 via-yellow-200 to-emerald-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Bottom strip — paid back so far / still to recoup */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500 text-xs">Installation cost</p>
          <p className="font-semibold text-gray-900">{formatCurrency(cost)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500 text-xs">Recovered by year {scrubYear}</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(Math.min(cost, yearlySavings * scrubYear))}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500 text-xs">Net at year 25</p>
          <p
            className={
              "font-semibold " +
              ((investment.lifetimeSavingsUsd ?? 0) >= 0
                ? "text-emerald-600"
                : "text-rose-600")
            }
          >
            {formatCurrency(investment.lifetimeSavingsUsd)}
          </p>
        </div>
      </div>
    </div>
  );
}
