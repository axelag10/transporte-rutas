import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  routesTable,
  stopsTable,
  vehiclesTable,
  shiftsTable,
  positionsTable,
} from "../../lib/db/src/schema/index.js";
import { inArray, eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no definida");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Waypoints de la Ruta 1: San Juan Zitlaltepec → Metro La Raza
const WAYPOINTS = [
  { lat: 19.81022, lng: -99.14677 },  // San Juan Zitlaltepec
  { lat: 19.80100, lng: -99.13500 },  // Av. 16 de Septiembre (intermedio)
  { lat: 19.79930, lng: -99.10339 },  // Estacion Brujas
  { lat: 19.79775, lng: -99.10444 },  // Mercado Zumpango
  { lat: 19.78900, lng: -99.11000 },  // Jorge Jimenez Cantu (intermedio)
  { lat: 19.77921, lng: -99.11518 },  // San Pedro de la Laguna
  { lat: 19.78200, lng: -99.04600 },  // Circuito Mexiquense Bicentenario
  { lat: 19.70000, lng: -99.07000 },  // Carretera (intermedio)
  { lat: 19.60000, lng: -99.07800 },  // Carretera (intermedio)
  { lat: 19.54400, lng: -99.08100 },  // Carr. Mexico-Pachuca
  { lat: 19.52000, lng: -99.09000 },  // Zona norte CDMX (intermedio)
  { lat: 19.50000, lng: -99.11000 },  // Acercandose a Indios Verdes
  { lat: 19.48508, lng: -99.12549 },  // Metro Indios Verdes
  { lat: 19.47890, lng: -99.13050 },  // Metro 18 de Marzo
  { lat: 19.47360, lng: -99.13520 },  // Metro Potrero
  { lat: 19.46829, lng: -99.14018 },  // Metro La Raza
];

// Velocidades aproximadas en m/s por tramo (para simular velocidad GPS)
const SEGMENT_SPEEDS_KMH = [40, 50, 30, 25, 40, 60, 80, 80, 80, 70, 60, 50, 30, 20, 15, 15];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function distKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Genera posiciones GPS interpolando entre los waypoints
function generateTrack(
  startTime: Date,
  intervalSec: number
): Array<{ lat: number; lng: number; speed: number; heading: number; recordedAt: Date }> {
  const positions: Array<{ lat: number; lng: number; speed: number; heading: number; recordedAt: Date }> = [];

  // Calcular duración total del trayecto en segundos
  let totalSec = 0;
  const segmentDurations: number[] = [];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const dist = distKm(WAYPOINTS[i], WAYPOINTS[i + 1]);
    const speedKmh = SEGMENT_SPEEDS_KMH[i] ?? 40;
    const durSec = (dist / speedKmh) * 3600;
    segmentDurations.push(durSec);
    totalSec += durSec;
  }

  let elapsed = 0;
  while (elapsed <= totalSec) {
    // Encontrar en qué segmento estamos
    let segStart = 0;
    let segIdx = 0;
    for (let i = 0; i < segmentDurations.length; i++) {
      if (elapsed < segStart + segmentDurations[i]) {
        segIdx = i;
        break;
      }
      segStart += segmentDurations[i];
      if (i === segmentDurations.length - 1) segIdx = i;
    }

    const t = segmentDurations[segIdx] > 0 ? (elapsed - segStart) / segmentDurations[segIdx] : 1;
    const tClamped = Math.max(0, Math.min(1, t));

    const from = WAYPOINTS[segIdx];
    const to = WAYPOINTS[segIdx + 1] ?? WAYPOINTS[segIdx];

    const lat = lerp(from.lat, to.lat, tClamped);
    const lng = lerp(from.lng, to.lng, tClamped);

    // Heading (azimuth) entre dos puntos
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

    const speedKmh = SEGMENT_SPEEDS_KMH[segIdx] ?? 40;
    // Variacion aleatoria de +/-10% en velocidad para simular trafico
    const speedVariation = 0.9 + Math.random() * 0.2;
    const speedMs = (speedKmh * speedVariation) / 3.6;

    positions.push({
      lat: lat + (Math.random() - 0.5) * 0.0001,  // ruido GPS minimo
      lng: lng + (Math.random() - 0.5) * 0.0001,
      speed: Math.round(speedMs * 10) / 10,
      heading: Math.round(heading),
      recordedAt: new Date(startTime.getTime() + elapsed * 1000),
    });

    elapsed += intervalSec;
  }

  return positions;
}

async function main() {
  console.log("Limpiando datos de demo...");

  // 1. Borrar todas las posiciones y turnos
  await db.delete(positionsTable);
  await db.delete(shiftsTable);

  // 2. Borrar rutas 2 y 3 (y sus paradas y vehiculos)
  const demoRouteIds = [2, 3];
  await db.delete(stopsTable).where(inArray(stopsTable.routeId, demoRouteIds));
  await db.delete(vehiclesTable).where(inArray(vehiclesTable.routeId, demoRouteIds));
  await db.delete(routesTable).where(inArray(routesTable.id, demoRouteIds));

  console.log("Rutas demo borradas.");

  // 3. Verificar vehiculos de ruta 1
  const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.routeId, 1));
  console.log(`Vehiculos ruta 1: ${vehicles.map((v) => v.plateNumber).join(", ")}`);

  if (vehicles.length === 0) {
    console.error("No hay vehiculos en ruta 1. Ejecuta el seed base primero.");
    process.exit(1);
  }

  // 4. Generar turnos de los ultimos 7 dias (lunes a domingo de la semana pasada + hoy)
  const today = new Date("2026-05-26T00:00:00.000Z");
  const GPS_INTERVAL_SEC = 25; // puntos cada 25 segundos

  // Dias del historial: May 19 (lun) a May 25 (dom) + May 26 hoy
  const days: Date[] = [];
  for (let d = 0; d < 8; d++) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - 7 + d);
    days.push(day);
  }

  // Turnos por dia: cada vehiculo hace 2 turnos (manana y tarde)
  // Hoy (May 26) solo 1 turno completado
  const shiftsToInsert: Array<{
    vehicleId: number;
    startTime: Date;
    durationHours: number;
    complete: boolean;
  }> = [];

  for (const day of days) {
    const isToday = day.toDateString() === new Date("2026-05-26").toDateString();
    const isWeekend = [0, 6].includes(day.getUTCDay());

    for (const v of vehicles) {
      if (isWeekend) {
        // Sabado/domingo: solo 1 turno manana, sin tarde
        const start = new Date(day);
        start.setUTCHours(8, 0, 0, 0); // 8am UTC = 2am local... hmm, use local-ish
        // Mexico UTC-6, asi que 6am local = 12 UTC
        start.setUTCHours(12, Math.floor(Math.random() * 20), 0, 0);
        shiftsToInsert.push({ vehicleId: v.id, startTime: start, durationHours: 2.2, complete: true });
        continue;
      }

      if (isToday) {
        // Hoy: 1 turno manana completado
        const start = new Date(day);
        start.setUTCHours(12, Math.floor(Math.random() * 30), 0, 0); // ~6am local
        shiftsToInsert.push({ vehicleId: v.id, startTime: start, durationHours: 2.5, complete: true });
        continue;
      }

      // Dias normales (lun-vie): turno manana y tarde
      // Turno manana: ~6am local = 12 UTC
      const startManana = new Date(day);
      startManana.setUTCHours(12, Math.floor(Math.random() * 20), 0, 0);
      shiftsToInsert.push({ vehicleId: v.id, startTime: startManana, durationHours: 2.3 + Math.random() * 0.5, complete: true });

      // Turno tarde: ~14pm local = 20 UTC
      const startTarde = new Date(day);
      startTarde.setUTCHours(20, Math.floor(Math.random() * 30), 0, 0);
      shiftsToInsert.push({ vehicleId: v.id, startTime: startTarde, durationHours: 2.1 + Math.random() * 0.4, complete: true });
    }
  }

  console.log(`Generando ${shiftsToInsert.length} turnos...`);

  let totalPositions = 0;

  for (const s of shiftsToInsert) {
    const endTime = new Date(s.startTime.getTime() + s.durationHours * 3600 * 1000);

    const [shift] = await db
      .insert(shiftsTable)
      .values({
        vehicleId: s.vehicleId,
        startedAt: s.startTime,
        endedAt: s.complete ? endTime : null,
      })
      .returning();

    // Generar posiciones GPS a lo largo del trayecto
    const track = generateTrack(s.startTime, GPS_INTERVAL_SEC);

    // Solo incluir posiciones dentro del turno
    const validPositions = track.filter(
      (p) => p.recordedAt >= s.startTime && p.recordedAt <= endTime
    );

    if (validPositions.length > 0) {
      // Insertar en lotes de 200
      for (let i = 0; i < validPositions.length; i += 200) {
        const batch = validPositions.slice(i, i + 200);
        await db.insert(positionsTable).values(
          batch.map((p) => ({
            vehicleId: s.vehicleId,
            shiftId: shift.id,
            lat: p.lat,
            lng: p.lng,
            speed: p.speed,
            heading: p.heading,
            recordedAt: p.recordedAt,
          }))
        );
      }
      totalPositions += validPositions.length;
    }

    process.stdout.write(".");
  }

  console.log(`\nListo. ${shiftsToInsert.length} turnos, ${totalPositions} posiciones GPS generadas.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
