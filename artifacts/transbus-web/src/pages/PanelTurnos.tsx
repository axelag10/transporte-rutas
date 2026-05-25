import { Link } from "wouter";
import { useListShifts, useListVehicles, useListRoutes } from "@workspace/api-client-react";
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
  return new Date(isoString).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function isToday(isoString: string): boolean {
  return new Date(isoString).toDateString() === new Date().toDateString();
}

function isYesterday(isoString: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return new Date(isoString).toDateString() === y.toDateString();
}

function isThisWeek(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return d >= weekAgo;
}

export default function PanelTurnos() {
  const { data: shifts, isLoading } = useListShifts();
  const { data: vehicles } = useListVehicles();
  const { data: routes } = useListRoutes();

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [routeFilter, setRouteFilter] = useState<number | null>(null);

  // Build vehicleId → routeId map
  const vehicleRouteMap = useMemo(() => {
    const map = new Map<number, number>();
    vehicles?.forEach((v) => map.set(v.id, v.routeId));
    return map;
  }, [vehicles]);

  const filtered = useMemo(() => {
    const all = (shifts as ShiftDetail[] | undefined) ?? [];
    return all.filter((s) => {
      const dateOk =
        dateFilter === "all" ? true
        : dateFilter === "today" ? isToday(s.startedAt)
        : dateFilter === "yesterday" ? isYesterday(s.startedAt)
        : isThisWeek(s.startedAt);
      const routeId = vehicleRouteMap.get(s.vehicleId);
      const routeOk = routeFilter === null ? true : routeId === routeFilter;
      return dateOk && routeOk;
    });
  }, [shifts, dateFilter, routeFilter, vehicleRouteMap]);

  // Stats for today
  const todayShifts = ((shifts as ShiftDetail[] | undefined) ?? []).filter((s) =>
    isToday(s.startedAt)
  );
  const activeNow = todayShifts.filter((s) => !s.endedAt).length;
  const hoursToday = todayShifts
    .reduce((acc, s) => acc + diffHours(s.startedAt, s.endedAt), 0)
    .toFixed(1);

  // Group filtered by date
  const grouped = useMemo(() => {
    const map = new Map<string, ShiftDetail[]>();
    for (const s of filtered) {
      const key = new Date(s.startedAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([, items]) => ({
      label: formatDateLabel(items[0].startedAt),
      items,
    }));
  }, [filtered]);

  const dateFilters: { id: DateFilter; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "yesterday", label: "Ayer" },
    { id: "week", label: "7 días" },
    { id: "all", label: "Todo" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de turnos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Registro de jornadas completadas por los choferes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/panel/vehiculos">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground">
              Vehículos
            </button>
          </Link>
          <Link href="/panel">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground">
              Panel
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Turnos hoy</p>
          <p className="text-3xl font-bold text-foreground">{todayShifts.length}</p>
        </div>
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">En servicio</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-foreground">{activeNow}</p>
            {activeNow > 0 && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
        </div>
        <div className="border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Horas acumuladas hoy</p>
          <p className="text-3xl font-bold text-foreground">{hoursToday}h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {dateFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateFilter === f.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={routeFilter ?? ""}
          onChange={(e) => setRouteFilter(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Todas las rutas</option>
          {routes?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="border border-border rounded-xl p-16 text-center">
          <p className="text-muted-foreground text-sm">
            No hay turnos en el período seleccionado.
          </p>
        </div>
      )}

      {!isLoading && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                {group.label}
              </h2>
              <div className="border border-border rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span>Unidad</span>
                  <span>Chofer</span>
                  <span className="text-center">Inicio</span>
                  <span className="text-center">Fin</span>
                  <span className="text-center">Duración</span>
                  <span className="text-center">Estado</span>
                </div>
                {group.items.map((shift, idx) => {
                  const isActive = !shift.endedAt;
                  const routeId = vehicleRouteMap.get(shift.vehicleId);
                  const routeName = routes?.find((r) => r.id === routeId)?.name;
                  return (
                    <div
                      key={shift.id}
                      className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center ${
                        idx < group.items.length - 1 ? "border-b border-border" : ""
                      } ${isActive ? "bg-accent/5" : ""}`}
                    >
                      {/* Plate */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-secondary text-foreground px-2.5 py-1 rounded-md tracking-wider">
                          {shift.plateNumber}
                        </span>
                      </div>

                      {/* Driver + Route */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {shift.driverName}
                        </p>
                        {routeName && (
                          <p className="text-xs text-muted-foreground truncate">{routeName}</p>
                        )}
                      </div>

                      {/* Start */}
                      <span className="text-sm text-foreground tabular-nums">
                        {formatTime(shift.startedAt)}
                      </span>

                      {/* End */}
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {shift.endedAt ? formatTime(shift.endedAt) : "—"}
                      </span>

                      {/* Duration */}
                      <span className="text-sm text-foreground tabular-nums text-center">
                        {formatDuration(shift.startedAt, shift.endedAt)}
                      </span>

                      {/* Status */}
                      <div className="flex justify-center">
                        {isActive ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            En curso
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            {shift.positionsCount} pts GPS
                          </span>
                        )}
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
