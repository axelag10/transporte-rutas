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

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no definida");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log("Limpiando datos previos...");
  await pool.query(`TRUNCATE positions, shifts, vehicles, stops, routes RESTART IDENTITY CASCADE`);

  // ─── Rutas ──────────────────────────────────────────────────────────────────
  console.log("Insertando rutas...");
  const [rutaZumpango] = await db
    .insert(routesTable)
    .values({
      name: "San Juan Zitlaltepec - Metro La Raza",
      description:
        "Sale de San Juan Zitlaltepec por Av. 16 de Septiembre, Zumpango por Melchor Ocampo y Jorge Jiménez Cantú, conecta con Circuito Mexiquense Bicentenario, Carretera México-Pachuca, Metro Indios Verdes y Metro La Raza",
      color: "#0ea5e9",
      active: true,
    })
    .returning();

  const [rutaLocal] = await db
    .insert(routesTable)
    .values({
      name: "Zumpango Centro - Circuito",
      description:
        "Recorrido local por el centro de Zumpango hacia colonias periféricas",
      color: "#10b981",
      active: true,
    })
    .returning();

  // ─── Paradas Ruta 1: San Juan Zitlaltepec → Metro La Raza ─────────────────
  // Coordenadas reales del trayecto
  const paradasRuta1 = [
    // Origen
    { name: "San Juan Zitlaltepec", lat: 19.8102, lng: -99.1468, order: 1 },
    // Av. 16 de Septiembre rumbo a Zumpango (va hacia el este)
    { name: "Av. 16 de Septiembre", lat: 19.8072, lng: -99.1310, order: 2 },
    // Carr. Zumpango-Apaxco / entrada por Melchor Ocampo
    { name: "Carr. Zumpango - Apaxco / Melchor Ocampo", lat: 19.8022, lng: -99.1155, order: 3 },
    // Mercado de Zumpango / Jorge Jiménez Cantú
    { name: "Mercado Zumpango / Jorge Jiménez Cantú", lat: 19.7978, lng: -99.1044, order: 4 },
    // Av. de los Insurgentes (Zumpango sur)
    { name: "Av. de los Insurgentes (Zumpango)", lat: 19.7895, lng: -99.1095, order: 5 },
    // San Pedro de la Laguna / Carr. Cuautitlán-Zumpango
    { name: "San Pedro de la Laguna", lat: 19.7792, lng: -99.1152, order: 6 },
    // Circuito Mexiquense Bicentenario (Ojo de Agua)
    { name: "Circuito Mexiquense / Ojo de Agua", lat: 19.7045, lng: -99.0698, order: 7 },
    // Ecatepec norte — Los Héroes
    { name: "Los Héroes Ecatepec", lat: 19.6542, lng: -99.0448, order: 8 },
    // Ecatepec centro — Av. Central
    { name: "Ecatepec / Av. Central", lat: 19.6048, lng: -99.0342, order: 9 },
    // Enlace Carr. México-Pachuca (Ciudad Azteca)
    { name: "Ciudad Azteca / Carr. México - Pachuca", lat: 19.5698, lng: -99.0652, order: 10 },
    // Bajando por Méx-Pachuca hacia Indios Verdes
    { name: "Av. de los Cien Metros", lat: 19.5445, lng: -99.0980, order: 11 },
    // Metro Indios Verdes
    { name: "Metro Indios Verdes", lat: 19.5243, lng: -99.1298, order: 12 },
    // Metro La Raza (destino final)
    { name: "Metro La Raza", lat: 19.4683, lng: -99.1402, order: 13 },
  ];

  await db.insert(stopsTable).values(
    paradasRuta1.map((p) => ({ ...p, routeId: rutaZumpango.id }))
  );

  // ─── Paradas Ruta 2: Local Zumpango ──────────────────────────────────────────
  const paradasRuta2 = [
    { name: "Centro Zumpango", lat: 19.7983, lng: -99.0982, order: 1 },
    { name: "Col. La Laguna", lat: 19.8034, lng: -99.1023, order: 2 },
    { name: "IMSS Zumpango", lat: 19.8067, lng: -99.1098, order: 3 },
    { name: "Preparatoria Zumpango", lat: 19.8112, lng: -99.1145, order: 4 },
    { name: "Col. San Mateo", lat: 19.8089, lng: -99.1212, order: 5 },
    { name: "Mercado de Artesanías", lat: 19.8021, lng: -99.1198, order: 6 },
  ];

  await db.insert(stopsTable).values(
    paradasRuta2.map((p) => ({ ...p, routeId: rutaLocal.id }))
  );

  // ─── Vehículos ───────────────────────────────────────────────────────────────
  console.log("Insertando vehículos...");
  const vehiculosRuta1 = await db
    .insert(vehiclesTable)
    .values([
      { routeId: rutaZumpango.id, driverName: "Miguel Ángel Torres", plateNumber: "MEX-1234", active: true },
      { routeId: rutaZumpango.id, driverName: "Jesús Hernández Reyes", plateNumber: "MEX-5678", active: true },
      { routeId: rutaZumpango.id, driverName: "Roberto Sánchez Cruz", plateNumber: "MEX-9012", active: true },
    ])
    .returning();

  const vehiculosRuta2 = await db
    .insert(vehiclesTable)
    .values([
      { routeId: rutaLocal.id, driverName: "Carlos Mendoza Vega", plateNumber: "MEX-3456", active: true },
      { routeId: rutaLocal.id, driverName: "Antonio Ramírez Díaz", plateNumber: "MEX-7890", active: true },
    ])
    .returning();

  // ─── Turnos históricos ────────────────────────────────────────────────────────
  console.log("Insertando historial de turnos...");

  function horasAtras(h: number): Date {
    return new Date(Date.now() - h * 3600 * 1000);
  }
  function diasAtras(d: number, horaInicio = 7): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - d);
    fecha.setHours(horaInicio, 0, 0, 0);
    return fecha;
  }

  const turnos = [
    // Turno activo en curso (Miguel - MEX-1234)
    { vehicleId: vehiculosRuta1[0].id, startedAt: horasAtras(2), endedAt: null, positionsCount: 143 },
    // Turnos de hoy (ya cerrados)
    { vehicleId: vehiculosRuta1[1].id, startedAt: diasAtras(0, 6), endedAt: diasAtras(0, 14), positionsCount: 512 },
    { vehicleId: vehiculosRuta2[0].id, startedAt: diasAtras(0, 7), endedAt: diasAtras(0, 15), positionsCount: 388 },
    // Ayer
    { vehicleId: vehiculosRuta1[0].id, startedAt: diasAtras(1, 6), endedAt: diasAtras(1, 14), positionsCount: 498 },
    { vehicleId: vehiculosRuta1[2].id, startedAt: diasAtras(1, 7), endedAt: diasAtras(1, 16), positionsCount: 621 },
    { vehicleId: vehiculosRuta2[1].id, startedAt: diasAtras(1, 8), endedAt: diasAtras(1, 13), positionsCount: 295 },
    // Hace 2 días
    { vehicleId: vehiculosRuta1[1].id, startedAt: diasAtras(2, 6), endedAt: diasAtras(2, 15), positionsCount: 543 },
    { vehicleId: vehiculosRuta1[2].id, startedAt: diasAtras(2, 7), endedAt: diasAtras(2, 14), positionsCount: 478 },
    { vehicleId: vehiculosRuta2[0].id, startedAt: diasAtras(2, 9), endedAt: diasAtras(2, 17), positionsCount: 412 },
    // Hace 3 días
    { vehicleId: vehiculosRuta1[0].id, startedAt: diasAtras(3, 6), endedAt: diasAtras(3, 14), positionsCount: 502 },
    { vehicleId: vehiculosRuta2[1].id, startedAt: diasAtras(3, 7), endedAt: diasAtras(3, 16), positionsCount: 589 },
  ];

  await db.insert(shiftsTable).values(turnos);

  await pool.end();
  console.log("Seed completado.");
  console.log(`  Rutas: 2`);
  console.log(`  Paradas Ruta 1: ${paradasRuta1.length} (San Juan Zitlaltepec → Metro La Raza)`);
  console.log(`  Paradas Ruta 2: ${paradasRuta2.length}`);
  console.log(`  Vehículos: ${vehiculosRuta1.length + vehiculosRuta2.length}`);
  console.log(`  Turnos: ${turnos.length} (1 activo)`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
