"use client";

/**
 * Hero — landing-section header. Replaces the small grey header with a
 * proper above-the-fold pitch: value prop, three benefit chips, and an
 * example outcome teaser. Sets the right expectation for the rest of the
 * page (this is a serious tool, not a marketing form).
 */

import { Sun, Sparkles, Lock, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(251,146,60,.18), transparent 40%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-5">
          <Sun className="w-7 h-7 text-yellow-500" />
          <span className="text-sm font-semibold tracking-wide text-blue-900">
            SOLAR ENERGY CALCULATOR
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
          Find out if solar makes sense for your roof —{" "}
          <span className="text-blue-600">in three minutes</span>.
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-2xl leading-relaxed">
          Pick your roof on a satellite map, tell us how big it is, and we&apos;ll
          show you the yearly energy you&apos;d produce, the money you&apos;d save, the
          CO₂ you&apos;d avoid, and when the system would pay itself off — all backed
          by the European Commission&apos;s PVGIS solar dataset.
        </p>

        {/* Benefit chips */}
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Free · no signup
          </span>
          <span className="inline-flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            PVGIS-backed accuracy
          </span>
          <span className="inline-flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            <Lock className="w-4 h-4 text-blue-500" />
            Nothing leaves your browser
          </span>
        </div>

        {/* Example outcome teaser */}
        <p className="mt-6 text-sm text-gray-500 max-w-xl">
          <span className="font-medium text-gray-700">Example:</span> a 50 m²
          rooftop in Berlin typically produces ≈ 10 350 kWh / year, saves about
          €2 200, and pays itself off in roughly 11 years.
        </p>
      </div>
    </section>
  );
}
