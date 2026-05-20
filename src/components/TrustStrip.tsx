"use client";

/**
 * TrustStrip — three pillars of trust shown below the form: where the data
 * comes from, how it's calculated, and the privacy stance. Closes the
 * "is this just a marketing form?" objection before the user types
 * anything.
 */

import { Database, BookOpen, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Database,
    title: "Authoritative data sources",
    body: "Solar irradiance and PV yield come from PVGIS — the European Commission's photovoltaic geographical information system. Satellite imagery and reverse geocoding via Google Maps.",
  },
  {
    icon: BookOpen,
    title: "Transparent methodology",
    body: "Every metric expands into a 'how is this calculated?' panel showing the formula with your actual numbers. No black boxes.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    body: "No accounts, no cookies, no tracking. Your location and results never leave your browser. PDF reports are generated client-side.",
  },
];

export default function TrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Built on real solar data — not guesses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <Icon className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
