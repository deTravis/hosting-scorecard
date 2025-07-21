# Infrastructure Management System

## Overview

This is a full-stack web application for managing infrastructure in a hierarchical structure: Websites → Servers → Hosts. The application provides comprehensive tracking and monitoring of web applications, the servers they run on, and the physical hosts that power them. Built with a React frontend and Express backend, featuring a modern UI with shadcn/ui components and real-time monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: DatabaseStorage class implementing full CRUD operations
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement with Vite integration

## Key Components

### Normalized Database Schema
- **Hosts Table**: Physical machines/infrastructure (id, hostname, ipAddress, location, description, status, uptime, responseTime, lastCheck)
- **Servers Table**: Services running on hosts (id, name, hostId, port, protocol, description, status, uptime, responseTime, lastCheck)
- **Websites Table**: Frontend applications served by servers (id, name, url, serverId, description, status, uptime, responseTime, lastCheck)
- **Users Table**: Basic user authentication (id, username, password)

### API Endpoints
**Host Management:**
- `GET /api/hosts` - Retrieve all hosts
- `GET /api/hosts/:id` - Retrieve specific host
- `POST /api/hosts` - Create new host
- `PUT /api/hosts/:id` - Update existing host
- `DELETE /api/hosts/:id` - Delete host (if no dependent servers)
- `POST /api/hosts/:id/status` - Update host status

**Server Management:**
- `GET /api/servers` - Retrieve all servers
- `GET /api/servers/:id` - Retrieve specific server
- `GET /api/hosts/:hostId/servers` - Get servers for specific host
- `POST /api/servers` - Create new server
- `PUT /api/servers/:id` - Update existing server
- `DELETE /api/servers/:id` - Delete server (if no dependent websites)
- `POST /api/servers/:id/status` - Update server status

**Website Management:**
- `GET /api/websites` - Retrieve all websites
- `GET /api/websites/:id` - Retrieve specific website
- `GET /api/servers/:serverId/websites` - Get websites for specific server
- `POST /api/websites` - Create new website
- `PUT /api/websites/:id` - Update existing website
- `DELETE /api/websites/:id` - Delete website
- `POST /api/websites/:id/status` - Update website status

**Statistics:**
- `GET /api/stats` - Get comprehensive statistics for all entity types

### Frontend Features
- Tabbed dashboard with separate views for Websites, Servers, and Hosts
- Hierarchical relationship display showing Website → Server → Host connections
- Entity cards with status indicators (online/offline/warning)
- Modal forms for creating and editing entities
- Search and filtering capabilities
- Real-time status updates with simulated monitoring
- Responsive design with mobile support

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Layer**: Express routes handle CRUD operations with Zod validation
3. **Database Layer**: PostgreSQL database with Drizzle ORM and referential integrity
4. **Response**: JSON responses sent back to client
5. **UI Updates**: TanStack Query handles caching and re-rendering

## Referential Integrity

The system enforces referential integrity through:
- **Cascade Prevention**: Cannot delete hosts with dependent servers
- **Cascade Prevention**: Cannot delete servers with dependent websites
- **Foreign Key Relationships**: Servers reference hostId, Websites reference serverId
- **Relationship Queries**: Specialized endpoints for fetching related entities

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: CSS class variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: PostgreSQL with sample data initialization

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files

### Environment Configuration
- Uses environment variables for configuration
- Supports both development and production environments
- Replit-specific configurations for development banner and cartographer

## Recent Changes

**July 21, 2025 - Database Integration**
- **Database Migration**: Successfully migrated from in-memory storage to PostgreSQL database
- **Drizzle ORM**: Implemented DatabaseStorage class using Drizzle ORM for all CRUD operations
- **Schema Push**: Deployed database schema to PostgreSQL using `npm run db:push`
- **Sample Data**: Automatic initialization of sample data on first startup
- **Referential Integrity**: Database-level foreign key constraints between hosts, servers, and websites

**Previous Changes (January 2025)**
- **Architecture Restructure**: Moved from flat server management to hierarchical Website → Server → Host structure
- **Normalized Schema**: Implemented proper database normalization with foreign key relationships
- **Enhanced API**: Added comprehensive CRUD endpoints for all entity types
- **Improved UI**: Created tabbed interface with dedicated views for each entity type
- **Referential Integrity**: Added cascade prevention and relationship validation
- **Status Monitoring**: Implemented unified status tracking across all entity types

The application now uses a robust PostgreSQL database with Drizzle ORM, providing persistent data storage and proper relational integrity for the comprehensive infrastructure management solution.