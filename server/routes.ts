import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, updateServerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all servers
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  // Get server by ID
  app.get("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  // Create new server
  app.post("/api/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  // Update server
  app.put("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateServerSchema.parse(req.body);
      const server = await storage.updateServer(id, validatedData);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  // Delete server
  app.delete("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteServer(id);
      if (!success) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json({ message: "Server deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Update server status (simulate monitoring)
  app.post("/api/servers/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, uptime, responseTime } = req.body;
      
      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      await storage.updateServerStatus(id, status, uptime, responseTime);
      res.json({ message: "Server status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update server status" });
    }
  });

  // Get server statistics
  app.get("/api/servers/stats", async (req, res) => {
    try {
      const servers = await storage.getServers();
      const stats = {
        totalCount: servers.length,
        onlineCount: servers.filter(s => s.status === "online").length,
        offlineCount: servers.filter(s => s.status === "offline").length,
        warningCount: servers.filter(s => s.status === "warning").length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
