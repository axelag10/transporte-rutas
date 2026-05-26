import { Link } from "wouter";
import { useState } from "react";
import { useListRoutes } from "@workspace/api-client-react";
import { useGetRouteLive } from "@workspace/api-client-react";

function RouteCard({ route }: { route: { id: number; name: string; description?: string | null; color: string; active: boolean } }) {
  const { data: live } = useGetRouteLive(route.id, {
    query: { refetchInterval: 15000 }
  });
  const vehicleCount = live?.vehicles?.length ?? 0;
  const [descVisible, setDescVisible] = useState(false);

  return (
    <Link href={`/rutas/${route.id}`}>
      <div className="group border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: route.color }}
            />
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {route.name}
              </h3>
              {route.description && (
                <>
                  <p className="hidden sm:block text-sm text-muted-foreground mt-0.5">{route.description}</p>
                  <div className="sm:hidden">
                    {descVisible && (
                      <p className="text-sm text-muted-foreground mt-0.5">{route.description}</p>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); setDescVisible((v) => !v); }}
                      className="text-xs text-primary mt-0.5"
                    >
                      {descVisible ? "Ocultar" : "Ver descripcion"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${vehicleCount > 0 ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${vehicleCount > 0 ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
              {vehicleCount > 0 ? `${vehicleCount} en ruta` : 'Sin servicio'}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 11L5 7M5 7L7 9L11 1M5 7L3 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ver mapa en tiempo real
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto group-hover:translate-x-0.5 transition-transform">
            <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: routes, isLoading, error } = useListRoutes();

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-3 sm:mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Tiempo real
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-foreground">Rutas de transporte</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
          Selecciona una ruta para ver los camiones activos y el tiempo estimado de llegada a cada parada.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="border border-destructive/30 bg-destructive/10 rounded-xl p-5 text-destructive text-sm">
          No se pudieron cargar las rutas. Verifica la conexion al servidor.
        </div>
      )}

      {routes && routes.length === 0 && (
        <div className="border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground">No hay rutas registradas.</p>
          <Link href="/panel/rutas/nueva">
            <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Crear primera ruta
            </button>
          </Link>
        </div>
      )}

      {routes && routes.length > 0 && (
        <div className="space-y-3">
          {routes.map(route => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Los tiempos de llegada se actualizan automaticamente cada vez que el chofer envia su ubicacion GPS.
        </p>
      </div>
    </main>
  );
}
