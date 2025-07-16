# Server Host Manager

## Overview

This is a full-stack web application for managing server hosts. The application allows users to create, read, update, and delete server records with details like hostname, IP address, location, and status monitoring. It's built with a React frontend and Express backend, featuring a modern UI with shadcn/ui components and real-time server monitoring capabilities.

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
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for request/response validation
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **Development**: Hot module replacement with Vite integration

## Key Components

### Database Schema
- **Users Table**: Basic user authentication (id, username, password)
- **Servers Table**: Server management with fields for hostname, IP address, location, description, status, uptime, response time, and last check timestamp

### API Endpoints
- `GET /api/servers` - Retrieve all servers
- `GET /api/servers/:id` - Retrieve specific server
- `POST /api/servers` - Create new server
- `PUT /api/servers/:id` - Update existing server
- `DELETE /api/servers/:id` - Delete server
- Server status monitoring endpoints (implied by schema)

### Frontend Features
- Dashboard with server overview and statistics
- Server cards with status indicators (online/offline/warning)
- Modal forms for creating and editing servers
- Search and filtering capabilities
- Real-time status updates
- Responsive design with mobile support

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Layer**: Express routes handle CRUD operations with Zod validation
3. **Database Layer**: Drizzle ORM manages PostgreSQL interactions
4. **Response**: JSON responses sent back to client
5. **UI Updates**: TanStack Query handles caching and re-rendering

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
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
- **Backend**: tsx for TypeScript execution with nodemon-like behavior
- **Database**: Connection to Neon Database via DATABASE_URL environment variable

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script
- **Deployment**: Single Node.js process serving both API and static files

### Environment Configuration
- Uses environment variables for database connection
- Supports both development and production environments
- Replit-specific configurations for development banner and cartographer

### Session Management
- PostgreSQL-based session storage
- Session configuration handled by connect-pg-simple
- Secure session handling for user authentication

The application follows a modern full-stack architecture with TypeScript throughout, ensuring type safety from database to UI. The use of Drizzle ORM provides excellent developer experience with type-safe database operations, while TanStack Query manages client-side caching and synchronization effectively.