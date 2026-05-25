import { Router } from "express";
import { db } from "@workspace/db";
import { routesTable, stopsTable, vehiclesTable, insertRouteSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/routes", async (req, res) => {
  const routes = await db.select().from(routesTable).orderBy(routesTable.id);
  res.json(routes);
});

router.post("/routes", async (req, res) => {
  const parsed = insertRouteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const [route] = await db.insert(routesTable).values(parsed.data).returning();
  res.status(201).json(route);
});

router.get("/routes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [route] = await db.select().from(routesTable).where(eq(routesTable.id, id));
  if (!route) {
    res.status(404).json({ error: "Ruta no encontrada" });
    return;
  }
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.routeId, id)).orderBy(stopsTable.order);
  const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.routeId, id));
  res.json({ ...route, stops, vehicles });
});

router.get("/routes/:id/stops", async (req, res) => {
  const id = Number(req.params.id);
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.routeId, id)).orderBy(stopsTable.order);
  res.json(stops);
});

router.post("/routes/:id/stops", async (req, res) => {
  const routeId = Number(req.params.id);
  const body = { ...req.body, routeId };
  const stops = await db.insert(stopsTable).values(body).returning();
  res.status(201).json(stops[0]);
});

export default router;
