import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  status: text("status").notNull().default("offline"), // online, offline, warning
  uptime: text("uptime").default("0%"),
  responseTime: text("response_time"),
  lastCheck: timestamp("last_check").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertServerSchema = createInsertSchema(servers).pick({
  hostname: true,
  ipAddress: true,
  location: true,
  description: true,
});

export const updateServerSchema = createInsertSchema(servers).pick({
  hostname: true,
  ipAddress: true,
  location: true,
  description: true,
  status: true,
  uptime: true,
  responseTime: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
export type UpdateServer = z.infer<typeof updateServerSchema>;
export type Server = typeof servers.$inferSelect;
