"use client";

/**
 * InfoTooltip — small (i) icon button that reveals a one-paragraph
 * explanation of a technical term on hover or focus. Used next to labels
 * like "Panel efficiency", "System losses", "Feed-in tariff", etc.
 *
 * Accessible: button has aria-label, the tooltip is announced via aria-describedby
 * when the icon is focused.
 */

import { useState, useId } from "react";
import { Info } from "lucide-react";

interface Props {
  /** Plain-English explanation. Keep it ≤ 2 sentences. */
  children: React.ReactNode;
  /** Optional aria-label (defaults to "More information"). */
  label?: string;
}

export default function InfoTooltip({ children, label = "More information" }: Props) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-gray-400 hover:text-gray-600 focus:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
        >
          {children}
          <span
            aria-hidden
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"
          />
        </span>
      )}
    </span>
  );
}
