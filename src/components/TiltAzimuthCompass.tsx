"use client";

/**
 * TiltAzimuthCompass — tiny inline SVG that visualises a solar panel's
 * optimal orientation. Shows:
 *   - a north-marked compass ring,
 *   - an arrow rotating to the azimuth value (0° N, 90° E, 180° S, 270° W),
 *   - a side-view stub of a panel tilted at the given angle.
 *
 * Replaces the numeric "Optimal tilt 35°, azimuth 180°" line with something
 * a homeowner can actually read at a glance.
 */

interface Props {
  tiltDegrees: number;     // 0..90
  azimuthDegrees: number;  // 0..360 (0 = N)
  size?: number;
}

export default function TiltAzimuthCompass({
  tiltDegrees,
  azimuthDegrees,
  size = 130,
}: Props) {
  const r = (size / 2) - 6;
  const cx = size / 2;
  const cy = size / 2;

  // Compass arrow endpoint — point at the chosen azimuth.
  // Note: in our coord system, 0° = up (north), and angle increases clockwise.
  const rad = (azimuthDegrees - 90) * (Math.PI / 180); // rotate so 0° → up
  const arrowX = cx + r * 0.7 * Math.cos(rad);
  const arrowY = cy + r * 0.7 * Math.sin(rad);

  // Cardinal labels
  const labels = [
    { l: "N", x: cx, y: cy - r + 8 },
    { l: "E", x: cx + r - 6, y: cy + 3 },
    { l: "S", x: cx, y: cy + r - 3 },
    { l: "W", x: cx - r + 8, y: cy + 3 },
  ];

  // Tilt mini side-view (bottom right corner)
  // Panel as a slanted rectangle anchored to the baseline.
  const tiltSize = size * 0.32;
  const tiltX = size - tiltSize - 6;
  const tiltY = size - tiltSize / 2 - 14;
  const baselineY = tiltY + tiltSize / 2;
  const tiltRad = (tiltDegrees * Math.PI) / 180;
  // Panel start at (tiltX, baselineY); ends at the tilt angle.
  const panelLen = tiltSize * 0.9;
  const panelEndX = tiltX + panelLen * Math.cos(tiltRad);
  const panelEndY = baselineY - panelLen * Math.sin(tiltRad);

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Compass outer ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="white" stroke="#1F4E79" strokeWidth={1.5}
        />
        {/* Cardinal ticks */}
        {[0, 90, 180, 270].map((deg) => {
          const a = (deg - 90) * (Math.PI / 180);
          const x1 = cx + (r - 4) * Math.cos(a);
          const y1 = cy + (r - 4) * Math.sin(a);
          const x2 = cx + r * Math.cos(a);
          const y2 = cy + r * Math.sin(a);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#1F4E79" strokeWidth={1.5}
            />
          );
        })}
        {labels.map(({ l, x, y }) => (
          <text
            key={l}
            x={x} y={y}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            fill="#1F4E79"
          >
            {l}
          </text>
        ))}

        {/* Azimuth arrow */}
        <line
          x1={cx} y1={cy} x2={arrowX} y2={arrowY}
          stroke="#F59E0B" strokeWidth={3} strokeLinecap="round"
        />
        <circle cx={arrowX} cy={arrowY} r={4} fill="#F59E0B" />
        <circle cx={cx} cy={cy} r={2.5} fill="#1F4E79" />

        {/* Tilt mini side-view */}
        <line
          x1={tiltX - 4} y1={baselineY}
          x2={tiltX + tiltSize + 4} y2={baselineY}
          stroke="#9CA3AF" strokeWidth={1}
        />
        <line
          x1={tiltX} y1={baselineY}
          x2={panelEndX} y2={panelEndY}
          stroke="#10B981" strokeWidth={4} strokeLinecap="round"
        />
        <text
          x={tiltX + tiltSize / 2} y={size - 2}
          textAnchor="middle" fontSize={8} fill="#6B7280"
        >
          tilt
        </text>
      </svg>

      <div className="text-xs text-gray-700 leading-tight">
        <p className="font-semibold text-gray-900 mb-0.5">Panel orientation</p>
        <p>
          Tilt: <span className="font-medium">{Math.round(tiltDegrees)}°</span>
        </p>
        <p>
          Azimuth: <span className="font-medium">{Math.round(azimuthDegrees)}°</span>
          {" "}
          <span className="text-gray-500">
            (
            {azimuthDegrees >= 157 && azimuthDegrees <= 203
              ? "south"
              : azimuthDegrees < 23 || azimuthDegrees > 337
                ? "north"
                : azimuthDegrees < 157
                  ? "southeast / east"
                  : "southwest / west"}
            )
          </span>
        </p>
      </div>
    </div>
  );
}
