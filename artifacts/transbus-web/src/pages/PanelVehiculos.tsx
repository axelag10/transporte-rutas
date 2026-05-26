import { Link } from "wouter";
import {
  useListVehicles,
  useListRoutes,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@workspace/api-client-react";
import { getListVehiclesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      {open ? (
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      ) : (
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      )}
    </svg>
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: number;
  routeId: number;
  driverName: string;
  plateNumber: string;
  pin: string;
  active: boolean;
}

// ─── Modal nuevo vehículo ─────────────────────────────────────────────────────
function NuevoVehiculoModal({ onClose }: { onClose: () => void }) {
  const { data: routes } = useListRoutes();
  const queryClient = useQueryClient();
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();

  const [form, setForm] = useState({ routeId: "", driverName: "", plateNumber: "", pin: "" });
  const [pinVisible, setPinVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinValid = /^\d{4}$/.test(form.pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinValid) { setError("El PIN debe ser exactamente 4 digitos."); return; }
    if (!form.routeId) { setError("Selecciona una ruta."); return; }
    setError(null);
    try {
      await createVehicle({
        data: {
          routeId: Number(form.routeId),
          driverName: form.driverName.trim(),
          plateNumber: form.plateNumber.trim().toUpperCase(),
          pin: form.pin,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      onClose();
    } catch {
      setError("Error al registrar el vehiculo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Registrar vehiculo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Ruta asignada</label>
            <select required value={form.routeId} onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Seleccionar ruta...</option>
              {routes?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nombre del chofer</label>
            <input required type="text" placeholder="Ej. Miguel Angel Torres" value={form.driverName}
              onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Placas</label>
            <input required type="text" placeholder="Ej. MEX-1234" value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">PIN del chofer (4 digitos)</label>
            <div className="relative">
              <input required type={pinVisible ? "text" : "password"} inputMode="numeric" maxLength={4} pattern="\d{4}"
                placeholder="••••" value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-muted border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-[0.4em] ${pinValid || !form.pin ? "border-border" : "border-red-500/60"}`} />
              <button type="button" onClick={() => setPinVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeIcon open={pinVisible} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">El chofer usara este PIN para desbloquear su unidad en la app.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isPending ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal editar vehículo ────────────────────────────────────────────────────
function EditVehiculoModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const { data: routes } = useListRoutes();
  const queryClient = useQueryClient();
  const { mutateAsync: updateVehicle, isPending } = useUpdateVehicle();

  const [form, setForm] = useState({
    routeId: String(vehicle.routeId),
    driverName: vehicle.driverName,
    plateNumber: vehicle.plateNumber,
    pin: vehicle.pin,
    active: vehicle.active,
  });
  const [pinVisible, setPinVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinValid = /^\d{4}$/.test(form.pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinValid) { setError("El PIN debe ser exactamente 4 digitos."); return; }
    setError(null);
    try {
      await updateVehicle({
        id: vehicle.id,
        data: {
          routeId: Number(form.routeId),
          driverName: form.driverName.trim(),
          plateNumber: form.plateNumber.trim().toUpperCase(),
          pin: form.pin,
          active: form.active,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      onClose();
    } catch {
      setError("Error al guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Editar vehiculo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Ruta asignada</label>
            <select required value={form.routeId} onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {routes?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nombre del chofer</label>
            <input required type="text" value={form.driverName}
              onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Placas</label>
            <input required type="text" value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">PIN (4 digitos)</label>
            <div className="relative">
              <input required type={pinVisible ? "text" : "password"} inputMode="numeric" maxLength={4} pattern="\d{4}"
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-muted border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-[0.4em] ${pinValid || !form.pin ? "border-border" : "border-red-500/60"}`} />
              <button type="button" onClick={() => setPinVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeIcon open={pinVisible} />
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Vehiculo activo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal confirmar borrado vehículo ─────────────────────────────────────────
function DeleteVehiculoModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteVehicle, isPending } = useDeleteVehicle();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteVehicle({ id: vehicle.id });
      await queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      onClose();
    } catch {
      setError("Error al eliminar el vehiculo. Puede tener turnos asociados.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 py-6">
          <h2 className="text-base font-semibold text-foreground mb-2">Eliminar vehiculo</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Estas a punto de eliminar el vehiculo <strong className="text-foreground font-mono">{vehicle.plateNumber}</strong> — {vehicle.driverName}.
          </p>
          <p className="text-sm text-muted-foreground mb-4">Esta accion no se puede deshacer.</p>
          {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">Cancelar</button>
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

// ─── Pagina principal ─────────────────────────────────────────────────────────
export default function PanelVehiculos() {
  const { data: vehicles, isLoading } = useListVehicles();
  const { data: routes } = useListRoutes();
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [pinVisible, setPinVisible] = useState<Record<number, boolean>>({});

  const routeMap = Object.fromEntries((routes ?? []).map(r => [r.id, r]));
  const togglePin = (id: number) => setPinVisible((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {showModal && <NuevoVehiculoModal onClose={() => setShowModal(false)} />}
      {editVehicle && <EditVehiculoModal vehicle={editVehicle} onClose={() => setEditVehicle(null)} />}
      {deleteVehicle && <DeleteVehiculoModal vehicle={deleteVehicle} onClose={() => setDeleteVehicle(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
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
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nuevo vehiculo
        </button>
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
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
            <span className="pr-4">Placas</span>
            <span>Chofer</span>
            <span className="text-center px-4">Ruta</span>
            <span className="text-center px-4">PIN</span>
            <span className="text-center">Estado</span>
            <span className="text-center pl-3">Acciones</span>
          </div>
          {vehicles.map((v, i) => {
            const route = routeMap[v.routeId];
            const showPin = pinVisible[v.id];
            const vTyped = v as unknown as Vehicle;
            return (
              <div key={v.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] px-4 py-3.5 items-center ${i < vehicles.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="pr-4 font-mono font-bold text-sm text-foreground tracking-wider">{v.plateNumber}</span>
                <span className="text-sm text-foreground">{v.driverName}</span>
                <div className="flex items-center gap-2 px-4">
                  {route && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />}
                  <span className="text-sm text-muted-foreground truncate max-w-[140px]">{route?.name ?? `Ruta ${v.routeId}`}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4">
                  <span className="font-mono text-sm text-foreground tracking-[0.3em]">
                    {showPin ? (vTyped.pin ?? "••••") : "••••"}
                  </span>
                  <button onClick={() => togglePin(v.id)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={showPin ? "Ocultar PIN" : "Mostrar PIN"}>
                    <EyeIcon open={showPin} />
                  </button>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${v.active ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {v.active ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex items-center gap-1 pl-3">
                  <button
                    onClick={() => setEditVehicle(vTyped)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Editar">
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => setDeleteVehicle(vTyped)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                    title="Eliminar">
                    <IconTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Los PINes son visibles solo en este panel de administracion. Comparte cada PIN al chofer correspondiente.
      </p>
    </main>
  );
}
