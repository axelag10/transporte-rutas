import { useEffect, useRef } from "react";
import type { Stop, VehicleLive } from "@workspace/api-client-react";
import "leaflet/dist/leaflet.css";

interface Props {
  stops: Stop[];
  vehicles: VehicleLive[];
  color: string;
}

export function MapaLeaflet({ stops, vehicles, color }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Layer[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    let L: typeof import("leaflet");

    async function init() {
      L = (await import("leaflet")).default;

      // Fix default icon paths broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) return;

      // Default center: Zumpango, Estado de México
      const defaultCenter: [number, number] = [19.7956, -99.1003];

      const map = L.map(containerRef.current!, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      mapRef.current = map;

      drawLayers(L, map);
    }

    function drawLayers(L: typeof import("leaflet"), map: import("leaflet").Map) {
      // Clear previous layers
      markersRef.current.forEach((l) => map.removeLayer(l));
      markersRef.current = [];

      const sorted = [...stops].sort((a, b) => a.order - b.order);

      if (sorted.length > 0) {
        // Route polyline
        const polyline = L.polyline(
          sorted.map((s) => [s.lat, s.lng] as [number, number]),
          { color, weight: 3, opacity: 0.8, dashArray: "8 5" }
        ).addTo(map);
        markersRef.current.push(polyline);

        // Stop markers
        sorted.forEach((stop, i) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:26px;height:26px;border-radius:50%;
              background:hsl(215,25%,12%);
              border:2.5px solid ${color};
              display:flex;align-items:center;justify-content:center;
              font-size:10px;font-weight:700;color:${color};
              font-family:system-ui;
              box-shadow:0 2px 8px rgba(0,0,0,0.5);
            ">${i + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([stop.lat, stop.lng], { icon })
            .addTo(map)
            .bindTooltip(`<strong>${stop.name}</strong>`, {
              permanent: false,
              direction: "top",
              offset: [0, -14],
              className: "transbus-tooltip",
            });
          markersRef.current.push(marker);
        });

        // Fit bounds to stops
        if (vehicles.length === 0) {
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      }

      // Vehicle markers
      vehicles.forEach((v) => {
        const vIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:34px;height:34px;border-radius:50%;
            background:${color};
            display:flex;align-items:center;justify-content:center;
            font-size:13px;font-weight:900;color:hsl(215,28%,9%);
            box-shadow:0 0 0 4px ${color}44,0 4px 12px rgba(0,0,0,0.6);
            font-family:system-ui;
          ">B</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([v.lat, v.lng], { icon: vIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindTooltip(
            `<strong>${v.plateNumber}</strong><br/>${v.driverName}${
              v.speed != null ? `<br/>${Math.round(v.speed * 3.6)} km/h` : ""
            }`,
            { direction: "top", offset: [0, -18], className: "transbus-tooltip" }
          );
        markersRef.current.push(marker);
      });

      // Fit to all if vehicles present
      if (vehicles.length > 0 && stops.length > 0) {
        const allLatLngs: [number, number][] = [
          ...stops.map((s) => [s.lat, s.lng] as [number, number]),
          ...vehicles.map((v) => [v.lat, v.lng] as [number, number]),
        ];
        map.fitBounds(allLatLngs, { padding: [40, 40] });
      }
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Redraw layers when data changes without re-creating the map
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      const map = mapRef.current!;

      markersRef.current.forEach((l) => map.removeLayer(l));
      markersRef.current = [];

      const sorted = [...stops].sort((a, b) => a.order - b.order);

      if (sorted.length > 0) {
        const polyline = L.polyline(
          sorted.map((s) => [s.lat, s.lng] as [number, number]),
          { color, weight: 3, opacity: 0.8, dashArray: "8 5" }
        ).addTo(map);
        markersRef.current.push(polyline);

        sorted.forEach((stop, i) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:26px;height:26px;border-radius:50%;
              background:hsl(215,25%,12%);
              border:2.5px solid ${color};
              display:flex;align-items:center;justify-content:center;
              font-size:10px;font-weight:700;color:${color};
              font-family:system-ui;
              box-shadow:0 2px 8px rgba(0,0,0,0.5);
            ">${i + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([stop.lat, stop.lng], { icon })
            .addTo(map)
            .bindTooltip(`<strong>${stop.name}</strong>`, {
              permanent: false,
              direction: "top",
              offset: [0, -14],
              className: "transbus-tooltip",
            });
          markersRef.current.push(marker);
        });
      }

      vehicles.forEach((v) => {
        const vIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:34px;height:34px;border-radius:50%;
            background:${color};
            display:flex;align-items:center;justify-content:center;
            font-size:13px;font-weight:900;color:hsl(215,28%,9%);
            box-shadow:0 0 0 4px ${color}44,0 4px 12px rgba(0,0,0,0.6);
            font-family:system-ui;
          ">B</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([v.lat, v.lng], { icon: vIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindTooltip(
            `<strong>${v.plateNumber}</strong><br/>${v.driverName}${
              v.speed != null ? `<br/>${Math.round(v.speed * 3.6)} km/h` : ""
            }`,
            { direction: "top", offset: [0, -18], className: "transbus-tooltip" }
          );
        markersRef.current.push(marker);
      });
    });
  }, [stops, vehicles, color]);

  return (
    <>
      <style>{`
        .transbus-tooltip {
          background: hsl(215,25%,12%) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          color: rgba(255,255,255,0.9) !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .transbus-tooltip::before {
          border-top-color: rgba(255,255,255,0.15) !important;
        }
        .leaflet-control-zoom a {
          background: hsl(215,25%,12%) !important;
          color: rgba(255,255,255,0.8) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: hsl(215,25%,18%) !important;
          color: white !important;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full rounded-b-xl" />
    </>
  );
}
