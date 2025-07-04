# Luxor Bidding System - Frontend

<img width="1501" alt="image" src="https://github.com/user-attachments/assets/8cb179ce-2461-4769-9c7a-8265a2cb88c6" />

A Next.js frontend application for the Luxor bidding system, providing a user-friendly interface for managing collections and bids.

> **Backend Documentation**: See the backend README in the `frontend-coding-challenge` folder for API setup and documentation.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Backend API running on `http://localhost:3000`

### Installation & Setup

1. **Install dependencies**
```bash
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

3. **Start Development Server**
```bash
npm run dev
```

Application will be available at `http://localhost:3001`

## Features

### 🔐 Authentication
- User login and registration
- JWT token management
- Protected routes
- Automatic logout on token expiration

### 📦 Collections Marketplace
- Browse all collections with pagination (10 per page)
- View collection details with bid history
- Create new collections
- Edit/delete own collections
- Real-time bid counts

### 💰 Bidding System
- Place bids on collections
- Edit pending bids
- Cancel own bids
- Accept/reject bids on own collections
- Automatic UI updates (optimistic updates)

### 🎨 User Interface
- Responsive design (mobile-friendly)
- Clean, modern interface
- Loading states and error handling
- Form validation
- Pagination controls

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT token management
- **HTTP Client**: Fetch API
- **Form Handling**: React hooks
- **UI Components**: Custom component library

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── common/
│   ├── context/           # React contexts (auth, user)
│   ├── hooks/             # Custom hooks
│   └── models/            # TypeScript interfaces
├── components/            # Reusable UI components
│   ├── collectionSection.tsx
│   ├── bidModal.tsx
│   ├── pagination.tsx
│   └── ...
└── styles/               # Global styles
```

## Key Components

### Authentication Flow
- **AuthContext**: Manages authentication state and JWT tokens
- **UserContext**: Handles user profile data
- **AuthWrapper**: Redirects unauthenticated users

### Collection Management
- **CollectionSection**: Displays collection with bids
- **CollectionModal**: Create/edit collection form
- **Pagination**: Frontend pagination (10 items per page)

### Bid Management
- **BidModal**: Create/edit bid form
- **BidItem**: Individual bid display
- Optimistic updates for better UX

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## User Experience Features

### Optimistic Updates
- Instant UI feedback when creating/updating bids
- Automatic rollback on API errors
- No page refreshes required

### Frontend Pagination
- Client-side pagination for fast navigation
- Shows 10 collections per page
- Maintains state across page changes

### Error Handling
- User-friendly error messages
- Network error handling
- Form validation feedback

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces

## Authentication Flow

1. User logs in → JWT token stored in localStorage
2. Token included in all API requests via Authorization header
3. Protected routes check authentication status
4. Automatic redirect to login on token expiration

## Current Limitations & Future Improvements

### Current State
- ✅ Complete authentication flow
- ✅ Full collection and bid management
- ✅ Responsive design
- ✅ Client-side pagination
- ✅ Optimistic updates

### Planned Enhancements
- 🔄 **Phase 1**: Advanced search and filtering, design system, admin dashboard
- 🔄 **Phase 2**: Real-time updates (WebSocket), push notifications, image upload
- 🔄 **Phase 3**: Advanced analytics, user preferences, dark mode

## API Integration

The frontend communicates with the backend API using:
- **Base URL**: `http://localhost:3000` (configurable via env)
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Comprehensive error response handling
- **Request Logging**: Console logging for development

## Development Notes

- Uses TypeScript for type safety
- Implements React best practices (hooks, context)
- Tailwind CSS for consistent styling
- Custom hooks for API calls and state management
- Optimistic updates for better user experience

## Testing Credentials

Use these credentials to test the application:
- **Email**: `user1@example.com` (or user2, user3, etc.)
- **Password**: `password123`

## License

This project is for educational/challenge purposes.
