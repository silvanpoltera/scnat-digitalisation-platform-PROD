const DIMENSIONS = [
  'benutzerfreundlichkeit',
  'integration',
  'datenschutz',
  'kosteneffizienz',
  'support',
  'mobiletauglichkeit',
];

const LABELS = {
  benutzerfreundlichkeit: 'Benutzer',
  integration: 'Integration',
  datenschutz: 'Datenschutz',
  kosteneffizienz: 'Kosten',
  support: 'Support',
  mobiletauglichkeit: 'Mobil',
};

const CX = 150;
const CY = 150;
const R = 100;
const LEVELS = 5;

function polarToCart(angle, radius) {
  const rad = (Math.PI / 180) * (angle - 90);
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

export default function RadarChart({ radar = {} }) {
  const step = 360 / DIMENSIONS.length;

  const hexagons = Array.from({ length: LEVELS }, (_, lvl) => {
    const r = (R / LEVELS) * (lvl + 1);
    return DIMENSIONS.map((_, i) => polarToCart(step * i, r));
  });

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const val = radar[dim] ?? 0;
    return polarToCart(step * i, (val / 5) * R);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
      {hexagons.map((hex, lvl) => (
        <polygon
          key={lvl}
          points={hex.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          style={{ stroke: 'var(--border-default)' }}
          strokeWidth={lvl === LEVELS - 1 ? 1 : 0.5}
        />
      ))}

      {DIMENSIONS.map((_, i) => {
        const end = polarToCart(step * i, R);
        return <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} style={{ stroke: 'var(--border-faint)' }} strokeWidth={0.5} />;
      })}

      <polygon
        points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="#EA515A"
        fillOpacity={0.15}
        stroke="#EA515A"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ animation: 'radarDraw 0.6s ease-out' }}
      />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#EA515A" />
      ))}

      {DIMENSIONS.map((dim, i) => {
        const labelR = R + 22;
        const pos = polarToCart(step * i, labelR);
        return (
          <text
            key={dim}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fill: 'var(--text-secondary)' }}
            fontSize="10"
            fontFamily="DM Sans"
          >
            {LABELS[dim]}
          </text>
        );
      })}
    </svg>
  );
}
