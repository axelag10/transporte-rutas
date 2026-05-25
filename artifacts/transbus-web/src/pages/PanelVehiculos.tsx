import { Link } from "wouter";
import { useListVehicles, useListRoutes, useCreateVehicle } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListVehiclesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";

function NuevoVehiculoModal({ onClose }: { onClose: () => void }) {
  const { data: routes } = useListRoutes();
  const queryClient = useQueryClient();
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();

  const [form, setForm] = useState({
    routeId: "",
    driverName: "",
    plateNumber: "",
    pin: "",
  });
  const [pinVisible, setPinVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinValid = /^\d{4}$/.test(form.pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinValid) { setError("El PIN debe ser exactamente 4 dígitos."); return; }
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
      setError("Error al registrar el vehículo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Registrar vehículo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Ruta asignada</label>
            <select
              required
              value={form.routeId}
              onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Seleccionar ruta...</option>
              {routes?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nombre del chofer</label>
            <input
              required
              type="text"
              placeholder="Ej. Miguel Ángel Torres"
              value={form.driverName}
              onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Placas</label>
            <input
              required
              type="text"
              placeholder="Ej. MEX-1234"
              value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">PIN del chofer (4 dígitos)</label>
            <div className="relative">
              <input
                required
                type={pinVisible ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-muted border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-[0.4em] ${pinValid || !form.pin ? "border-border" : "border-red-500/60"}`}
              />
              <button
                type="button"
                onClick={() => setPinVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  {pinVisible ? (
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  ) : (
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  )}
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">El chofer usará este PIN para desbloquear su unidad en la app.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary text-sm text-foreground transition-colors">
              Cancelar
            </button>
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

export default function PanelVehiculos() {
  const { data: vehicles, isLoading } = useListVehicles();
  const { data: routes } = useListRoutes();
  const [showModal, setShowModal] = useState(false);
  const [pinVisible, setPinVisible] = useState<Record<number, boolean>>({});

  const routeMap = Object.fromEntries((routes ?? []).map(r => [r.id, r]));

  const togglePin = (id: number) => setPinVisible((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {showModal && <NuevoVehiculoModal onClose={() => setShowModal(false)} />}

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors"
        >
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
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
            <span className="pr-4">Placas</span>
            <span>Chofer</span>
            <span className="text-center px-4">Ruta</span>
            <span className="text-center px-4">PIN</span>
            <span className="text-center">Estado</span>
          </div>
          {vehicles.map((v, i) => {
            const route = routeMap[v.routeId];
            const showPin = pinVisible[v.id];
            return (
              <div key={v.id} className={`grid grid-cols-[auto_1fr_auto_auto_auto] px-4 py-3.5 items-center ${i < vehicles.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="pr-4 font-mono font-bold text-sm text-foreground tracking-wider">{v.plateNumber}</span>
                <span className="text-sm text-foreground">{v.driverName}</span>
                <div className="flex items-center gap-2 px-4">
                  {route && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
                  )}
                  <span className="text-sm text-muted-foreground truncate max-w-[140px]">{route?.name ?? `Ruta ${v.routeId}`}</span>
                </div>
                {/* PIN column — solo visible en panel admin */}
                <div className="flex items-center gap-1.5 px-4">
                  <span className="font-mono text-sm text-foreground tracking-[0.3em]">
                    {showPin ? ((v as unknown as { pin: string }).pin ?? "••••") : "••••"}
                  </span>
                  <button
                    onClick={() => togglePin(v.id)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      {showPin ? (
                        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      ) : (
                        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      )}
                    </svg>
                  </button>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${v.active ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {v.active ? 'Activo' : 'Inactivo'}
                </span>
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
