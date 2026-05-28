"use client";

/**
 * BatteryComparison — side-by-side scenario card answering the question
 * "should I add a battery, and how big?"
 *
 * Re-runs calculateSolarEstimate three times with batteryKwh in
 * { 0, 10, 20 }, then renders the three results in a comparison table.
 *
 * Highlights the recommended scenario using a simple heuristic:
 *   - The scenario with the highest lifetimeSavingsUsd wins, BUT
 *   - the payback must be ≤ panel lifetime (25 years) — otherwise it
 *     never pays off.
 *   - When two scenarios are within 5% of each other on lifetime savings,
 *     prefer the one with the shorter payback.
 *
 * Generates a plain-language verdict line at the bottom so the user
 * doesn't have to do the trade-off themselves.
 *
 * Pure rendering — the math lives in src/lib/solar-math.ts.
 */

import { useMemo } from "react";
import { Battery, Check } from "lucide-react";
import type { SolarData, SystemSpecs, SolarEstimate } from "@/types/solar";
import { calculateSolarEstimate, COST_PER_KWH_BATTERY_USD } from "@/lib/solar-math";

/**
 * Battery sizes are computed dynamically from the system's installed kWp
 * so the comparison is meaningful at any scale (residential through
 * utility). We pick three "hours of storage" tiers — ~30 min, 1 h and 2 h
 * of system capacity — then snap to a round value so the UI stays clean.
 */
function snapToNice(value: number): number {
  if (value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const mantissa = value / base;
  // Snap to 1, 2, 2.5, 5 of the relevant decade.
  const snap = mantissa <= 1.5 ? 1
            : mantissa <= 2.25 ? 2
            : mantissa <= 3.5  ? 2.5
            : mantissa <= 7.5  ? 5
            : 10;
  return Math.round(snap * base);
}

function computeBatteryScenarios(systemCapacityKwp: number) {
  // Floors so tiny residential systems still see meaningful battery sizes.
  const small  = Math.max(5,  snapToNice(systemCapacityKwp * 0.5));
  const medium = Math.max(10, snapToNice(systemCapacityKwp * 1.0));
  const large  = Math.max(20, snapToNice(systemCapacityKwp * 2.0));
  return [
    { kwh: 0,      label: "No battery",                      blurb: "Grid-tied; exports surplus at the feed-in tariff." },
    { kwh: small,  label: `+ ${small.toLocaleString()} kWh battery`,  blurb: "Half-hour of system capacity; small storage buffer." },
    { kwh: medium, label: `+ ${medium.toLocaleString()} kWh battery`, blurb: "≈ 1 hour of system capacity; typical right-sized battery." },
    { kwh: large,  label: `+ ${large.toLocaleString()} kWh battery`,  blurb: "≈ 2 hours of capacity; larger high-self-consumption buffer." },
  ];
}

interface Props {
  solarData: SolarData;
  systemSpecs: SystemSpecs;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface ScenarioResult {
  kwh: number;
  label: string;
  blurb: string;
  estimate: SolarEstimate;
}

/** Pick the best scenario among the three. See module-level JSDoc. */
function recommendedIndex(scenarios: ScenarioResult[]): number {
  // Filter to scenarios that actually pay off within 25 years.
  const candidates = scenarios
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.estimate.investment?.paybackYears !== null);
  if (candidates.length === 0) return 0; // nothing recovers — show the cheapest

  // Sort by lifetime savings descending.
  candidates.sort(
    (a, b) =>
      (b.s.estimate.investment?.lifetimeSavingsUsd ?? 0) -
      (a.s.estimate.investment?.lifetimeSavingsUsd ?? 0),
  );
  const top = candidates[0];

  // If a smaller scenario is within 5% of `top` on lifetime savings AND
  // has a shorter payback, prefer it (less capital tied up).
  for (const { s, i } of candidates) {
    if (i === top.i) continue;
    const topLife = top.s.estimate.investment?.lifetimeSavingsUsd ?? 0;
    const sLife = s.estimate.investment?.lifetimeSavingsUsd ?? 0;
    const close = topLife > 0 && sLife / topLife >= 0.95;
    const sooner =
      (s.estimate.investment?.paybackYears ?? Infinity) <
      (top.s.estimate.investment?.paybackYears ?? Infinity);
    if (close && sooner) return i;
  }
  return top.i;
}

export default function BatteryComparison({ solarData, systemSpecs }: Props) {
  // Run the three calculations. Memoised because the inputs are objects —
  // we don't want to recompute on every parent render.
  const scenarios: ScenarioResult[] = useMemo(() => {
    // Re-derive capacity from a no-battery estimate so the scenarios scale
    // to the system size, not to a hard-coded 10/20 kWh assumption.
    const baseline = calculateSolarEstimate(solarData, {
      ...systemSpecs,
      batteryKwh: 0,
      selfConsumptionPct: undefined,
      installationCostUsd: undefined,
      batteryCostUsd: undefined,
    });
    const tiers = computeBatteryScenarios(baseline.systemCapacityKw);
    return tiers.map(({ kwh, label, blurb }) => ({
      kwh,
      label,
      blurb,
      estimate: calculateSolarEstimate(solarData, {
        ...systemSpecs,
        batteryKwh: kwh,
        // Let defaultSelfConsumption do its smooth-curve thing.
        selfConsumptionPct: undefined,
        installationCostUsd: undefined,
        batteryCostUsd: undefined,
      }),
    }));
  }, [solarData, systemSpecs]);

  const recIdx = useMemo(() => recommendedIndex(scenarios), [scenarios]);
  const rec = scenarios[recIdx];
  const base = scenarios[0]; // no-battery baseline for the verdict line

  // Build verdict copy.
  const verdict = useMemo(() => {
    if (recIdx === 0) {
      return "Under your current assumptions, a battery doesn't shorten payback enough to be worth the extra cost. Stick with grid-tied.";
    }
    const baseInv = base.estimate.investment;
    const recInv = rec.estimate.investment;
    if (!baseInv || !recInv) return "";
    const extraCost = recInv.installationCostUsd - baseInv.installationCostUsd;
    const extraLifetime = recInv.lifetimeSavingsUsd - baseInv.lifetimeSavingsUsd;
    const payDelta =
      (baseInv.paybackYears ?? 25) - (recInv.paybackYears ?? 25);
    return `Adding the ${rec.kwh} kWh battery costs ${fmtCurrency(extraCost)} more up front, ${
      payDelta > 0 ? `shortens payback by ${payDelta.toFixed(1)} years` : "does not shorten payback"
    } and adds ${fmtCurrency(extraLifetime)} of net savings over 25 years.`;
  }, [base, rec, recIdx]);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Battery className="w-5 h-5 text-blue-500" />
            Should you add a battery?
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Same system, three battery sizes, side-by-side. Battery cost
            estimated at ${COST_PER_KWH_BATTERY_USD.toLocaleString()} per kWh of capacity.
          </p>
        </div>
      </div>

      {/* Three scenario columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc, i) => {
          const isRec = i === recIdx;
          const inv = sc.estimate.investment;
          const fin = sc.estimate.financialSavings;
          const batteryCost = inv?.batteryCostUsd ?? 0;
          return (
            <div
              key={sc.kwh}
              className={
                "relative rounded-xl border p-4 transition-shadow " +
                (isRec
                  ? "border-emerald-300 bg-emerald-50/40 shadow-md ring-1 ring-emerald-200"
                  : "border-gray-200 bg-white")
              }
            >
              {isRec && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium shadow-sm">
                  <Check className="w-3 h-3" /> Recommended
                </span>
              )}

              <p className="text-sm font-semibold text-gray-900">{sc.label}</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5 mb-3">
                {sc.blurb}
              </p>

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Up-front cost</dt>
                  <dd className="font-semibold tabular-nums">
                    {fmtCurrency(inv?.installationCostUsd ?? 0)}
                  </dd>
                </div>
                {batteryCost > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <dt>· of which battery</dt>
                    <dd className="tabular-nums">
                      {fmtCurrency(batteryCost)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">Self-consumption</dt>
                  <dd className="font-medium tabular-nums">
                    {Math.round((fin?.selfConsumptionPct ?? 0) * 100)}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Annual savings</dt>
                  <dd className="font-semibold text-emerald-700 tabular-nums">
                    {fmtCurrency(fin?.yearlySavings ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Payback</dt>
                  <dd className="font-semibold tabular-nums">
                    {inv?.paybackYears !== null && inv?.paybackYears !== undefined
                      ? `${inv.paybackYears.toFixed(1)} yr`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-1.5 mt-1.5">
                  <dt className="text-gray-600">25-yr net</dt>
                  <dd
                    className={
                      "font-bold tabular-nums " +
                      ((inv?.lifetimeSavingsUsd ?? 0) >= 0
                        ? "text-emerald-700"
                        : "text-rose-600")
                    }
                  >
                    {fmtCurrency(inv?.lifetimeSavingsUsd ?? 0)}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      <div className="mt-5 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <strong className="font-semibold">Verdict:</strong> {verdict}
        <p className="mt-1 text-xs text-emerald-800/80">
          Battery sizes shown are illustrative defaults; tune the exact battery
          capacity in the Financial assumptions form above to override.
        </p>
      </div>
    </div>
  );
}
