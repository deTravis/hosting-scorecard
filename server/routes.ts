import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHostSchema, updateHostSchema,
  insertServerSchema, updateServerSchema,
  insertWebsiteSchema, updateWebsiteSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // HOST ROUTES
  app.get("/api/hosts", async (req, res) => {
    try {
      const hosts = await storage.getHosts();
      res.json(hosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  app.get("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const host = await storage.getHost(id);
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch host" });
    }
  });

  app.post("/api/hosts", async (req, res) => {
    try {
      const validatedData = insertHostSchema.parse(req.body);
      const host = await storage.createHost(validatedData);
      res.status(201).json(host);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid host data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create host" });
    }
  });

  app.put("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateHostSchema.parse(req.body);
      const host = await storage.updateHost(id, validatedData);
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid host data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update host" });
    }
  });

  app.delete("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHost(id);
      if (!success) {
        return res.status(400).json({ message: "Cannot delete host with dependent servers" });
      }
      res.json({ message: "Host deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete host" });
    }
  });

  app.post("/api/hosts/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, uptime, responseTime } = req.body;
      
      const host = await storage.getHost(id);
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }

      await storage.updateHostStatus(id, status, uptime, responseTime);
      res.json({ message: "Host status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update host status" });
    }
  });

  // SERVER ROUTES
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

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

  app.get("/api/hosts/:hostId/servers", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const servers = await storage.getServersByHost(hostId);
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers for host" });
    }
  });

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

  app.delete("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteServer(id);
      if (!success) {
        return res.status(400).json({ message: "Cannot delete server with dependent websites" });
      }
      res.json({ message: "Server deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

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

  // WEBSITE ROUTES
  app.get("/api/websites", async (req, res) => {
    try {
      const websites = await storage.getWebsites();
      res.json(websites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch websites" });
    }
  });

  app.get("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const website = await storage.getWebsite(id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      res.json(website);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch website" });
    }
  });

  app.get("/api/servers/:serverId/websites", async (req, res) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const websites = await storage.getWebsitesByServer(serverId);
      res.json(websites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch websites for server" });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      const validatedData = insertWebsiteSchema.parse(req.body);
      const website = await storage.createWebsite(validatedData);
      res.status(201).json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid website data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create website" });
    }
  });

  app.put("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateWebsiteSchema.parse(req.body);
      const website = await storage.updateWebsite(id, validatedData);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      res.json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid website data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update website" });
    }
  });

  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWebsite(id);
      if (!success) {
        return res.status(404).json({ message: "Website not found" });
      }
      res.json({ message: "Website deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete website" });
    }
  });

  app.post("/api/websites/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, uptime, responseTime } = req.body;
      
      const website = await storage.getWebsite(id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }

      await storage.updateWebsiteStatus(id, status, uptime, responseTime);
      res.json({ message: "Website status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update website status" });
    }
  });

  // STATISTICS ROUTES
  app.get("/api/stats", async (req, res) => {
    try {
      const hosts = await storage.getHosts();
      const servers = await storage.getServers();
      const websites = await storage.getWebsites();
      
      const stats = {
        hosts: {
          totalCount: hosts.length,
          onlineCount: hosts.filter(h => h.status === "online").length,
          offlineCount: hosts.filter(h => h.status === "offline").length,
          warningCount: hosts.filter(h => h.status === "warning").length,
        },
        servers: {
          totalCount: servers.length,
          onlineCount: servers.filter(s => s.status === "online").length,
          offlineCount: servers.filter(s => s.status === "offline").length,
          warningCount: servers.filter(s => s.status === "warning").length,
        },
        websites: {
          totalCount: websites.length,
          onlineCount: websites.filter(w => w.status === "online").length,
          offlineCount: websites.filter(w => w.status === "offline").length,
          warningCount: websites.filter(w => w.status === "warning").length,
        },
        // Legacy format for backward compatibility
        totalCount: websites.length,
        onlineCount: websites.filter(w => w.status === "online").length,
        offlineCount: websites.filter(w => w.status === "offline").length,
        warningCount: websites.filter(w => w.status === "warning").length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
