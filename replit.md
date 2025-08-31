# Komiku API - Manga Scraper Web Application

## Overview

This is a full-stack web application that provides a REST API for scraping manga content from Komiku.org. The application features a React-based frontend built with Vite and a Node.js/Express backend with web scraping capabilities. It includes comprehensive rate limiting, caching mechanisms, and a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**: React 18 with Vite for fast development and optimized builds
- TypeScript for type safety and better developer experience
- Wouter for lightweight client-side routing (alternative to React Router)
- React Query (@tanstack/react-query) for server state management and caching

**UI & Styling**:
- Tailwind CSS for utility-first styling with CSS variables for theming
- shadcn/ui component library with Radix UI primitives for accessible components
- Custom design system with neutral color scheme and extensive component collection
- Responsive design with mobile-first approach

**State Management**:
- React Query handles all server state with automatic caching and background updates
- Local component state with React hooks for UI interactions
- Toast notifications system for user feedback

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API design with structured error handling
- Rate limiting middleware with different limits per endpoint type
- CORS enabled for cross-origin requests
- Request/response logging with performance metrics

**Web Scraping Service**:
- Custom Komiku scraper class using Axios and Cheerio
- Structured data extraction for manga search, details, and chapter content
- Error handling and timeout protection for external requests

**API Endpoints**:
- `/api/search` - Search manga with query parameters
- `/api/detail` - Get detailed manga information
- `/api/chapter` - Fetch chapter content and images
- `/api/popular` - Get popular manga with pagination
- `/api/genre` - Browse manga by genre

**Rate Limiting Strategy**:
- General endpoints: 60 requests per minute
- Search endpoints: 30 requests per minute  
- Chapter endpoints: 20 requests per minute
- Standardized error responses with detailed messaging

### Data Storage Solutions

**Database**: PostgreSQL with Drizzle ORM
- Schema-first approach with TypeScript integration
- User management with unique usernames and hashed passwords
- Manga content caching with expiration timestamps
- Migration support for database version control

**Caching Layer**:
- In-memory cache with automatic expiration cleanup
- Database-backed cache for persistent storage across restarts
- Cache keys based on request parameters for efficient retrieval
- Configurable TTL for different content types

**Storage Interface**:
- Abstract storage interface allowing multiple implementations
- Memory-based storage for development and testing
- Database storage for production environments
- Automatic cache cleanup and maintenance

### External Dependencies

**Database & ORM**:
- PostgreSQL via Neon Database serverless platform
- Drizzle ORM for type-safe database operations
- connect-pg-simple for PostgreSQL session storage

**Web Scraping**:
- Axios for HTTP requests with timeout and error handling
- Cheerio for server-side HTML parsing and DOM manipulation

**Frontend Libraries**:
- Radix UI primitives for accessible component foundations
- Lucide React for consistent icon library
- date-fns for date manipulation utilities
- clsx and tailwind-merge for conditional styling

**Development Tools**:
- ESBuild for server-side bundling and optimization
- TSX for TypeScript execution in development
- PostCSS with Autoprefixer for CSS processing
- Replit-specific plugins for development environment integration

**Validation & Security**:
- Zod for runtime type validation and schema parsing
- express-rate-limit for API protection
- Input sanitization and URL validation for scraping endpoints