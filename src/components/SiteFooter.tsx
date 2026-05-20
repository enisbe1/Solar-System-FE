"use client";

/**
 * SiteFooter — polished page footer. Replaces the bland centered text with
 * a three-column layout: about / data sources / project links. Includes the
 * GitHub link, course attribution and the always-needed disclaimer.
 */

import { Github, ExternalLink } from "lucide-react";

const GITHUB_URL = "https://github.com/enisbe1/Solar-System-FE";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Solar Energy Calculator</h3>
          <p className="text-gray-600 leading-relaxed">
            A free, no-signup tool that uses authoritative European solar data
            to estimate the photovoltaic potential of a specific roof.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Data &amp; methods</h3>
          <ul className="space-y-1 text-gray-600">
            <li>
              <a
                href="https://re.jrc.ec.europa.eu/pvg_tools/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 inline-flex items-center gap-1"
              >
                PVGIS (European Commission) <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/maps/documentation/javascript"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 inline-flex items-center gap-1"
              >
                Google Maps JS API <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://www.w3.org/TR/WCAG21/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 inline-flex items-center gap-1"
              >
                WCAG 2.1 (accessibility target) <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Open-source project</h3>
          <ul className="space-y-1 text-gray-600">
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 inline-flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                github.com/enisbe1/Solar-System-FE
              </a>
            </li>
            <li>
              Course: <span className="text-gray-700">DLMCSPSE01 — Project: Software Engineering</span>
            </li>
            <li className="text-gray-500">v0.2 · Phase 2</li>
          </ul>
        </div>
      </div>

      <div className="border-t bg-white">
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-500 leading-relaxed">
          Estimates are for guidance only. Actual installation performance varies
          with shading, weather, panel quality, inverter efficiency and local
          regulations. Always consult a certified installer for a binding quote.
        </p>
      </div>
    </footer>
  );
}
