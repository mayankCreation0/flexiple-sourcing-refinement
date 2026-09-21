'use client';

interface TribalBackgroundProps {
  className?: string;
  opacity?: number;
  color?: string;
  size?: number;
}

/**
 * Reusable animated SVG tribal geometric pattern overlay.
 * Renders two concentric rotating hexagonal lattice rings.
 */
export default function TribalBackground({
  className = '',
  opacity = 0.15,
  color = '#00FFFF',
  size = 300,
}: TribalBackgroundProps) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Outer slowly rotating ring */}
        <g style={{ transformOrigin: '150px 150px', animation: 'tribal-spin 30s linear infinite' }}>
          <polygon
            points="150,20 265,80 265,220 150,280 35,220 35,80"
            stroke={color}
            strokeWidth="0.8"
            fill="none"
            opacity="0.6"
          />
          <polygon
            points="150,40 245,95 245,205 150,260 55,205 55,95"
            stroke={color}
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
          {/* Corner triangle accents */}
          <polygon points="150,20 185,38 150,56" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
          <polygon points="265,80 265,116 248,98" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
          <polygon points="265,220 248,202 265,184" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
          <polygon points="150,280 150,262 185,262" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
          <polygon points="35,220 52,202 35,184" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
          <polygon points="35,80 35,116 52,98" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.05" />
        </g>

        {/* Inner counter-rotating ring */}
        <g style={{ transformOrigin: '150px 150px', animation: 'tribal-spin-reverse 20s linear infinite' }}>
          <polygon
            points="150,65 220,105 220,195 150,235 80,195 80,105"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            opacity="0.5"
          />
          {/* Diagonal struts */}
          <line x1="150" y1="65" x2="150" y2="235" stroke={color} strokeWidth="0.3" opacity="0.3" />
          <line x1="80" y1="105" x2="220" y2="195" stroke={color} strokeWidth="0.3" opacity="0.3" />
          <line x1="220" y1="105" x2="80" y2="195" stroke={color} strokeWidth="0.3" opacity="0.3" />
        </g>

        {/* Static center mandala */}
        <circle cx="150" cy="150" r="35" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
        <circle cx="150" cy="150" r="22" stroke={color} strokeWidth="0.5" fill="none" opacity="0.35" />
        <circle cx="150" cy="150" r="10" stroke={color} strokeWidth="0.5" fill={color} fillOpacity="0.08" opacity="0.6" />

        {/* Cardinal cross lines through center */}
        <line x1="150" y1="115" x2="150" y2="185" stroke={color} strokeWidth="0.4" opacity="0.4" />
        <line x1="115" y1="150" x2="185" y2="150" stroke={color} strokeWidth="0.4" opacity="0.4" />
        <line x1="125" y1="125" x2="175" y2="175" stroke={color} strokeWidth="0.3" opacity="0.3" />
        <line x1="175" y1="125" x2="125" y2="175" stroke={color} strokeWidth="0.3" opacity="0.3" />

        {/* Dot accents at hexagon vertices */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 150 + Math.cos(rad) * 35;
          const cy = 150 + Math.sin(rad) * 35;
          return <circle key={angle} cx={cx} cy={cy} r="2" fill={color} opacity="0.6" />;
        })}
      </svg>
    </div>
  );
}
