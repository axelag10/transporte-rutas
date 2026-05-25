import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, vehiclesTable, positionsTable } from "@workspace/db/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";

const router = Router();

router.post("/shifts", async (req, res) => {
  const { vehicleId } = req.body as { vehicleId: number };
  if (!vehicleId || typeof vehicleId !== "number") {
    res.status(400).json({ error: "vehicleId requerido" });
    return;
  }
  const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId));
  if (!vehicle) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  const [shift] = await db.insert(shiftsTable).values({ vehicleId }).returning();
  res.status(201).json(shift);
});

router.patch("/shifts/:id/end", async (req, res) => {
  const id = Number(req.params.id);
  const [shift] = await db.select().from(shiftsTable).where(eq(shiftsTable.id, id));
  if (!shift) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  if (shift.endedAt) {
    res.status(400).json({ error: "El turno ya fue finalizado" });
    return;
  }

  const endedAt = new Date();
  const [posCount] = await db
    .select({ value: count() })
    .from(positionsTable)
    .where(
      and(
        eq(positionsTable.vehicleId, shift.vehicleId),
        gte(positionsTable.recordedAt, shift.startedAt),
        lte(positionsTable.recordedAt, endedAt),
      ),
    );

  const [updated] = await db
    .update(shiftsTable)
    .set({ endedAt, positionsCount: posCount?.value ?? 0 })
    .where(eq(shiftsTable.id, id))
    .returning();

  res.json(updated);
});

router.get("/shifts", async (req, res) => {
  const vehicleIdRaw = req.query["vehicleId"];
  const vehicleId = vehicleIdRaw ? Number(vehicleIdRaw) : undefined;

  const rows = await db
    .select({
      id: shiftsTable.id,
      vehicleId: shiftsTable.vehicleId,
      startedAt: shiftsTable.startedAt,
      endedAt: shiftsTable.endedAt,
      positionsCount: shiftsTable.positionsCount,
      plateNumber: vehiclesTable.plateNumber,
      driverName: vehiclesTable.driverName,
    })
    .from(shiftsTable)
    .innerJoin(vehiclesTable, eq(shiftsTable.vehicleId, vehiclesTable.id))
    .where(vehicleId ? eq(shiftsTable.vehicleId, vehicleId) : undefined)
    .orderBy(desc(shiftsTable.startedAt))
    .limit(100);

  res.json(rows);
});

export default router;
