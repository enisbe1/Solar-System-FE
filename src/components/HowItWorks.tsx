"use client";

/**
 * HowItWorks — three numbered cards explaining the flow before the user
 * encounters the form. Cheap visual contract: pick → describe → analyse.
 */

import { MapPin, Settings, Calculator } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: MapPin,
    title: "Pick your roof",
    body: "Search an address or click anywhere on the satellite map. You can even draw the roof outline to get the exact area in m².",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    n: 2,
    icon: Settings,
    title: "Describe the system",
    body: "Available area, panel efficiency, system losses, optionally a battery, tariff and installation cost. Sensible defaults included.",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    n: 3,
    icon: Calculator,
    title: "Get the verdict",
    body: "Yearly kWh, financial savings, CO₂ avoided, system size and a payback timeline with a draggable year scrubber. Export a PDF report when you're done.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map(({ n, icon: Icon, title, body, color }) => (
          <div
            key={n}
            className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Step {n}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
