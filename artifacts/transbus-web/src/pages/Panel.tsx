import { Link } from "wouter";
import { useListRoutes, useGetRouteLive } from "@workspace/api-client-react";

function RouteRow({ route }: { route: { id: number; name: string; color: string; active: boolean; description?: string | null } }) {
  const { data: live } = useGetRouteLive(route.id, {
    query: { refetchInterval: 15000 }
  });
  const vehicles = live?.vehicles ?? [];

  return (
    <div className="border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: route.color }} />
          <div>
            <h3 className="font-semibold text-foreground">{route.name}</h3>
            {route.description && <p className="text-sm text-muted-foreground">{route.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${vehicles.length > 0 ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${vehicles.length > 0 ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
            {vehicles.length > 0 ? `${vehicles.length} activos` : 'Sin servicio'}
          </span>
          <Link href={`/rutas/${route.id}`}>
            <button className="px-3 py-1 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs text-foreground">
              Ver mapa
            </button>
          </Link>
        </div>
      </div>

      {vehicles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {vehicles.map(v => (
            <div key={v.vehicleId} className="p-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{v.plateNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{v.driverName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Panel() {
  const { data: routes, isLoading } = useListRoutes();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de control</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitoreo de flota en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Link href="/panel/vehiculos">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground">
              Vehiculos
            </button>
          </Link>
          <Link href="/panel/rutas/nueva">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium">
              Nueva ruta
            </button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {routes && routes.length === 0 && (
        <div className="border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">No hay rutas registradas.</p>
          <Link href="/panel/rutas/nueva">
            <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Crear primera ruta
            </button>
          </Link>
        </div>
      )}

      {routes && routes.length > 0 && (
        <div className="space-y-4">
          {routes.map(route => (
            <RouteRow key={route.id} route={route} />
          ))}
        </div>
      )}
    </main>
  );
}
