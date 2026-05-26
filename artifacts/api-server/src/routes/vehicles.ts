import { Router } from "express";
import { db } from "@workspace/db";
import {
  vehiclesTable,
  positionsTable,
  stopsTable,
  insertVehicleSchema,
  insertPositionSchema,
} from "@workspace/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

const router = Router();

router.get("/vehicles", async (req, res) => {
  const vehicles = await db.select().from(vehiclesTable).orderBy(vehiclesTable.id);
  res.json(vehicles);
});

router.post("/vehicles", async (req, res) => {
  const parsed = insertVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const [vehicle] = await db.insert(vehiclesTable).values(parsed.data).returning();
  res.status(201).json(vehicle);
});

const updateVehicleSchema = insertVehicleSchema.partial();

router.put("/vehicles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const [vehicle] = await db
    .update(vehiclesTable)
    .set(parsed.data)
    .where(eq(vehiclesTable.id, id))
    .returning();
  if (!vehicle) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.json(vehicle);
});

router.delete("/vehicles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.json({ ok: true, id });
});

router.post("/vehicles/:id/verify-pin", async (req, res) => {
  const vehicleId = Number(req.params.id);
  const { pin } = req.body as { pin?: string };

  if (!pin || typeof pin !== "string") {
    res.status(400).json({ error: "PIN requerido" });
    return;
  }

  const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId));
  if (!vehicle) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }

  if (vehicle.pin !== pin) {
    res.status(401).json({ ok: false, vehicleId });
    return;
  }

  res.json({ ok: true, vehicleId });
});

router.post("/vehicles/:id/position", async (req, res) => {
  const vehicleId = Number(req.params.id);
  const parsed = insertPositionSchema.safeParse({ ...req.body, vehicleId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const [position] = await db
    .insert(positionsTable)
    .values({ ...parsed.data, recordedAt: new Date() })
    .onConflictDoUpdate({
      target: positionsTable.vehicleId,
      set: {
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        speed: parsed.data.speed ?? null,
        heading: parsed.data.heading ?? null,
        recordedAt: new Date(),
      },
    })
    .returning();
  res.json({ ok: true, recordedAt: position.recordedAt });
});

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get("/vehicles/:id/eta", async (req, res) => {
  const vehicleId = Number(req.params.id);
  const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId));
  if (!vehicle) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }

  const [lastPos] = await db
    .select()
    .from(positionsTable)
    .where(eq(positionsTable.vehicleId, vehicleId))
    .orderBy(desc(positionsTable.recordedAt))
    .limit(1);

  if (!lastPos) {
    res.status(404).json({ error: "Sin posición registrada" });
    return;
  }

  const stops = await db
    .select()
    .from(stopsTable)
    .where(eq(stopsTable.routeId, vehicle.routeId))
    .orderBy(stopsTable.order);

  const AVG_SPEED_KMH = lastPos.speed && lastPos.speed > 2 ? lastPos.speed * 3.6 : 25;

  const stopsWithEta = stops.map((stop) => {
    const distanceKm = haversineKm(lastPos.lat, lastPos.lng, stop.lat, stop.lng);
    const etaMinutes = (distanceKm / AVG_SPEED_KMH) * 60;
    return {
      stopId: stop.id,
      stopName: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      order: stop.order,
      etaMinutes: Math.round(etaMinutes * 10) / 10,
      distanceKm: Math.round(distanceKm * 100) / 100,
    };
  });

  res.json({
    vehicleId,
    currentLat: lastPos.lat,
    currentLng: lastPos.lng,
    stops: stopsWithEta,
  });
});

router.get("/routes/:id/live", async (req, res) => {
  const routeId = Number(req.params.id);
  const vehicles = await db
    .select()
    .from(vehiclesTable)
    .where(and(eq(vehiclesTable.routeId, routeId), eq(vehiclesTable.active, true)));

  const since = new Date(Date.now() - 10 * 60 * 1000);

  const liveVehicles = await Promise.all(
    vehicles.map(async (v) => {
      const [pos] = await db
        .select()
        .from(positionsTable)
        .where(and(eq(positionsTable.vehicleId, v.id), gte(positionsTable.recordedAt, since)))
        .orderBy(desc(positionsTable.recordedAt))
        .limit(1);

      return {
        vehicleId: v.id,
        driverName: v.driverName,
        plateNumber: v.plateNumber,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        speed: pos?.speed ?? null,
        heading: pos?.heading ?? null,
        updatedAt: pos?.recordedAt ?? null,
      };
    }),
  );

  res.json({ routeId, vehicles: liveVehicles.filter((v) => v.lat !== null) });
});

export default router;
