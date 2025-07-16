import { 
  users, hosts, servers, websites,
  type User, type InsertUser,
  type Host, type InsertHost, type UpdateHost,
  type Server, type InsertServer, type UpdateServer,
  type Website, type InsertWebsite, type UpdateWebsite
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hosts: Map<number, Host>;
  private servers: Map<number, Server>;
  private websites: Map<number, Website>;
  private currentUserId: number;
  private currentHostId: number;
  private currentServerId: number;
  private currentWebsiteId: number;

  constructor() {
    this.users = new Map();
    this.hosts = new Map();
    this.servers = new Map();
    this.websites = new Map();
    this.currentUserId = 1;
    this.currentHostId = 1;
    this.currentServerId = 1;
    this.currentWebsiteId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
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

    sampleHosts.forEach(host => {
      const hostId = this.currentHostId++;
      const newHost: Host = {
        ...host,
        id: hostId,
        status: hostId === 1 ? "online" : hostId === 2 ? "offline" : "warning",
        uptime: hostId === 1 ? "99.9%" : hostId === 2 ? "95.2%" : "98.7%",
        responseTime: hostId === 1 ? "45ms" : hostId === 2 ? null : "120ms",
        lastCheck: new Date(),
        description: host.description || null
      };
      this.hosts.set(hostId, newHost);
    });

    // Add sample servers
    const sampleServers: InsertServer[] = [
      {
        name: "Nginx Web Server",
        hostId: 1,
        port: 80,
        protocol: "http",
        description: "Main web server"
      },
      {
        name: "Node.js API Server",
        hostId: 2,
        port: 3000,
        protocol: "http",
        description: "API backend server"
      },
      {
        name: "PostgreSQL Database",
        hostId: 3,
        port: 5432,
        protocol: "tcp",
        description: "Primary database"
      }
    ];

    sampleServers.forEach(server => {
      const serverId = this.currentServerId++;
      const newServer: Server = {
        ...server,
        id: serverId,
        status: serverId === 1 ? "online" : serverId === 2 ? "offline" : "warning",
        uptime: serverId === 1 ? "99.8%" : serverId === 2 ? "94.5%" : "97.2%",
        responseTime: serverId === 1 ? "25ms" : serverId === 2 ? null : "150ms",
        lastCheck: new Date(),
        description: server.description || null,
        protocol: server.protocol || "http"
      };
      this.servers.set(serverId, newServer);
    });

    // Add sample websites
    const sampleWebsites: InsertWebsite[] = [
      {
        name: "Company Website",
        url: "https://company.com",
        serverId: 1,
        description: "Main company website"
      },
      {
        name: "Admin Dashboard",
        url: "https://admin.company.com",
        serverId: 1,
        description: "Admin control panel"
      },
      {
        name: "API Documentation",
        url: "https://api.company.com/docs",
        serverId: 2,
        description: "API documentation site"
      }
    ];

    sampleWebsites.forEach(website => {
      const websiteId = this.currentWebsiteId++;
      const newWebsite: Website = {
        ...website,
        id: websiteId,
        status: websiteId === 1 ? "online" : websiteId === 2 ? "offline" : "warning",
        uptime: websiteId === 1 ? "99.7%" : websiteId === 2 ? "92.1%" : "96.8%",
        responseTime: websiteId === 1 ? "180ms" : websiteId === 2 ? null : "320ms",
        lastCheck: new Date(),
        description: website.description || null
      };
      this.websites.set(websiteId, newWebsite);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Host operations
  async getHosts(): Promise<Host[]> {
    return Array.from(this.hosts.values());
  }

  async getHost(id: number): Promise<Host | undefined> {
    return this.hosts.get(id);
  }

  async createHost(insertHost: InsertHost): Promise<Host> {
    const id = this.currentHostId++;
    const host: Host = {
      ...insertHost,
      id,
      status: "offline",
      uptime: "0%",
      responseTime: null,
      lastCheck: new Date(),
      description: insertHost.description || null
    };
    this.hosts.set(id, host);
    return host;
  }

  async updateHost(id: number, updateHost: UpdateHost): Promise<Host | undefined> {
    const existing = this.hosts.get(id);
    if (!existing) return undefined;
    
    const updated: Host = {
      ...existing,
      ...updateHost,
      lastCheck: new Date()
    };
    this.hosts.set(id, updated);
    return updated;
  }

  async deleteHost(id: number): Promise<boolean> {
    // Check if any servers depend on this host
    const dependentServers = Array.from(this.servers.values()).filter(s => s.hostId === id);
    if (dependentServers.length > 0) {
      return false; // Cannot delete host with dependent servers
    }
    return this.hosts.delete(id);
  }

  async updateHostStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const host = this.hosts.get(id);
    if (host) {
      host.status = status;
      host.lastCheck = new Date();
      if (uptime) host.uptime = uptime;
      if (responseTime) host.responseTime = responseTime;
      this.hosts.set(id, host);
    }
  }

  // Server operations
  async getServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async getServersByHost(hostId: number): Promise<Server[]> {
    return Array.from(this.servers.values()).filter(s => s.hostId === hostId);
  }

  async getServer(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const id = this.currentServerId++;
    const server: Server = {
      ...insertServer,
      id,
      status: "offline",
      uptime: "0%",
      responseTime: null,
      lastCheck: new Date(),
      description: insertServer.description || null,
      protocol: insertServer.protocol || "http"
    };
    this.servers.set(id, server);
    return server;
  }

  async updateServer(id: number, updateServer: UpdateServer): Promise<Server | undefined> {
    const existing = this.servers.get(id);
    if (!existing) return undefined;
    
    const updated: Server = {
      ...existing,
      ...updateServer,
      lastCheck: new Date()
    };
    this.servers.set(id, updated);
    return updated;
  }

  async deleteServer(id: number): Promise<boolean> {
    // Check if any websites depend on this server
    const dependentWebsites = Array.from(this.websites.values()).filter(w => w.serverId === id);
    if (dependentWebsites.length > 0) {
      return false; // Cannot delete server with dependent websites
    }
    return this.servers.delete(id);
  }

  async updateServerStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const server = this.servers.get(id);
    if (server) {
      server.status = status;
      server.lastCheck = new Date();
      if (uptime) server.uptime = uptime;
      if (responseTime) server.responseTime = responseTime;
      this.servers.set(id, server);
    }
  }

  // Website operations
  async getWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }

  async getWebsitesByServer(serverId: number): Promise<Website[]> {
    return Array.from(this.websites.values()).filter(w => w.serverId === serverId);
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.currentWebsiteId++;
    const website: Website = {
      ...insertWebsite,
      id,
      status: "offline",
      uptime: "0%",
      responseTime: null,
      lastCheck: new Date(),
      description: insertWebsite.description || null
    };
    this.websites.set(id, website);
    return website;
  }

  async updateWebsite(id: number, updateWebsite: UpdateWebsite): Promise<Website | undefined> {
    const existing = this.websites.get(id);
    if (!existing) return undefined;
    
    const updated: Website = {
      ...existing,
      ...updateWebsite,
      lastCheck: new Date()
    };
    this.websites.set(id, updated);
    return updated;
  }

  async deleteWebsite(id: number): Promise<boolean> {
    return this.websites.delete(id);
  }

  async updateWebsiteStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void> {
    const website = this.websites.get(id);
    if (website) {
      website.status = status;
      website.lastCheck = new Date();
      if (uptime) website.uptime = uptime;
      if (responseTime) website.responseTime = responseTime;
      this.websites.set(id, website);
    }
  }
}

export const storage = new MemStorage();
