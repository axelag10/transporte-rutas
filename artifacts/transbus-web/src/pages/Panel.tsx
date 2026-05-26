import { Link } from "wouter";
import {
  useListRoutes,
  useGetRouteLive,
  useUpdateRoute,
  useDeleteRoute,
  useListStops,
  useCreateStop,
  useDeleteStop,
} from "@workspace/api-client-react";
import { getListRoutesQueryKey, getListStopsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertasBanner } from "@/components/AlertasBanner";
import { useState } from "react";

// ─── Icono lápiz ─────────────────────────────────────────────────────────────
function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M6 4V2h4v2M5 4l1 9h4l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Modal editar ruta ────────────────────────────────────────────────────────
interface Route {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  active: boolean;
}

function EditRouteModal({ route, onClose }: { route: Route; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateRoute, isPending } = useUpdateRoute();
  const { mutateAsync: createStop } = useCreateStop();
  const { mutateAsync: deleteStop } = useDeleteStop();
  const { data: stops, refetch: refetchStops } = useListStops(route.id);

  const [form, setForm] = useState({
    name: route.name,
    description: route.description ?? "",
    color: route.color,
    active: route.active,
  });
  const [stopForm, setStopForm] = useState({ name: "", coords: "" });
  const [stopError, setStopError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateRoute({
        id: route.id,
        data: {
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color,
          active: form.active,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListRoutesQueryKey() });
      onClose();
    } catch {
      setError("Error al guardar los cambios.");
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setStopError(null);
    if (!stopForm.name.trim()) { setStopError("El nombre es requerido."); return; }
    const parts = stopForm.coords.split(",").map((s) => s.trim());
    const lat = parseFloat(parts[0] ?? "");
    const lng = parseFloat(parts[1] ?? "");
    if (parts.length !== 2 || isNaN(lat) || isNaN(lng)) {
      setStopError("Formato incorrecto. Ejemplo: 19.82413, -99.11613");
      return;
    }
    try {
      await createStop({
        id: route.id,
        data: { name: stopForm.name.trim(), lat, lng, order: (stops?.length ?? 0) + 1 },
      });
      await refetchStops();
      setStopForm({ name: "", coords: "" });
    } catch {
      setStopError("Error al agregar la parada.");
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    try {
      await deleteStop({ id: route.id, stopId });
      await refetchStops();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Editar ruta</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Datos de la ruta */}
          <form id="route-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nombre</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Descripcion</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-border bg-muted cursor-pointer"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{form.color}</span>
                </div>
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-foreground">Activa</span>
                </label>
              </div>
            </div>
          </form>

          {/* Paradas */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Paradas</h3>

            {stops && stops.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden mb-3">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span>#</span><span>Nombre</span><span>Lat</span><span>Lng</span><span></span>
                </div>
                {stops.map((stop) => (
                  <div key={stop.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2.5 items-center border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground tabular-nums w-5">{stop.order}</span>
                    <span className="text-sm text-foreground">{stop.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{stop.lat.toFixed(4)}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{stop.lng.toFixed(4)}</span>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Eliminar parada"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario agregar parada */}
            <form onSubmit={handleAddStop} className="space-y-2">
              {stopError && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{stopError}</p>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la parada"
                  value={stopForm.name}
                  onChange={(e) => setStopForm((f) => ({ ...f, name: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="19.82413, -99.11613"
                  value={stopForm.coords}
                  onChange={(e) => setStopForm((f) => ({ ...f, coords: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-secondary border border-border text-sm text-foreground transition-colors"
                  title="Agregar parada"
                >
                  <IconPlus />
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">
            Cancelar
          </button>
          <button type="submit" form="route-form" disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmar borrado ──────────────────────────────────────────────────
function DeleteRouteModal({ route, onClose }: { route: Route; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteRoute, isPending } = useDeleteRoute();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteRoute({ id: route.id });
      await queryClient.invalidateQueries({ queryKey: getListRoutesQueryKey() });
      onClose();
    } catch {
      setError("Error al eliminar la ruta. Puede tener vehiculos o turnos asociados.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 py-6">
          <h2 className="text-base font-semibold text-foreground mb-2">Eliminar ruta</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Estas a punto de eliminar la ruta <strong className="text-foreground">{route.name}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-4">Esta accion no se puede deshacer.</p>
          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isPending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fila de ruta ─────────────────────────────────────────────────────────────
function RouteRow({ route, onEdit, onDelete }: {
  route: Route;
  onEdit: (r: Route) => void;
  onDelete: (r: Route) => void;
}) {
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
          <button
            onClick={() => onEdit(route)}
            className="p-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Editar ruta"
          >
            <IconEdit />
          </button>
          <button
            onClick={() => onDelete(route)}
            className="p-1.5 rounded-lg bg-muted hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
            title="Eliminar ruta"
          >
            <IconTrash />
          </button>
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

// ─── Pagina principal ─────────────────────────────────────────────────────────
export default function Panel() {
  const { data: routes, isLoading } = useListRoutes();
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [deleteRoute, setDeleteRoute] = useState<Route | null>(null);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AlertasBanner />

      {editRoute && <EditRouteModal route={editRoute} onClose={() => setEditRoute(null)} />}
      {deleteRoute && <DeleteRouteModal route={deleteRoute} onClose={() => setDeleteRoute(null)} />}

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
            <RouteRow
              key={route.id}
              route={route}
              onEdit={setEditRoute}
              onDelete={setDeleteRoute}
            />
          ))}
        </div>
      )}
    </main>
  );
}
