import { 
  users, hosts, servers, websites,
  type User, type InsertUser,
  type Host, type InsertHost, type UpdateHost,
  type Server, type InsertServer, type UpdateServer,
  type Website, type InsertWebsite, type UpdateWebsite
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Host operations
  getHosts(): Promise<Host[]>;
  getHost(id: number): Promise<Host | undefined>;
  createHost(host: InsertHost): Promise<Host>;
  updateHost(id: number, host: UpdateHost): Promise<Host | undefined>;
  deleteHost(id: number): Promise<boolean>;
  updateHostStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void>;
  
  // Server operations
  getServers(): Promise<Server[]>;
  getServersByHost(hostId: number): Promise<Server[]>;
  getServer(id: number): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: UpdateServer): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  updateServerStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void>;
  
  // Website operations
  getWebsites(): Promise<Website[]>;
  getWebsitesByServer(serverId: number): Promise<Website[]>;
  getWebsite(id: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: number, website: UpdateWebsite): Promise<Website | undefined>;
  deleteWebsite(id: number): Promise<boolean>;
  updateWebsiteStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeSampleData() {
    // Check if data already exists
    const existingHosts = await db.select().from(hosts);
    if (existingHosts.length > 0) {
      return; // Data already exists, don't re-initialize
    }

    // Add sample hosts
    const sampleHosts: InsertHost[] = [
      {
        hostname: "web-host-01",
        ipAddress: "192.168.1.10",
        location: "us-east",
        description: "Primary web hosting server"
      },
      {
        hostname: "app-host-02",
        ipAddress: "192.168.1.20",
        location: "us-west",
        description: "Application hosting server"
      },
      {
        hostname: "db-host-03",
        ipAddress: "192.168.1.30",
        location: "eu-west",
        description: "Database hosting server"
      }
    ];

    const createdHosts = await db.insert(hosts).values(sampleHosts).returning();

    // Add sample servers
    const sampleServers: InsertServer[] = [
      {
        name: "Nginx Web Server",
        hostId: createdHosts[0].id,
        port: 80,
        protocol: "http",
        description: "Main web server"
      },
      {
        name: "Node.js API Server",
        hostId: createdHosts[1].id,
        port: 3000,
        protocol: "http",
        description: "API backend server"
      },
      {
        name: "PostgreSQL Database",
        hostId: createdHosts[2].id,
        port: 5432,
        protocol: "tcp",
        description: "Primary database"
      }
    ];

    const createdServers = await db.insert(servers).values(sampleServers).returning();

    // Add sample websites
    const sampleWebsites: InsertWebsite[] = [
      {
        name: "Company Website",
        url: "https://company.com",
        serverId: createdServers[0].id,
        description: "Main company website"
      },
      {
        name: "Admin Dashboard",
        url: "https://admin.company.com",
        serverId: createdServers[0].id,
        description: "Admin control panel"
      },
      {
        name: "API Documentation",
        url: "https://api.company.com/docs",
        serverId: createdServers[1].id,
        description: "API documentation site"
      }
    ];

    await db.insert(websites).values(sampleWebsites);

    // Update statuses for sample data
    await db.update(hosts).set({ status: "online", uptime: "99.9%", responseTime: "45ms" }).where(eq(hosts.id, createdHosts[0].id));
    await db.update(hosts).set({ status: "offline", uptime: "95.2%", responseTime: null }).where(eq(hosts.id, createdHosts[1].id));
    await db.update(hosts).set({ status: "warning", uptime: "98.7%", responseTime: "120ms" }).where(eq(hosts.id, createdHosts[2].id));

    await db.update(servers).set({ status: "online", uptime: "99.8%", responseTime: "25ms" }).where(eq(servers.id, createdServers[0].id));
    await db.update(servers).set({ status: "offline", uptime: "94.5%", responseTime: null }).where(eq(servers.id, createdServers[1].id));
    await db.update(servers).set({ status: "warning", uptime: "97.2%", responseTime: "150ms" }).where(eq(servers.id, createdServers[2].id));

    const createdWebsites = await db.select().from(websites);
    if (createdWebsites.length > 0) {
      await db.update(websites).set({ status: "online", uptime: "99.7%", responseTime: "180ms" }).where(eq(websites.id, createdWebsites[0].id));
      if (createdWebsites[1]) {
        await db.update(websites).set({ status: "offline", uptime: "92.1%", responseTime: null }).where(eq(websites.id, createdWebsites[1].id));
      }
      if (createdWebsites[2]) {
        await db.update(websites).set({ status: "warning", uptime: "96.8%", responseTime: "320ms" }).where(eq(websites.id, createdWebsites[2].id));
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Host operations
  async getHosts(): Promise<Host[]> {
    return await db.select().from(hosts);
  }

  async getHost(id: number): Promise<Host | undefined> {
    const [host] = await db.select().from(hosts).where(eq(hosts.id, id));
    return host || undefined;
  }

  async createHost(insertHost: InsertHost): Promise<Host> {
    const [host] = await db
      .insert(hosts)
      .values({
        ...insertHost,
        status: "offline",
        uptime: "0%",
        responseTime: null
      })
      .returning();
    return host;
  }

  async updateHost(id: number, updateHost: UpdateHost): Promise<Host | undefined> {
    const [host] = await db
      .update(hosts)
      .set({
        ...updateHost,
        lastCheck: new Date()
      })
      .where(eq(hosts.id, id))
      .returning();
    return host || undefined;
  }

  async deleteHost(id: number): Promise<boolean> {
    // Check if any servers depend on this host
    const dependentServers = await db.select().from(servers).where(eq(servers.hostId, id));
    if (dependentServers.length > 0) {
      return false; // Cannot delete host with dependent servers
    }
    
    const result = await db.delete(hosts).where(eq(hosts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateHostStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const updateData: any = {
      status,
      lastCheck: new Date()
    };
    if (uptime) updateData.uptime = uptime;
    if (responseTime !== undefined) updateData.responseTime = responseTime;

    await db.update(hosts).set(updateData).where(eq(hosts.id, id));
  }

  // Server operations
  async getServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async getServersByHost(hostId: number): Promise<Server[]> {
    return await db.select().from(servers).where(eq(servers.hostId, hostId));
  }

  async getServer(id: number): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server || undefined;
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const [server] = await db
      .insert(servers)
      .values({
        ...insertServer,
        status: "offline",
        uptime: "0%",
        responseTime: null,
        protocol: insertServer.protocol || "http"
      })
      .returning();
    return server;
  }

  async updateServer(id: number, updateServer: UpdateServer): Promise<Server | undefined> {
    const [server] = await db
      .update(servers)
      .set({
        ...updateServer,
        lastCheck: new Date()
      })
      .where(eq(servers.id, id))
      .returning();
    return server || undefined;
  }

  async deleteServer(id: number): Promise<boolean> {
    // Check if any websites depend on this server
    const dependentWebsites = await db.select().from(websites).where(eq(websites.serverId, id));
    if (dependentWebsites.length > 0) {
      return false; // Cannot delete server with dependent websites
    }
    
    const result = await db.delete(servers).where(eq(servers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateServerStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const updateData: any = {
      status,
      lastCheck: new Date()
    };
    if (uptime) updateData.uptime = uptime;
    if (responseTime !== undefined) updateData.responseTime = responseTime;

    await db.update(servers).set(updateData).where(eq(servers.id, id));
  }

  // Website operations
  async getWebsites(): Promise<Website[]> {
    return await db.select().from(websites);
  }

  async getWebsitesByServer(serverId: number): Promise<Website[]> {
    return await db.select().from(websites).where(eq(websites.serverId, serverId));
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.id, id));
    return website || undefined;
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const [website] = await db
      .insert(websites)
      .values({
        ...insertWebsite,
        status: "offline",
        uptime: "0%",
        responseTime: null
      })
      .returning();
    return website;
  }

  async updateWebsite(id: number, updateWebsite: UpdateWebsite): Promise<Website | undefined> {
    const [website] = await db
      .update(websites)
      .set({
        ...updateWebsite,
        lastCheck: new Date()
      })
      .where(eq(websites.id, id))
      .returning();
    return website || undefined;
  }

  async deleteWebsite(id: number): Promise<boolean> {
    const result = await db.delete(websites).where(eq(websites.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateWebsiteStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const updateData: any = {
      status,
      lastCheck: new Date()
    };
    if (uptime) updateData.uptime = uptime;
    if (responseTime !== undefined) updateData.responseTime = responseTime;

    await db.update(websites).set(updateData).where(eq(websites.id, id));
  }
}

const databaseStorage = new DatabaseStorage();

// Initialize sample data when the storage is first created, but handle errors gracefully
databaseStorage.initializeSampleData().catch((error) => {
  console.error('Failed to initialize sample data:', error);
  // Don't throw the error to prevent app startup failure
});

export const storage = databaseStorage;
