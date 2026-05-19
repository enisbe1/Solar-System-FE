/**
 * /api/calculate
 *
 * Thin HTTP wrapper around the pure functions in src/lib/solar-math.ts.
 * Keeping the math in a separate, dependency-free module lets us unit-test
 * the calculation (see tests/solar-math.test.ts) without spinning up a
 * Next.js server. The Phase-1 portfolio document refers to this layout in
 * §7.6 (design decision D-2 — API routes as a thin transport layer).
 */

import { NextRequest, NextResponse } from "next/server";
import { SolarData, SystemSpecs } from "@/types/solar";
import { calculateSolarEstimate } from "@/lib/solar-math";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solarData, systemSpecs }: { solarData: SolarData; systemSpecs: SystemSpecs } = body;

    if (!solarData || !systemSpecs) {
      return NextResponse.json(
        { error: "Solar data and system specifications are required" },
        { status: 400 },
      );
    }

    if (
      systemSpecs.area <= 0 ||
      systemSpecs.panelEfficiency <= 0 ||
      systemSpecs.panelEfficiency > 100 ||
      systemSpecs.systemLosses < 0 ||
      systemSpecs.systemLosses > 50 ||
      systemSpecs.panelArea <= 0 ||
      systemSpecs.panelPower <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid system specifications" },
        { status: 400 },
      );
    }

    const estimate = calculateSolarEstimate(solarData, systemSpecs);
    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
