import type { Stop, VehicleLive } from "@workspace/api-client-react";

interface Props {
  stops: Stop[];
  vehicles: VehicleLive[];
  color: string;
}

function distancia(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dlat = lat1 - lat2;
  const dlng = lng1 - lng2;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

function posicionVehiculo(
  vehicle: VehicleLive,
  sorted: Stop[],
  step: number,
  paddingTop: number
): number | null {
  if (sorted.length < 2) return null;
  let nearestIdx = 0;
  let nearestDist = Infinity;
  sorted.forEach((s, i) => {
    const d = distancia(vehicle.lat, vehicle.lng, s.lat, s.lng);
    if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
  });
  // Interpola hacia la siguiente parada si no es la última
  const nextIdx = nearestIdx < sorted.length - 1 ? nearestIdx + 1 : nearestIdx - 1;
  const current = sorted[nearestIdx];
  const next = sorted[nextIdx];
  const total = distancia(current.lat, current.lng, next.lat, next.lng);
  const partial = distancia(vehicle.lat, vehicle.lng, current.lat, current.lng);
  const ratio = total > 0 ? Math.min(partial / total, 1) : 0;
  const direction = nextIdx > nearestIdx ? 1 : -1;
  return paddingTop + nearestIdx * step + direction * ratio * step;
}

export function EsquemaRuta({ stops, vehicles, color }: Props) {
  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const n = sorted.length;
  if (n === 0) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Sin paradas registradas
    </div>
  );

  const PADDING_TOP = 28;
  const PADDING_BOTTOM = 28;
  const STEP = 52;
  const LINE_X = 32;
  const SVG_W = 420;
  const SVG_H = PADDING_TOP + PADDING_BOTTOM + (n - 1) * STEP;

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ minHeight: SVG_H, display: "block" }}
        aria-label="Esquema de ruta"
      >
        {/* ── Línea de ruta ─────────────────────────────────────── */}
        <line
          x1={LINE_X} y1={PADDING_TOP}
          x2={LINE_X} y2={SVG_H - PADDING_BOTTOM}
          stroke={color} strokeWidth="2.5" strokeOpacity="0.35"
        />

        {/* ── Paradas ────────────────────────────────────────────── */}
        {sorted.map((stop, i) => {
          const y = PADDING_TOP + i * STEP;
          const isFirst = i === 0;
          const isLast = i === n - 1;
          const isTerminal = isFirst || isLast;

          return (
            <g key={stop.id}>
              {/* círculo exterior (terminal más grande) */}
              <circle
                cx={LINE_X} cy={y}
                r={isTerminal ? 13 : 10}
                fill={isTerminal ? color : "hsl(215,28%,10%)"}
                stroke={color}
                strokeWidth={isTerminal ? 0 : 2}
                strokeOpacity={isTerminal ? 0 : 1}
              />
              {/* número */}
              <text
                x={LINE_X} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isTerminal ? "hsl(215,28%,9%)" : color}
                fontSize={isTerminal ? 10 : 9}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {i + 1}
              </text>
              {/* nombre de parada */}
              <text
                x={LINE_X + 20}
                y={y}
                dominantBaseline="central"
                fill={isTerminal ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)"}
                fontSize={isTerminal ? 12.5 : 11.5}
                fontWeight={isTerminal ? "700" : "400"}
                fontFamily="system-ui, sans-serif"
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {/* ── Vehículos activos ──────────────────────────────────── */}
        {vehicles.map((v) => {
          const vy = posicionVehiculo(v, sorted, STEP, PADDING_TOP);
          if (vy === null) return null;
          return (
            <g key={v.vehicleId}>
              {/* sombra / halo */}
              <circle cx={LINE_X} cy={vy} r="16" fill={color} fillOpacity="0.18" />
              {/* círculo principal */}
              <circle cx={LINE_X} cy={vy} r="11" fill={color} />
              {/* icono bus (B) */}
              <text
                x={LINE_X} y={vy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(215,28%,9%)"
                fontSize="10"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
              >
                B
              </text>
              {/* etiqueta de placa */}
              <rect
                x={LINE_X + 18} y={vy - 11}
                width={v.plateNumber.length * 6.5 + 12}
                height={22}
                rx="5"
                fill={color}
                fillOpacity="0.2"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <text
                x={LINE_X + 24} y={vy}
                dominantBaseline="central"
                fill={color}
                fontSize="10.5"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {v.plateNumber}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
