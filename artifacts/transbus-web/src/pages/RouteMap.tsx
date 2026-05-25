import { useParams, Link } from "wouter";
import { useGetRoute, useGetRouteLive, useGetEta } from "@workspace/api-client-react";
import type { StopEta, VehicleLive, Stop } from "@workspace/api-client-react";

function SvgMap({
  stops,
  vehicles,
  color,
}: {
  stops: Stop[];
  vehicles: VehicleLive[];
  color: string;
}) {
  if (stops.length === 0) return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
      No hay paradas registradas para esta ruta.
    </div>
  );

  const allLats = [...stops.map(s => s.lat), ...vehicles.map(v => v.lat)];
  const allLngs = [...stops.map(s => s.lng), ...vehicles.map(v => v.lng)];
  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLng = Math.min(...allLngs);
  const maxLng = Math.max(...allLngs);

  const PAD = 0.001;
  const W = 540;
  const H = 360;

  function toX(lng: number) {
    return PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * PAD * W);
  }
  function toY(lat: number) {
    return H - PAD * H - ((lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * PAD * H);
  }

  const pathD = stops
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${toX(s.lng)} ${toY(s.lat)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: 'transparent' }}>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity="0.5"
      />
      {stops.slice().sort((a, b) => a.order - b.order).map((stop, i) => (
        <g key={stop.id}>
          <circle
            cx={toX(stop.lng)}
            cy={toY(stop.lat)}
            r="8"
            fill="hsl(215 25% 12%)"
            stroke={color}
            strokeWidth="2"
          />
          <text
            x={toX(stop.lng)}
            y={toY(stop.lat) + 4}
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill={color}
          >
            {i + 1}
          </text>
          <text
            x={toX(stop.lng) + 12}
            y={toY(stop.lat) + 4}
            fontSize="9"
            fill="rgba(255,255,255,0.7)"
          >
            {stop.name.length > 18 ? stop.name.slice(0, 18) + '…' : stop.name}
          </text>
        </g>
      ))}
      {vehicles.map(v => (
        <g key={v.vehicleId}>
          <circle
            cx={toX(v.lng)}
            cy={toY(v.lat)}
            r="12"
            fill={color}
            opacity="0.9"
          />
          <circle
            cx={toX(v.lng)}
            cy={toY(v.lat)}
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.3"
          />
          <text
            x={toX(v.lng)}
            y={toY(v.lat) + 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="hsl(215 28% 9%)"
          >
            B
          </text>
        </g>
      ))}
    </svg>
  );
}

function EtaList({ vehicleId, routeColor }: { vehicleId: number; routeColor: string }) {
  const { data: eta, isLoading } = useGetEta(vehicleId, {
    query: { refetchInterval: 10000, enabled: !!vehicleId }
  });

  if (isLoading) return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded-lg" />)}
    </div>
  );

  if (!eta) return null;

  return (
    <div className="space-y-2">
      {eta.stops.map((stop: StopEta, i: number) => (
        <div key={stop.stopId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: routeColor + '33', color: routeColor }}
            >
              {i + 1}
            </div>
            <span className="text-sm text-foreground">{stop.stopName}</span>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            {stop.etaMinutes !== null && stop.etaMinutes !== undefined ? (
              <span className={`text-sm font-semibold ${stop.etaMinutes < 5 ? 'text-accent' : 'text-primary'}`}>
                {stop.etaMinutes < 1 ? 'Llegando' : `~${Math.round(stop.etaMinutes)} min`}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Sin datos</span>
            )}
            {stop.distanceKm !== null && stop.distanceKm !== undefined && (
              <p className="text-xs text-muted-foreground">{stop.distanceKm} km</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RouteMap() {
  const { id } = useParams<{ id: string }>();
  const routeId = Number(id);

  const { data: route, isLoading } = useGetRoute(routeId, {
    query: { enabled: !!routeId }
  });

  const { data: live } = useGetRouteLive(routeId, {
    query: { enabled: !!routeId, refetchInterval: 5000 }
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-6" />
        <div className="h-80 bg-muted rounded-xl mb-6" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Ruta no encontrada.</p>
        <Link href="/"><button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Volver</button></Link>
      </div>
    );
  }

  const vehicles: VehicleLive[] = live?.vehicles ?? [];
  const stops: Stop[] = route.stops ?? [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Link>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
        <h1 className="text-xl font-bold text-foreground">{route.name}</h1>
        <div className="ml-auto flex items-center gap-2">
          {vehicles.length > 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {vehicles.length} {vehicles.length === 1 ? 'camion activo' : 'camiones activos'}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">Sin servicio ahora</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="border border-border rounded-xl overflow-hidden bg-card" style={{ minHeight: 300 }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mapa en tiempo real</span>
              <span className="text-xs text-muted-foreground">Actualiza cada 5 seg</span>
            </div>
            <div className="p-4" style={{ height: 300 }}>
              <SvgMap stops={stops} vehicles={vehicles} color={route.color} />
            </div>
          </div>

          {vehicles.length > 0 && (
            <div className="mt-4 border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Camiones en ruta</h3>
              <div className="space-y-2">
                {vehicles.map(v => (
                  <div key={v.vehicleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{v.driverName}</p>
                    </div>
                    {v.speed !== null && v.speed !== undefined && (
                      <span className="text-xs text-muted-foreground">{Math.round(v.speed * 3.6)} km/h</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Tiempos estimados de llegada
            </h3>
            {vehicles.length > 0 ? (
              <EtaList vehicleId={vehicles[0].vehicleId} routeColor={route.color} />
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No hay camiones activos en esta ruta.</p>
                <p className="mt-1 text-xs">Los ETAs aparecen cuando el chofer activa la app.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
