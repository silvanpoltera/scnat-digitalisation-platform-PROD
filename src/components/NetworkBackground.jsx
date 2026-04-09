import { useMemo } from 'react';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function NetworkBackground({
  nodeCount = 35,
  className = '',
  seed = 42,
  accentColor = '#EA515A',
  opacity = 0.4,
  showPulse = true,
}) {
  const { nodes, edges, pulseNodes } = useMemo(() => {
    const rng = seededRandom(seed);
    const ns = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      r: 1 + rng() * 2,
    }));

    const es = [];
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x;
        const dy = ns[i].y - ns[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 22 && rng() > 0.3) {
          es.push({ from: i, to: j, dist });
        }
      }
    }

    const pn = ns.filter(() => rng() > 0.75).slice(0, 5);

    return { nodes: ns, edges: es, pulseNodes: pn };
  }, [nodeCount, seed]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`ng-${seed}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="70" cy="30" r="35" fill={`url(#ng-${seed})`} />

        {edges.map((e, i) => (
          <line
            key={`e${i}`}
            x1={nodes[e.from].x}
            y1={nodes[e.from].y}
            x2={nodes[e.to].x}
            y2={nodes[e.to].y}
            stroke={accentColor}
            strokeOpacity={0.12}
            strokeWidth={0.15}
          >
            {showPulse && i % 5 === 0 && (
              <animate
                attributeName="stroke-opacity"
                values="0.05;0.25;0.05"
                dur={`${3 + (i % 4)}s`}
                repeatCount="indefinite"
              />
            )}
          </line>
        ))}

        {nodes.map((n) => (
          <circle
            key={`n${n.id}`}
            cx={n.x}
            cy={n.y}
            r={n.r * 0.4}
            fill={accentColor}
            fillOpacity={0.25}
          />
        ))}

        {showPulse && pulseNodes.map((n, i) => (
          <circle
            key={`p${i}`}
            cx={n.x}
            cy={n.y}
            r={0.5}
            fill="none"
            stroke={accentColor}
            strokeWidth={0.2}
          >
            <animate
              attributeName="r"
              values="0.5;3;0.5"
              dur={`${4 + i}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.5;0;0.5"
              dur={`${4 + i}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}

export function NetworkGrid({ className = '', opacity = 0.3 }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="netgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EA515A" strokeWidth="0.3" strokeOpacity="0.15" />
          </pattern>
          <pattern id="netgrid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#netgrid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#EA515A" strokeWidth="0.5" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#netgrid-lg)" />
      </svg>
    </div>
  );
}
