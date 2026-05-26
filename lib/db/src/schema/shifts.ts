import { pgTable, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { vehiclesTable } from "./vehicles";

export const shiftsTable = pgTable("shifts", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehiclesTable.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  positionsCount: integer("positions_count").notNull().default(0),
  avgSpeed: real("avg_speed"),
  maxSpeed: real("max_speed"),
});

export type Shift = typeof shiftsTable.$inferSelect;
