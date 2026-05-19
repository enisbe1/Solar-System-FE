"use client";

import { MapPin } from "lucide-react";
import type { Location } from "@/types/solar";

/**
 * Five EU reference cities used both as quick-test locations in the UI and
 * as cross-check points for calculation accuracy in TC-FUNC-01 / R-T-4
 * (see Phase-1 portfolio document, §6.3 and §3).
 */
const PRESETS: Array<Location & { name: string }> = [
  { name: "Berlin",    lat: 52.5200, lng: 13.4050, address: "Berlin, Germany" },
  { name: "Madrid",    lat: 40.4168, lng: -3.7038, address: "Madrid, Spain" },
  { name: "Athens",    lat: 37.9838, lng: 23.7275, address: "Athens, Greece" },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, address: "Stockholm, Sweden" },
  { name: "Lisbon",    lat: 38.7223, lng: -9.1393, address: "Lisbon, Portugal" },
];

interface Props {
  onSelect: (location: Location) => void;
  selectedLat?: number;
  selectedLng?: number;
}

export default function QuickPresets({ onSelect, selectedLat, selectedLng }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="flex items-center gap-1 text-gray-500">
        <MapPin className="w-3 h-3" />
        Quick locations:
      </span>
      {PRESETS.map((p) => {
        const active =
          selectedLat !== undefined &&
          selectedLng !== undefined &&
          Math.abs(selectedLat - p.lat) < 0.01 &&
          Math.abs(selectedLng - p.lng) < 0.01;
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => onSelect(p)}
            className={
              "px-2.5 py-1 rounded-full border transition-colors " +
              (active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
            aria-pressed={active}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
