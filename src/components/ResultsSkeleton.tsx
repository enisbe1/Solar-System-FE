"use client";

/**
 * ResultsSkeleton — placeholder layout shown while the PVGIS API call is
 * in flight, instead of a generic spinner. Mirrors the SolarResults grid so
 * the eye doesn't jump when real content swaps in.
 *
 * Uses Tailwind's animate-pulse for the shimmer. ~30 lines of CSS-only —
 * no extra dependencies.
 */

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200/80 rounded-lg animate-pulse ${className}`} />;
}

export default function ResultsSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      {/* Title row */}
      <div className="text-center space-y-3">
        <Pulse className="h-8 w-1/3 mx-auto" />
        <Pulse className="h-4 w-1/4 mx-auto" />
      </div>

      {/* Four headline metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-white p-6 shadow-sm h-32 flex flex-col justify-between"
          >
            <Pulse className="h-3 w-1/2" />
            <Pulse className="h-8 w-3/4" />
            <Pulse className="h-3 w-1/3" />
          </div>
        ))}
      </div>

      {/* Payback timeline */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
        <Pulse className="h-5 w-1/4" />
        <Pulse className="h-56 w-full" />
        <Pulse className="h-2 w-full" />
      </div>

      {/* Investment summary strip (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm space-y-2">
            <Pulse className="h-3 w-1/3" />
            <Pulse className="h-6 w-1/2" />
            <Pulse className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
            <Pulse className="h-5 w-1/3" />
            <Pulse className="h-72 w-full" />
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Calculating your solar potential…
      </p>
    </div>
  );
}
