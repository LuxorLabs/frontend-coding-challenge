# Luxor Bidding System

A full-stack bidding system built with NestJS backend and Next.js frontend, allowing users to create collections, place bids, and manage auctions.

## Current Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- User profile management
- Protected routes and API endpoints

### 📦 Collection Management
- Create, read, update, and delete collections
- Collection ownership validation
- Detailed collection information with bids
- Collection listing with bid counts

### 💰 Bid System
- Place bids on collections
- Bid status tracking (PENDING, ACCEPTED, REJECTED)
- Accept/Reject bid functionality
- Automatic rejection of other pending bids when one is accepted
- Bid ownership validation

### 👥 User Management
- User CRUD operations
- User profile retrieval
- User authentication state management

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt for password hashing

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT token management
- **UI Components**: Custom component library

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user by ID
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Collections
- `GET /collections` - Get all collections with bids
- `POST /collections` - Create new collection
- `GET /collections/{id}` - Get collection by ID with bids
- `PATCH /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection

### Bids
- `GET /bids` - Get bids by collection ID (query param)
- `POST /bids` - Create new bid
- `GET /bids/{id}` - Get bid by ID
- `PATCH /bids/{id}` - Update existing bid
- `DELETE /bids/{id}` - Delete bid
- `POST /bids/accept/{collectionId}/{bidId}` - Accept bid (rejects other pending bids)
- `POST /bids/reject/{collectionId}/{bidId}` - Reject specific bid

## Database Schema

### Users
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- role: String (default: 'USER')
- createdAt: DateTime
- updatedAt: DateTime
```

### Collections
```sql
- id: UUID (Primary Key)
- name: String
- description: String
- stocks: Integer
- price: Decimal
- userId: UUID (Foreign Key to Users)
- createdAt: DateTime
- updatedAt: DateTime
```

### Bids
```sql
- id: UUID (Primary Key)
- collectionId: UUID (Foreign Key to Collections)
- price: Decimal
- userId: UUID (Foreign Key to Users)
- status: Enum (PENDING, ACCEPTED, REJECTED)
- createdAt: DateTime
- updatedAt: DateTime
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd luxor-bidding-system/backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env`:
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

4. **Start backend server**
```bash
npm run start:dev
```

Backend will be available at `http://localhost:3000`
API Documentation at `http://localhost:3000/api/swagger`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Start frontend development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3001`

## Sample Data

The seed script creates:
- **10 users** with email pattern `user1@example.com` to `user10@example.com`
- **Default password** for all users: `password123`
- **100+ collections** with various categories and pricing
- **1000+ bids** distributed across collections with different statuses

## Business Rules

### Authentication
- All API endpoints except auth routes require valid JWT token
- JWT tokens are included in Authorization header as `Bearer <token>`

### Collection Management
- Users can only update/delete their own collections
- Collections include stock quantity and base price
- Each collection can have multiple bids from different users

### Bid Management
- Users cannot bid on their own collections
- Users can have only one pending bid per collection
- When a bid is accepted:
   - All other pending bids for that collection are automatically rejected
   - Only the collection owner can accept bids
- Only pending bids can be updated or deleted
- Bid prices must be positive numbers

### Authorization
- Collection owners can accept/reject bids on their collections
- Bid creators can update/delete their own pending bids
- Users can only access and modify their own resources

## Current Frontend Features

### User Interface
- **Authentication Pages**: Login and registration forms
- **Collections Marketplace**: Grid view of all collections with bid counts
- **Collection Details**: Individual collection pages with bid history
- **Bid Management**: Place, edit, and cancel bids
- **User Dashboard**: Personal collections and bid history
- **Frontend Pagination**: Client-side pagination (10 items per page)

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Real-time UI Updates**: Optimistic updates for better UX
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Loading indicators for async operations

## Scripts

### Backend
```bash
npm run start:dev          # Development server with hot reload
npm run start:debug        # Development server with debugging
npm run build             # Build for production
npm run start:prod        # Start production server
npm run db:generate       # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with sample data
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
```

### Frontend
```bash
npm run dev              # Development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## Current Limitations

### Backend
- **Simple JWT**: No refresh token mechanism
- **No Pagination**: API returns all records at once
- **Basic Search**: No search or filtering capabilities
- **Single Role**: Only basic user role implemented
- **No File Upload**: Collections don't support images
- **Limited Validation**: Basic input validation only

### Frontend
- **No Search**: No search or filter functionality
- **Basic UI**: Simple styling without design system
- **Client Pagination**: Pagination only on frontend
- **No Real-time**: No live updates for bid changes
- **Limited Error Handling**: Basic error messages

## 🗺️ Roadmap & Planned Improvements

### Phase 1: Backend Core Enhancements (High Priority)

#### 🔐 Advanced Authentication
- **Refresh Token System**
   - Implement dual token architecture (access + refresh)
   - Access tokens: 15-30 minutes expiration
   - Refresh tokens: 7-30 days expiration
   - Automatic token rotation on refresh
   - Secure refresh token storage

- **Role-Based Access Control (RBAC)**
  ```typescript
  enum UserRole {
    USER = 'USER',           // Basic collection and bid management
    MODERATOR = 'MODERATOR', // Content moderation capabilities
    ADMIN = 'ADMIN'          // Full system access
  }
  ```
   - Permission-based middleware
   - Role hierarchy and inheritance
   - Admin panel access controls

#### 📊 Pagination & Search System
- **Backend Pagination**
  ```typescript
  GET /collections?page=1&limit=10&search=art&category=digital&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc
  ```
   - Database-level pagination for performance
   - Search across collection names and descriptions
   - Filter by category, price range, owner
   - Multiple sorting options
   - Metadata response with pagination info

- **Advanced Filtering**
   - Category-based filtering
   - Price range filters
   - Date range filters
   - Featured collections
   - User-specific collections

#### 💰 Enhanced Bid Management
- **Collection-Specific Bid Endpoints**
  ```typescript
  POST /collections/{collectionId}/bids  // Create bid for specific collection
  GET /collections/{collectionId}/bids   // Get all bids for collection
  POST /bids/{bidId}/withdraw           // Withdraw pending bid
  POST /bids/{bidId}/counter            // Counter-offer functionality
  ```

- **Bid Analytics**
   - Bid history tracking
   - Average bid calculations
   - Bid conversion rates
   - Popular collections metrics

### Phase 2: Frontend Enhancement (Medium Priority)

#### 🎨 Design System & UI/UX
- **Component Library**
   - Standardized design tokens
   - Reusable UI components
   - Consistent color palette and typography
   - Responsive design patterns
   - Accessibility compliance (WCAG 2.1)

- **Advanced Search Interface**
   - Real-time search suggestions
   - Advanced filter sidebar
   - Sort and filter combinations
   - Search result highlighting
   - Saved search functionality

- **Admin Dashboard**
   - User management interface
   - Collection moderation tools
   - System analytics and reports
   - Role and permission management
   - Audit log viewer

#### 📱 User Experience Improvements
- **Real-time Updates**
   - WebSocket integration for live bid updates
   - Real-time notifications
   - Live auction functionality
   - Active user indicators

- **Enhanced Forms**
   - Multi-step collection creation
   - Image upload for collections
   - Rich text description editor
   - Form auto-save functionality
   - Advanced validation feedback

### Phase 3: System Optimization (Medium Priority)

#### ⚡ Performance & Scalability
- **Caching Strategy**
  ```typescript
  // Redis caching implementation
  - Featured collections: 5 minutes
  - Collection details: 15 minutes
  - Search results: 2 minutes
  - User sessions: 1 hour
  ```

- **Database Optimization**
  ```sql
  -- Performance indexes
  CREATE INDEX idx_collections_search ON collections USING gin(to_tsvector('english', name || ' ' || description));
  CREATE INDEX idx_collections_price ON collections(price);
  CREATE INDEX idx_bids_collection_status ON bids(collection_id, status);
  ```

- **API Optimization**
   - Response compression
   - Request/response caching
   - Database query optimization
   - Lazy loading strategies

#### 🛡️ Security Enhancements
- **Advanced Security**
   - Rate limiting per endpoint
   - Request sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection

- **Audit System**
  ```typescript
  interface AuditLog {
    userId: string;
    action: string;
    resource: string;
    oldValues?: object;
    newValues?: object;
    ipAddress: string;
    timestamp: Date;
  }
  ```

### Phase 4: Advanced Features (Low Priority)

#### 🔔 Notification System
- **Email Notifications**
   - Bid acceptance/rejection alerts
   - New bid notifications for collection owners
   - Weekly digest of activities
   - Account security notifications

- **In-App Notifications**
   - Real-time notification center
   - Push notification support
   - Notification preferences
   - Activity feed

#### 📈 Analytics & Reporting
- **Business Intelligence**
   - User engagement metrics
   - Collection performance analytics
   - Bid conversion tracking
   - Revenue analytics
   - Popular category insights

- **User Analytics**
   - Personal dashboard with statistics
   - Bid success rates
   - Collection performance metrics
   - Earning/spending summaries

#### 🔧 Advanced System Features
- **File Management**
   - S3/CloudFront integration
   - Image upload and processing
   - Multiple image support per collection
   - Image optimization and CDN

- **Advanced Auction Features**
   - Timed auctions
   - Reserve prices
   - Automatic bid increments
   - Auction countdown timers
   - Buy-now options

## Implementation Timeline

### Phase 1 (4-6 weeks)
- ✅ Refresh token authentication
- ✅ RBAC implementation
- ✅ Backend pagination and search
- ✅ Enhanced bid management

### Phase 2 (6-8 weeks)
- 🔲 Design system and component library
- 🔲 Advanced search interface
- 🔲 Admin dashboard
- 🔲 Real-time updates

### Phase 3 (4-6 weeks)
- 🔲 Caching implementation
- 🔲 Database optimization
- 🔲 Security enhancements
- 🔲 Performance monitoring

### Phase 4 (8-10 weeks)
- 🔲 Notification system
- 🔲 Analytics dashboard
- 🔲 File upload system
- 🔲 Advanced auction features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is for educational/challenge purposes.

---

**Current Status**: ✅ MVP Complete - Core bidding functionality implemented
**Next Priority**: 🔄 Phase 1 Backend Enhancements
