import { pgTable, serial, real, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vehiclesTable } from "./vehicles";

export const positionsTable = pgTable(
  "positions",
  {
    id: serial("id").primaryKey(),
    vehicleId: integer("vehicle_id").notNull().references(() => vehiclesTable.id),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    speed: real("speed"),
    heading: real("heading"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (t) => [unique("positions_vehicle_unique").on(t.vehicleId)],
);

export const insertPositionSchema = createInsertSchema(positionsTable).omit({ id: true, recordedAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positionsTable.$inferSelect;
