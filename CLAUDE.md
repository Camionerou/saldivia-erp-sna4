# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Saldivia ERP - Modern business management system for Saldivia bus body manufacturing company in Alvear, Santa Fe, Argentina. This full-stack application replaces a legacy system and provides comprehensive ERP functionality including accounting, banking, purchases, sales, and tax management.

**Current Version: 1.0.2-dev**
- v1.0.1: ✅ Complete user management module with advanced features
- v1.0.2: 🚧 In development - Next module to be determined

## Architecture
- **Frontend**: Next.js 14 with TypeScript, Material-UI v5, React Query for state management
- **Backend**: Node.js/Express with TypeScript, Prisma ORM, MySQL database
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: Socket.io for live notifications and updates
- **Database**: Modern MySQL schema + legacy database integration

## Development Commands

### Setup
```bash
npm run install:all          # Install all dependencies (root, client, server)
```

### Development
```bash
npm run dev                  # Start both frontend (3000) and backend (3001)
npm run server:dev           # Backend only
npm run client:dev           # Frontend only
```

### Database
```bash
cd server
npx prisma migrate dev       # Run migrations
npx prisma generate          # Generate Prisma client
npm run seed                 # Seed initial data
```

### Building/Production
```bash
npm run build               # Build both client and server
npm start                   # Start production server
```

### Testing & Quality
```bash
cd client && npm run lint           # Frontend linting
cd client && npm run type-check     # TypeScript checking
cd server && npm test               # Backend tests
```

## Key Directory Structure
```
/client/src/
  /app/                     # Next.js 14 app router pages
  /components/              # Reusable React components
    /auth/                  # Authentication components
    /common/                # Shared UI components
    /users/                 # User management components
  /contexts/                # React contexts (Auth, Notifications)
  /services/                # API service functions
  /types/                   # TypeScript type definitions

/server/src/
  /routes/                  # Express route handlers
  /middleware/              # Auth, error handling, etc.
  /services/                # Business logic and integrations
  /types/                   # TypeScript types
  /prisma/                  # Database schema and migrations
```

## Database Schema
- **Users & Auth**: User accounts, profiles, sessions with JWT
- **Accounting**: Hierarchical chart of accounts, journal entries, fiscal years, cost centers
- **Banking**: Bank accounts, movements, checkbooks, checks
- **Commercial**: Suppliers, customers, purchases, sales
- **Tax**: Tax periods, IVA records, tax calculations
- **System**: Configuration, audit logs, notifications

## Authentication Flow
1. Login with username/password at `/api/auth/login`
2. JWT token + refresh token returned
3. Protected routes use `authMiddleware` 
4. Frontend AuthContext manages auth state
5. Automatic token refresh on expiration

## API Structure
- `/api/auth/*` - Public authentication endpoints
- `/api/users/*` - User management (protected)
- `/api/accounting/*` - Accounting module (protected)
- `/api/banking/*` - Banking operations (protected)
- `/api/purchases/*` - Purchase management (protected)
- `/api/sales/*` - Sales management (protected)
- `/api/tax/*` - Tax calculations (protected)
- `/api/system/*` - System configuration (protected)
- `/api/dashboard/*` - Dashboard data (protected)
- `/api/legacy/*` - Legacy system integration (protected)

## Environment Configuration
**Server (.env)**:
```
DATABASE_URL=mysql://user:pass@localhost:3306/saldivia_erp
LEGACY_DATABASE_URL=mysql://user:pass@localhost:3306/saldivia_legacy
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
NODE_ENV=development
```

**Client (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Key Features
- Material-UI theming with Saldivia corporate colors
- Responsive design for desktop/tablet/mobile
- Real-time notifications via WebSocket
- Comprehensive audit logging
- Legacy database integration for data migration
- Multi-module permission system
- Export functionality (PDF, Excel)

## Development Notes
- Uses TypeScript throughout for type safety
- Prisma ORM handles database operations
- React Query manages server state caching
- Socket.io provides real-time updates
- Material-UI components follow design system
- All routes except auth require authentication
- Error handling with custom middleware
- Rate limiting in production environment

## Default Credentials
- Username: `adrian`
- Password: `jopo`

## Deployment
Application is designed for Railway deployment. The build process compiles TypeScript and serves static assets. Database migrations run automatically on deployment.