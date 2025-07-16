import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Hosts - Physical machines/infrastructure
export const hosts = pgTable("hosts", {
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

// Servers - Services running on hosts
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hostId: integer("host_id").notNull(),
  port: integer("port").notNull(),
  protocol: text("protocol").notNull().default("http"), // http, https, ftp, etc.
  description: text("description"),
  status: text("status").notNull().default("offline"), // online, offline, warning
  uptime: text("uptime").default("0%"),
  responseTime: text("response_time"),
  lastCheck: timestamp("last_check").defaultNow(),
});

// Websites - Frontend applications served by servers
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  serverId: integer("server_id").notNull(),
  description: text("description"),
  status: text("status").notNull().default("offline"), // online, offline, warning
  uptime: text("uptime").default("0%"),
  responseTime: text("response_time"),
  lastCheck: timestamp("last_check").defaultNow(),
});

// Schema definitions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHostSchema = createInsertSchema(hosts).pick({
  hostname: true,
  ipAddress: true,
  location: true,
  description: true,
});

export const updateHostSchema = createInsertSchema(hosts).pick({
  hostname: true,
  ipAddress: true,
  location: true,
  description: true,
  status: true,
  uptime: true,
  responseTime: true,
}).partial();

export const insertServerSchema = createInsertSchema(servers).pick({
  name: true,
  hostId: true,
  port: true,
  protocol: true,
  description: true,
});

export const updateServerSchema = createInsertSchema(servers).pick({
  name: true,
  hostId: true,
  port: true,
  protocol: true,
  description: true,
  status: true,
  uptime: true,
  responseTime: true,
}).partial();

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  name: true,
  url: true,
  serverId: true,
  description: true,
});

export const updateWebsiteSchema = createInsertSchema(websites).pick({
  name: true,
  url: true,
  serverId: true,
  description: true,
  status: true,
  uptime: true,
  responseTime: true,
}).partial();

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHost = z.infer<typeof insertHostSchema>;
export type UpdateHost = z.infer<typeof updateHostSchema>;
export type Host = typeof hosts.$inferSelect;

export type InsertServer = z.infer<typeof insertServerSchema>;
export type UpdateServer = z.infer<typeof updateServerSchema>;
export type Server = typeof servers.$inferSelect;

export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type UpdateWebsite = z.infer<typeof updateWebsiteSchema>;
export type Website = typeof websites.$inferSelect;
