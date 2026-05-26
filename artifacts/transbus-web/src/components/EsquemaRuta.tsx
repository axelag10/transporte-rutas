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

function vehiculoMasCercano(
  vehicle: VehicleLive,
  sorted: Stop[]
): number {
  let nearestIdx = 0;
  let nearestDist = Infinity;
  sorted.forEach((s, i) => {
    const d = distancia(vehicle.lat, vehicle.lng, s.lat, s.lng);
    if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
  });
  return nearestIdx;
}

export function EsquemaRuta({ stops, vehicles, color }: Props) {
  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const n = sorted.length;

  if (n === 0) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Sin paradas registradas
    </div>
  );

  // Índice de parada más cercana por vehículo
  const vehiclesByStop: Record<number, VehicleLive[]> = {};
  vehicles.forEach((v) => {
    const idx = vehiculoMasCercano(v, sorted);
    if (!vehiclesByStop[idx]) vehiclesByStop[idx] = [];
    vehiclesByStop[idx].push(v);
  });

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
      <div className="relative py-5 pl-8 pr-4" style={{ minHeight: n * 52 + 40 }}>

        {/* Línea vertical */}
        <div
          className="absolute top-5 bottom-5"
          style={{
            left: "1.75rem",
            width: "2px",
            backgroundColor: color,
            opacity: 0.35,
          }}
        />

        {sorted.map((stop, i) => {
          const isFirst = i === 0;
          const isLast = i === n - 1;
          const isTerminal = isFirst || isLast;
          const nearVehicles = vehiclesByStop[i] ?? [];

          return (
            <div key={stop.id} style={{ paddingBottom: i < n - 1 ? "1.75rem" : 0 }}>
              {/* Vehiculos antes de esta parada */}
              {nearVehicles.map((v) => (
                <div
                  key={v.vehicleId}
                  className="flex items-center gap-2 mb-1"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 relative z-10 ring-4"
                    style={{
                      backgroundColor: color,
                      color: "hsl(var(--primary-foreground))",
                      ringColor: color + "33",
                    }}
                  >
                    B
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: color,
                      backgroundColor: color + "1a",
                      border: `1px solid ${color}55`,
                    }}
                  >
                    {v.plateNumber}
                  </span>
                </div>
              ))}

              {/* Parada */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0 font-bold relative z-10"
                  style={{
                    width: isTerminal ? "1.625rem" : "1.25rem",
                    height: isTerminal ? "1.625rem" : "1.25rem",
                    borderRadius: "50%",
                    backgroundColor: isTerminal ? color : "hsl(var(--secondary))",
                    border: isTerminal ? "none" : `2px solid ${color}`,
                    color: isTerminal ? "hsl(var(--primary-foreground))" : color,
                    fontSize: isTerminal ? "0.625rem" : "0.5625rem",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="leading-tight"
                  style={{
                    fontSize: isTerminal ? "0.78125rem" : "0.71875rem",
                    fontWeight: isTerminal ? 700 : 400,
                    color: isTerminal
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {stop.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
