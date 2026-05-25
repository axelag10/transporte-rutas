import { Link } from "wouter";
import { useListVehicles, useListRoutes } from "@workspace/api-client-react";

export default function PanelVehiculos() {
  const { data: vehicles, isLoading } = useListVehicles();
  const { data: routes } = useListRoutes();

  const routeMap = Object.fromEntries((routes ?? []).map(r => [r.id, r]));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/panel">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehiculos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Flota registrada en el sistema</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
        </div>
      )}

      {vehicles && vehicles.length === 0 && (
        <div className="border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          No hay vehiculos registrados.
        </div>
      )}

      {vehicles && vehicles.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
            <span>Placas</span>
            <span>Chofer</span>
            <span>Ruta asignada</span>
            <span>Estado</span>
          </div>
          {vehicles.map((v, i) => {
            const route = routeMap[v.routeId];
            return (
              <div key={v.id} className={`grid grid-cols-4 px-4 py-3.5 items-center ${i < vehicles.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-sm font-semibold text-foreground">{v.plateNumber}</span>
                <span className="text-sm text-foreground">{v.driverName}</span>
                <div className="flex items-center gap-2">
                  {route && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
                  )}
                  <span className="text-sm text-muted-foreground truncate">{route?.name ?? `Ruta ${v.routeId}`}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${v.active ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {v.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
