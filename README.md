# Luxor Bidding System - Backend API

A NestJS-based bidding system API that allows users to create collections, place bids, and manage auctions.

> **Frontend Documentation**: See the frontend README in the `bidding-system` folder for client application setup and features.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation & Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/luxor_bidding?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3000
ENABLE_SWAGGER=true
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run start:dev
```

- **API**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api/swagger`

## API Overview

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Collections
- `GET /collections` - Get all collections with bids
- `POST /collections` - Create new collection
- `GET /collections/{id}` - Get collection by ID with bids
- `PATCH /collections/{id}` - Update collection (owner only)
- `DELETE /collections/{id}` - Delete collection (owner only)

### Bids
- `GET /bids?collectionId={id}` - Get bids by collection ID
- `POST /bids` - Create new bid
- `GET /bids/{id}` - Get bid by ID
- `PATCH /bids/{id}` - Update existing bid (owner only, pending only)
- `DELETE /bids/{id}` - Delete bid (owner only, pending only)
- `POST /bids/accept/{collectionId}/{bidId}` - Accept bid (auto-rejects other pending bids)
- `POST /bids/reject/{collectionId}/{bidId}` - Reject specific bid

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user by ID
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt for password hashing

## Database Schema

```sql
-- Users
id: UUID, email: String (unique), password: String (hashed), name: String, role: String

-- Collections  
id: UUID, name: String, description: String, stocks: Integer, price: Decimal, userId: UUID

-- Bids
id: UUID, collectionId: UUID, price: Decimal, userId: UUID, status: Enum (PENDING, ACCEPTED, REJECTED)
```

## Business Rules

- Users cannot bid on their own collections
- Users can only have one pending bid per collection
- Only collection owners can accept/reject bids
- Accepting a bid automatically rejects all other pending bids for that collection
- Only pending bids can be updated or deleted
- Users can only modify their own resources (collections, bids)

## Sample Data

The seed script creates:
- **10 users**: `user1@example.com` to `user10@example.com` (password: `password123`)
- **100+ collections** with various categories and pricing
- **1000+ bids** distributed across collections

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:seed           # Seed with sample data
npm run db:reset          # Reset and reseed database

# Production
npm run build             # Build for production
npm run start:prod        # Start production server

# Testing
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage
```

## System Architecture

**📊 [View Interactive Workflow Diagram](https://www.mermaidchart.com/app/projects/3284de2d-a15f-4a31-b75b-ce6bb1435a1a/diagrams/8b3fd094-cd47-4f58-818b-751ed74382fe/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiOGIzZmQwOTQtY2Q0Ny00ZjU4LTgxOGItNzUxZWQ3NDM4MmZlIiwiYWNjZXNzIjoiRWRpdCIsImlhdCI6MTc1MTYzMDkxNH0.oUt91D41aIiSTSffw9SFUARVE909Q0lWH10Q6cN86Hs)**

The system follows a layered architecture with clear separation of concerns:

```mermaid
graph TD
    Client[Client] --> Router[NestJS Router]
    Router --> Auth[JWT Guard]
    Auth --> Controller[Controller]
    Controller --> Service[Service]
    Service --> DB[(PostgreSQL)]
    DB --> Service
    Service --> Controller
    Controller --> Client
```

### Request Flow
1. **Client Request** → NestJS Router
2. **Authentication** → JWT Guard validates token
3. **Validation** → DTO validation and business rules
4. **Business Logic** → Service layer processes request
5. **Database** → Prisma ORM handles data operations
6. **Response** → Formatted JSON response to client

## Current Limitations & Future Improvements

### Current State
- ✅ JWT authentication (single token)
- ✅ Full CRUD for collections and bids
- ✅ Business rule enforcement
- ✅ Swagger documentation
- ✅ Database seeding

### Planned Enhancements
- 🔄 **Phase 1**: Refresh token system, RBAC, backend pagination, advanced search
- 🔄 **Phase 2**: Caching (Redis), database optimization, rate limiting
- 🔄 **Phase 3**: Real-time updates (WebSocket), file upload, advanced analytics

## Development Notes

- All endpoints except `/auth/login` and `/auth/register` require JWT authentication
- API returns JSON responses with appropriate HTTP status codes
- Input validation is handled by DTOs with class-validator
- Database relations are managed through Prisma ORM
- Comprehensive error handling with formatted responses

## License

This project is for educational/challenge purposes.