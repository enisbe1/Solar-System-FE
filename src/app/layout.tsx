import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://solar-system-fe.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Solar Energy Calculator — payback, kWh & CO₂ for your roof",
    template: "%s · Solar Energy Calculator",
  },
  description:
    "Free, no-signup web app: pick your roof on a satellite map, draw its outline, and get yearly energy production, financial savings, CO₂ avoided and a payback timeline. Backed by PVGIS solar data.",
  keywords: [
    "solar energy",
    "solar calculator",
    "PVGIS",
    "payback period",
    "photovoltaic",
    "renewable energy",
    "rooftop solar",
    "CO₂ savings",
    "solar panels",
  ],
  authors: [{ name: "Enis Berisha" }],
  applicationName: "Solar Energy Calculator",
  category: "tools",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "Solar Energy Calculator",
    title: "Solar Energy Calculator — payback, kWh & CO₂ for your roof",
    description:
      "Pick your roof on a satellite map, draw the outline, see yearly energy, savings, CO₂ avoided and a payback timeline. PVGIS-backed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Energy Calculator",
    description:
      "Find out if solar makes sense for your roof — in three minutes. PVGIS-backed estimates of energy, payback and CO₂.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1F4E79" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
