import { Link } from "wouter";
import { useListShifts, useListVehicles, useListRoutes, useGetShiftPositions } from "@workspace/api-client-react";
import { AlertasBanner } from "@/components/AlertasBanner";
import { useState, useMemo } from "react";

interface ShiftDetail {
  id: number;
  vehicleId: number;
  startedAt: string;
  endedAt: string | null;
  positionsCount: number;
  plateNumber: string;
  driverName: string;
}

type DateFilter = "today" | "yesterday" | "week" | "all";

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "—";
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(isoString: string): string {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

function diffHours(startedAt: string, endedAt: string | null): number {
  if (!endedAt) return (Date.now() - new Date(startedAt).getTime()) / 3600000;
  return (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 3600000;
}

function isToday(s: string): boolean { return new Date(s).toDateString() === new Date().toDateString(); }
function isYesterday(s: string): boolean {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return new Date(s).toDateString() === y.toDateString();
}
function isThisWeek(s: string): boolean {
  const d = new Date(s); const w = new Date(); w.setDate(w.getDate() - 7);
  return d >= w;
}

// ─── Historial de posiciones de un turno ─────────────────────────────────────
function ShiftPositionsModal({ shiftId, onClose }: { shiftId: number; onClose: () => void }) {
  const { data, isLoading } = useGetShiftPositions(shiftId);

  const speedStats = useMemo(() => {
    if (!data?.positions.length) return null;
    const speeds = data.positions.filter((p) => p.speed != null).map((p) => (p.speed! * 3.6));
    if (!speeds.length) return null;
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const max = Math.max(...speeds);
    return { avg: avg.toFixed(0), max: max.toFixed(0) };
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Historial GPS — {data?.plateNumber ?? "..."}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{data?.driverName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-3 gap-px bg-border mx-5 mt-4 rounded-xl overflow-hidden border border-border">
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Puntos GPS</p>
              <p className="text-xl font-bold text-foreground">{data.positions.length}</p>
            </div>
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Vel. prom.</p>
              <p className="text-xl font-bold text-foreground">{speedStats ? `${speedStats.avg} km/h` : "—"}</p>
            </div>
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Vel. máx.</p>
              <p className="text-xl font-bold text-foreground">{speedStats ? `${speedStats.max} km/h` : "—"}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto mx-5 my-4">
          {isLoading && (
            <div className="space-y-2 animate-pulse">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-muted rounded-lg" />)}
            </div>
          )}
          {!isLoading && data && data.positions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Este turno no tiene posiciones registradas.
            </p>
          )}
          {!isLoading && data && data.positions.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-4 py-2 bg-muted/40 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>Lat</span>
                <span>Lng</span>
                <span>Velocidad</span>
                <span>Hora</span>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {data.positions.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-4 py-2 text-xs tabular-nums">
                    <span className="text-foreground">{p.lat.toFixed(5)}</span>
                    <span className="text-foreground">{p.lng.toFixed(5)}</span>
                    <span className="text-muted-foreground">{p.speed != null ? `${(p.speed * 3.6).toFixed(0)} km/h` : "—"}</span>
                    <span className="text-muted-foreground">{new Date(p.recordedAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PanelTurnos() {
  const { data: shifts, isLoading } = useListShifts();
  const { data: vehicles } = useListVehicles();
  const { data: routes } = useListRoutes();

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [routeFilter, setRouteFilter] = useState<number | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  const vehicleRouteMap = useMemo(() => {
    const map = new Map<number, number>();
    vehicles?.forEach((v) => map.set(v.id, v.routeId));
    return map;
  }, [vehicles]);

  const filtered = useMemo(() => {
    const all = (shifts as ShiftDetail[] | undefined) ?? [];
    return all.filter((s) => {
      const dateOk = dateFilter === "all" ? true : dateFilter === "today" ? isToday(s.startedAt) : dateFilter === "yesterday" ? isYesterday(s.startedAt) : isThisWeek(s.startedAt);
      const routeId = vehicleRouteMap.get(s.vehicleId);
      const routeOk = routeFilter === null ? true : routeId === routeFilter;
      return dateOk && routeOk;
    });
  }, [shifts, dateFilter, routeFilter, vehicleRouteMap]);

  const todayShifts = ((shifts as ShiftDetail[] | undefined) ?? []).filter((s) => isToday(s.startedAt));
  const activeNow = todayShifts.filter((s) => !s.endedAt).length;
  const hoursToday = todayShifts.reduce((acc, s) => acc + diffHours(s.startedAt, s.endedAt), 0).toFixed(1);

  const grouped = useMemo(() => {
    const map = new Map<string, ShiftDetail[]>();
    for (const s of filtered) {
      const key = new Date(s.startedAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([, items]) => ({ label: formatDateLabel(items[0].startedAt), items }));
  }, [filtered]);

  const dateFilters: { id: DateFilter; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "yesterday", label: "Ayer" },
    { id: "week", label: "7 días" },
    { id: "all", label: "Todo" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <AlertasBanner />

      {selectedShiftId && (
        <ShiftPositionsModal shiftId={selectedShiftId} onClose={() => setSelectedShiftId(null)} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de turnos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Registro de jornadas completadas por los choferes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/panel/vehiculos">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground">Vehiculos</button>
          </Link>
          <Link href="/panel">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground">Panel</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Turnos hoy</p>
          <p className="text-3xl font-bold text-foreground">{todayShifts.length}</p>
        </div>
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">En servicio</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-foreground">{activeNow}</p>
            {activeNow > 0 && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
          </div>
        </div>
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Horas acumuladas hoy</p>
          <p className="text-3xl font-bold text-foreground">{hoursToday}h</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {dateFilters.map((f) => (
            <button key={f.id} onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${dateFilter === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={routeFilter ?? ""} onChange={(e) => setRouteFilter(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">Todas las rutas</option>
          {routes?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="border border-border rounded-xl p-16 text-center">
          <p className="text-muted-foreground text-sm">No hay turnos en el período seleccionado.</p>
        </div>
      )}

      {!isLoading && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">{group.label}</h2>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span>Unidad</span><span>Chofer</span>
                  <span className="text-center">Inicio</span><span className="text-center">Fin</span>
                  <span className="text-center">Duracion</span><span className="text-center">Estado</span>
                  <span className="text-center">GPS</span>
                </div>
                {group.items.map((shift, idx) => {
                  const isActive = !shift.endedAt;
                  const routeId = vehicleRouteMap.get(shift.vehicleId);
                  const routeName = routes?.find((r) => r.id === routeId)?.name;
                  return (
                    <div key={shift.id}
                      className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 items-center ${idx < group.items.length - 1 ? "border-b border-border" : ""} ${isActive ? "bg-accent/5" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-secondary text-foreground px-2.5 py-1 rounded-md tracking-wider">{shift.plateNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{shift.driverName}</p>
                        {routeName && <p className="text-xs text-muted-foreground truncate">{routeName}</p>}
                      </div>
                      <span className="text-sm text-foreground tabular-nums">{formatTime(shift.startedAt)}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">{shift.endedAt ? formatTime(shift.endedAt) : "—"}</span>
                      <span className="text-sm text-foreground tabular-nums text-center">{formatDuration(shift.startedAt, shift.endedAt)}</span>
                      <div className="flex justify-center">
                        {isActive ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />En curso
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">{shift.positionsCount} pts</span>
                        )}
                      </div>
                      {/* Historial button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => setSelectedShiftId(shift.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Ver historial GPS"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
