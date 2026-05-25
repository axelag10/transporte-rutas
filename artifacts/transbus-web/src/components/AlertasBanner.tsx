import { useListOfflineVehicles } from "@workspace/api-client-react";
import { useListRoutes } from "@workspace/api-client-react";
import { useState } from "react";

export function AlertasBanner() {
  const { data: alerts } = useListOfflineVehicles(
    { thresholdMin: 10 },
    { query: { refetchInterval: 30000 } }
  );
  const { data: routes } = useListRoutes();
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = (alerts ?? []).filter((a) => !dismissed.has(a.vehicleId));

  if (visible.length === 0) return null;

  const routeName = (routeId: number) =>
    routes?.find((r) => r.id === routeId)?.name ?? `Ruta #${routeId}`;

  const silentLabel = (minutesSilent: number | null | undefined) => {
    if (!minutesSilent) return "sin posición registrada";
    if (minutesSilent < 60) return `hace ${minutesSilent} min`;
    const h = Math.floor(minutesSilent / 60);
    const m = minutesSilent % 60;
    return `hace ${h}h ${m}m`;
  };

  const dismiss = (vehicleId: number) => {
    setDismissed((prev) => new Set([...prev, vehicleId]));
  };

  return (
    <div className="mb-6 space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
          {visible.length === 1
            ? "1 unidad sin señal GPS"
            : `${visible.length} unidades sin señal GPS`}
        </span>
      </div>

      {/* Alert cards */}
      {visible.map((alert) => (
        <div
          key={alert.vehicleId}
          className="flex items-center gap-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8"
          style={{ backgroundColor: "rgba(245,158,11,0.06)" }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-500">
              <path
                d="M8 2L14.5 13H1.5L8 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-amber-400 tracking-wider">
                {alert.plateNumber}
              </span>
              <span className="text-sm text-foreground">{alert.driverName}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{routeName(alert.routeId)}</span>
            </div>
            <p className="text-xs text-amber-500/80 mt-0.5">
              Último reporte GPS {silentLabel(alert.minutesSilent)}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismiss(alert.vehicleId)}
            className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Descartar alerta"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
