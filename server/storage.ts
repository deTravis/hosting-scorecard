import { users, servers, type User, type InsertUser, type Server, type InsertServer, type UpdateServer } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Server operations
  getServers(): Promise<Server[]>;
  getServer(id: number): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: UpdateServer): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  updateServerStatus(id: number, status: string, uptime?: string, responseTime?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private currentUserId: number;
  private currentServerId: number;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.currentUserId = 1;
    this.currentServerId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample servers
    const sampleServers: InsertServer[] = [
      {
        hostname: "web-server-01",
        ipAddress: "192.168.1.10",
        location: "us-east",
        description: "Main web server"
      },
      {
        hostname: "api-server-02",
        ipAddress: "192.168.1.20",
        location: "us-west",
        description: "API gateway server"
      },
      {
        hostname: "db-server-03",
        ipAddress: "192.168.1.30",
        location: "eu-west",
        description: "Database server"
      }
    ];

    sampleServers.forEach(server => {
      const id = this.currentServerId++;
      const newServer: Server = {
        ...server,
        id,
        status: id === 1 ? "online" : id === 2 ? "offline" : "warning",
        uptime: id === 1 ? "99.9%" : id === 2 ? "95.2%" : "98.7%",
        responseTime: id === 1 ? "45ms" : id === 2 ? null : "120ms",
        lastCheck: new Date()
      };
      this.servers.set(id, newServer);
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

  async getServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
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
      lastCheck: new Date()
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
}

export const storage = new MemStorage();
