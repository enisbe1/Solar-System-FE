"use client";

/**
 * SolarReportPDF — a clean, one-page PDF report of the calculation result.
 *
 * Realises the "Export Results (future)" use case from the Phase-1 portfolio
 * (Figure 2) and the "PDF Export: Downloadable reports" entry in §7.7.
 *
 * Built on @react-pdf/renderer so the report:
 *   - is generated entirely client-side (matches NFR-SEC-4: no personal data
 *     leaves the browser),
 *   - inherits the same React component model as the rest of the UI,
 *   - prints reliably across browsers (no html2canvas / DOM-scrape mess).
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { SolarData, SolarEstimate, SystemSpecs } from "@/types/solar";
import { treesEquivalent } from "@/lib/solar-math";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
  },
  header: {
    borderBottom: "2 solid #1F4E79",
    paddingBottom: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1F4E79",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1F4E79",
    marginBottom: 6,
    borderBottom: "1 solid #E5E7EB",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  label: { color: "#4B5563" },
  value: { fontWeight: 700 },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  metricCard: {
    width: "48%",
    margin: "4 1%",
    padding: 10,
    border: "1 solid #E5E7EB",
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1F4E79",
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 2,
  },

  monthlyTable: {
    border: "1 solid #E5E7EB",
    borderRadius: 4,
  },
  monthRow: {
    flexDirection: "row",
    borderBottom: "1 solid #F3F4F6",
  },
  monthCell: {
    flex: 1,
    padding: 4,
    fontSize: 9,
    textAlign: "center",
  },
  monthHeader: {
    fontWeight: 700,
    backgroundColor: "#F9FAFB",
    color: "#374151",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9CA3AF",
    borderTop: "1 solid #E5E7EB",
    paddingTop: 8,
  },
});

interface ReportProps {
  estimate: SolarEstimate;
  solarData: SolarData;
  systemSpecs: SystemSpecs;
  generatedAt?: Date;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function SolarReport({ estimate, solarData, systemSpecs, generatedAt }: ReportProps) {
  const when = generatedAt ?? new Date();
  const trees = treesEquivalent(estimate.co2SavingsKg);
  const rate = estimate.financialSavings?.electricityRate ?? 0;
  const usedOverride = systemSpecs.electricityRateOverride !== undefined;

  return (
    <Document
      title="Solar Energy Estimate"
      author="Solar Energy Calculator"
      subject={`Solar PV estimate — ${solarData.location.lat.toFixed(3)}, ${solarData.location.lng.toFixed(3)}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Solar Energy Estimate</Text>
          <Text style={styles.subtitle}>
            Generated {when.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
            {"  ·  "}
            Solar Energy Calculator (PVGIS-backed)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>
              {solarData.location.address ??
                `${solarData.location.lat.toFixed(4)}, ${solarData.location.lng.toFixed(4)}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coordinates</Text>
            <Text style={styles.value}>
              {solarData.location.lat.toFixed(4)}, {solarData.location.lng.toFixed(4)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Optimal tilt / azimuth</Text>
            <Text style={styles.value}>
              {solarData.optimalTilt.toFixed(0)}° / {solarData.optimalAzimuth.toFixed(0)}°
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Yearly irradiance</Text>
            <Text style={styles.value}>
              {formatNumber(Math.round(solarData.yearlyIrradiance))} kWh/m²/year
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Available area</Text>
            <Text style={styles.value}>{formatNumber(systemSpecs.area)} m²</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Panel efficiency</Text>
            <Text style={styles.value}>{systemSpecs.panelEfficiency}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>System losses</Text>
            <Text style={styles.value}>{systemSpecs.systemLosses}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Panel power · area</Text>
            <Text style={styles.value}>
              {systemSpecs.panelPower} W · {systemSpecs.panelArea} m²
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Headline metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Yearly Energy</Text>
              <Text style={styles.metricValue}>{formatNumber(estimate.yearlyEnergyKwh)}</Text>
              <Text style={styles.metricUnit}>kWh / year</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>System capacity</Text>
              <Text style={styles.metricValue}>{estimate.systemCapacityKw.toFixed(2)}</Text>
              <Text style={styles.metricUnit}>kWp · {estimate.numberOfPanels} panels</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>CO₂ avoided</Text>
              <Text style={styles.metricValue}>{formatNumber(estimate.co2SavingsKg)}</Text>
              <Text style={styles.metricUnit}>kg / year · ≈ {trees} trees</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Annual savings</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(estimate.financialSavings?.yearlySavings ?? 0)}
              </Text>
              <Text style={styles.metricUnit}>
                @ {rate.toFixed(3)} USD/kWh {usedOverride ? "(user-set)" : "(regional default)"}
              </Text>
            </View>
          </View>
        </View>

        {estimate.investment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment &amp; payback</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Installation cost</Text>
              <Text style={styles.value}>
                {formatCurrency(estimate.investment.installationCostUsd)}
                {estimate.investment.batteryCostUsd > 0
                  ? `  (incl. ${formatCurrency(estimate.investment.batteryCostUsd)} battery)`
                  : ""}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Battery capacity</Text>
              <Text style={styles.value}>
                {(systemSpecs.batteryKwh ?? 0) > 0
                  ? `${systemSpecs.batteryKwh} kWh`
                  : "none"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Self-consumption</Text>
              <Text style={styles.value}>
                {Math.round(((estimate.financialSavings?.selfConsumptionPct) ?? 0) * 100)}%{" "}
                ({formatNumber(estimate.financialSavings?.selfConsumedKwh ?? 0)} kWh on-site,
                {" "}{formatNumber(estimate.financialSavings?.exportedKwh ?? 0)} kWh exported)
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Retail / feed-in rate</Text>
              <Text style={styles.value}>
                {(estimate.financialSavings?.electricityRate ?? 0).toFixed(3)} /
                {(estimate.financialSavings?.feedInRate ?? 0).toFixed(3)} USD/kWh
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payback period</Text>
              <Text style={styles.value}>
                {estimate.investment.paybackYears !== null
                  ? `${estimate.investment.paybackYears.toFixed(1)} years`
                  : "no payback under current assumptions"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>25-year net savings</Text>
              <Text style={styles.value}>
                {formatCurrency(estimate.investment.lifetimeSavingsUsd)}
              </Text>
            </View>
          </View>
        )}

        {estimate.monthlySavings && estimate.monthlySavings.length === 12 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly energy production (kWh)</Text>
            <View style={styles.monthlyTable}>
              <View style={styles.monthRow}>
                {MONTHS.map((m) => (
                  <Text key={m} style={{ ...styles.monthCell, ...styles.monthHeader }}>
                    {m}
                  </Text>
                ))}
              </View>
              <View style={styles.monthRow}>
                {estimate.monthlySavings.map((v, i) => (
                  <Text key={i} style={styles.monthCell}>
                    {formatNumber(Math.round(v))}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assumptions &amp; disclaimers</Text>
          <Text style={{ color: "#4B5563", lineHeight: 1.5 }}>
            Irradiance and PV yield (E_y) data sourced from PVGIS (European Commission);
            historical window 2016–2020. Yearly energy uses PVGIS&apos;s measured yield in
            kWh/kWp, scaled to the user-supplied system-losses figure. Financial savings
            split between on-site self-consumption (retail rate) and exported energy
            (feed-in tariff) using the percentages shown. Installation cost estimated at
            ≈$1,650/kWp + $700/kWh battery unless overridden. CO₂ factor uses regional
            grid averages. Estimates are for guidance only — consult a certified installer
            for a binding quote.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          Solar Energy Calculator · solar-system-fe · PVGIS &amp; Google Maps data ·
          Generated client-side, no personal data transmitted.
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Wrapper that renders the "Download PDF" button with the link.
 * Disabled until the PDF blob is ready.
 */
interface DownloadButtonProps {
  estimate: SolarEstimate;
  solarData: SolarData;
  systemSpecs: SystemSpecs;
}

export default function DownloadPdfButton({
  estimate,
  solarData,
  systemSpecs,
}: DownloadButtonProps) {
  const date = new Date().toISOString().slice(0, 10);
  const safeAddr = (solarData.location.address || "report")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const fileName = `solar-estimate_${safeAddr}_${date}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <SolarReport
          estimate={estimate}
          solarData={solarData}
          systemSpecs={systemSpecs}
        />
      }
      fileName={fileName}
    >
      {({ loading, error }) => (
        <button
          type="button"
          disabled={loading || !!error}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {loading ? "Preparing PDF…" : error ? "PDF failed" : "Download PDF report"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
