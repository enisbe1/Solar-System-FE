"use client";

/**
 * Hero — landing-section header.
 *
 * Two-column layout (single column on mobile):
 *   - Left:  pitch headline, sub-headline, benefit chips, CTA button
 *   - Right: an "Example output" card showing typical Berlin results
 *
 * Behaviour:
 *   - The CTA button smooth-scrolls to <main> ("Let's analyse your roof"
 *     section) so users land on the form in one click.
 */

import { Sun, Sparkles, Lock, Zap, ArrowDown } from "lucide-react";

function scrollToForm() {
  if (typeof window === "undefined") return;
  // The "Let's analyse your roof" heading lives inside <main>.
  // Smooth-scroll to the top of that landmark.
  const el = document.querySelector("main");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background: gradient + subtle solar/geometric pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(59,130,246,.20), transparent 35%), radial-gradient(circle at 85% 5%, rgba(251,146,60,.22), transparent 40%), radial-gradient(circle at 70% 90%, rgba(16,185,129,.10), transparent 50%)",
        }}
      />
      {/* Sun motif — very low opacity decorative */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 w-72 h-72 -z-10 text-yellow-300 opacity-25"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="32" fill="currentColor" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 100 + 44 * Math.cos(a);
          const y1 = 100 + 44 * Math.sin(a);
          const x2 = 100 + 80 * Math.cos(a);
          const y2 = 100 + 80 * Math.sin(a);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          {/* ---- Left column: pitch (3/5 wide on desktop) ---- */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-7 h-7 text-yellow-500" />
              <span className="text-sm font-semibold tracking-wide text-blue-900">
                SOLAR ENERGY CALCULATOR
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-[1.05] max-w-3xl">
              Find out if solar makes sense for your roof —{" "}
              <span className="text-blue-600">in three minutes</span>.
            </h1>

            <p className="mt-5 text-lg text-gray-600 max-w-2xl leading-relaxed">
              Pick your roof on a satellite map, tell us how big it is, and
              we&apos;ll show you the yearly energy you&apos;d produce, the money
              you&apos;d save, the CO₂ you&apos;d avoid, and when the system would
              pay itself off — all backed by the European Commission&apos;s PVGIS
              solar dataset.
            </p>

            {/* Benefit chips */}
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Free · no signup
              </span>
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                PVGIS-backed accuracy
              </span>
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
                <Lock className="w-4 h-4 text-blue-500" />
                Nothing leaves your browser
              </span>
            </div>

            {/* Primary CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Calculate my roof
                <ArrowDown className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                Takes about a minute. No account needed.
              </span>
            </div>
          </div>

          {/* ---- Right column: example output card (2/5 wide on desktop) ---- */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Subtle tilt + shadow so it looks like a real result card */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-emerald-200/40 rounded-2xl blur-2xl -z-10" />
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    What you&apos;ll see
                  </p>
                  <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    EXAMPLE · BERLIN · 50 m²
                  </span>
                </div>

                <dl className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-gray-600">Annual energy</dt>
                    <dd className="text-xl font-bold text-gray-900 tabular-nums">
                      10,350 <span className="text-sm font-medium text-gray-500">kWh</span>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-gray-600">System size</dt>
                    <dd className="text-xl font-bold text-gray-900 tabular-nums">
                      10.0 <span className="text-sm font-medium text-gray-500">kWp</span>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-gray-600">Annual savings</dt>
                    <dd className="text-xl font-bold text-emerald-700 tabular-nums">
                      €2,200
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-gray-600">CO₂ avoided</dt>
                    <dd className="text-xl font-bold text-gray-900 tabular-nums">
                      2.86 <span className="text-sm font-medium text-gray-500">t/year</span>
                    </dd>
                  </div>

                  {/* Payback — the headline number, made bigger */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-baseline justify-between">
                      <dt className="text-sm font-medium text-gray-700">Payback period</dt>
                      <dd className="text-2xl font-extrabold text-blue-700 tabular-nums">
                        11.5 <span className="text-sm font-medium text-gray-500">years</span>
                      </dd>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Then ~13 years of pure profit. With a 10 kWh battery,
                      payback shortens to ≈9 years.
                    </p>
                  </div>
                </dl>
              </div>
              <p className="mt-3 text-center text-xs text-gray-500">
                Your actual numbers depend on your location and roof size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
