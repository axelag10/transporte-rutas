import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, vehiclesTable, positionsTable } from "@workspace/db/schema";
import { eq, isNull, desc } from "drizzle-orm";

const router = Router();

router.get("/vehicles/offline", async (req, res) => {
  const thresholdMin = Number(req.query["thresholdMin"] ?? 10);
  const cutoff = new Date(Date.now() - thresholdMin * 60 * 1000);

  const activeShifts = await db
    .select({
      shiftId: shiftsTable.id,
      shiftStartedAt: shiftsTable.startedAt,
      vehicleId: vehiclesTable.id,
      plateNumber: vehiclesTable.plateNumber,
      driverName: vehiclesTable.driverName,
      routeId: vehiclesTable.routeId,
    })
    .from(shiftsTable)
    .innerJoin(vehiclesTable, eq(shiftsTable.vehicleId, vehiclesTable.id))
    .where(isNull(shiftsTable.endedAt));

  const alerts = await Promise.all(
    activeShifts.map(async (shift) => {
      const [lastPos] = await db
        .select({ recordedAt: positionsTable.recordedAt })
        .from(positionsTable)
        .where(eq(positionsTable.vehicleId, shift.vehicleId))
        .orderBy(desc(positionsTable.recordedAt))
        .limit(1);

      const lastPositionAt = lastPos?.recordedAt ?? null;
      const isSilent = !lastPositionAt || lastPositionAt < cutoff;
      if (!isSilent) return null;

      const minutesSilent = lastPositionAt
        ? Math.floor((Date.now() - lastPositionAt.getTime()) / 60000)
        : null;

      return {
        shiftId: shift.shiftId,
        shiftStartedAt: shift.shiftStartedAt,
        vehicleId: shift.vehicleId,
        plateNumber: shift.plateNumber,
        driverName: shift.driverName,
        routeId: shift.routeId,
        lastPositionAt,
        minutesSilent,
      };
    })
  );

  res.json(alerts.filter(Boolean));
});

export default router;
