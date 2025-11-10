# CSV Data Processor

## Overview

A web application for processing CSV files containing location and business search queries. Users upload CSV files with keywords, brands, and branch information, which are then used to search Google Places API. The system performs brand matching on results and provides comprehensive downloadable reports in multiple formats (CSV, JSON, Excel).

The application is designed with a clean, productivity-focused interface inspired by modern tools like Linear and Dropbox, emphasizing clarity and efficiency in data processing workflows.

## Recent Changes

**November 10, 2025 - Replit Environment Setup:**
- Imported GitHub project and configured for Replit environment
- Installed all dependencies including nanoid package
- Configured workflow for development server on port 5000
- Set up SERPER_API_KEY environment secret for Google Places API integration
- Configured deployment settings for autoscale (production-ready)
- Server running on 0.0.0.0:5000 with Vite middleware integration
- Removed JSON and Excel export buttons (only CSV and Matches Only remain)
- All features tested and working: CSV upload, processing, and export functionality

**January 6, 2025 - Backend Integration & Migration:**
- Migrated from Replit Agent to Replit environment
- Implemented backend CSV processing with real-time Serper API integration
- Added secure API key management via SERPER_API_KEY environment variable
- Installed multer (with @types/multer) for file upload handling with 10MB size limit
- Installed Papaparse (with @types/papaparse) for robust CSV parsing supporting quoted fields
- Created POST /api/process-csv endpoint for file processing
- Connected frontend to backend with real API calls, removing all mock data
- Implemented full data export functionality (CSV, JSON, brand matches)
- Added proper error handling for API failures and validation errors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript using Vite as the build tool
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for data fetching and state management
- Shadcn/UI component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Custom theme with light/dark mode support
- Typography based on Inter font from Google Fonts
- Spacing primitives using Tailwind units (4, 6, 8, 12)
- Component-based design with consistent elevation patterns
- Color system using CSS variables for theme customization
- Max container width: 4xl (centered layout)

**State Management:**
- Local component state for UI interactions
- Processing states tracked through enum: 'idle', 'previewing', 'processing', 'complete', 'error'
- File processing history maintained in component state
- Real-time processing statistics (queries per second, estimated time remaining, current progress)

**Key Features:**
- Drag-and-drop CSV file upload
- File preview with data validation
- Real-time processing status with detailed statistics
- Results preview with expandable data table
- Export options: CSV (full results) and Matches Only (brand matches)
- Processing history with download capabilities
- Theme toggle (light/dark mode)
- Responsive design for mobile and desktop

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- ESM (ES Modules) throughout the codebase
- Development: tsx for TypeScript execution
- Production: esbuild for bundling
- Multer for file upload handling (10MB limit)
- Papaparse for CSV parsing with quoted field support
- Serper API for Google Places searches

**Server Structure:**
- POST /api/process-csv endpoint for CSV file processing
- Serper API integration with pagination support
- Brand matching algorithm (normalizes and checks brand+branch in titles)
- In-memory storage implementation (MemStorage class)
- Vite middleware integration for development mode
- Custom logging middleware for API request tracking
- Raw body capture for request verification

**CSV Processing:**
- Accepts CSV files with Keywords, Brand, and Branch columns (case-insensitive)
- Searches Google Places API via Serper for each query
- Fetches all available pages of results (1 second delay between requests)
- Performs brand matching by normalizing titles and checking for brand+branch presence
- Returns full results with brand_match boolean flags
- Supports downloading results as CSV, JSON, or brand-matches-only CSV

**Storage Interface:**
- IStorage interface defining CRUD operations
- Currently implements user management (getUser, getUserByUsername, createUser)
- Uses Map-based in-memory storage with UUID generation
- Designed to be replaced with database implementation

### Data Storage Solutions

**Current Implementation:**
- In-memory storage using JavaScript Map
- No persistent database currently configured

**Database Configuration (Prepared but not active):**
- Drizzle ORM configured for PostgreSQL
- Schema defined in shared/schema.ts with users table
- Connection configured through DATABASE_URL environment variable
- Neon serverless PostgreSQL adapter included in dependencies
- Migration setup using drizzle-kit

**Schema Structure:**
- Users table: id (UUID), username (unique), password
- Zod validation schemas for type safety

### External Dependencies

**UI Component Library:**
- Radix UI primitives for accessible components (accordion, dialog, dropdown-menu, popover, select, tabs, toast, tooltip, etc.)
- Shadcn/UI configuration for component customization
- Class Variance Authority (CVA) for component variants
- Lucide React for icons

**Form Handling:**
- React Hook Form for form management
- Hookform/resolvers for validation integration
- Zod for schema validation (via drizzle-zod)

**Styling:**
- Tailwind CSS with PostCSS
- Custom theme configuration with CSS variables
- Support for dark mode via class strategy

**Date Handling:**
- date-fns for date formatting and manipulation

**Development Tools:**
- Replit-specific plugins for development (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)
- TypeScript for type safety across frontend and backend
- Path aliases configured for cleaner imports (@/, @shared/, @assets/)

**API Integration:**
- Serper API for Google Places searches (production implementation)
- Papaparse for robust CSV parsing with quoted field support
- Multi-page result fetching with 1-second rate limiting between requests
- Secure API key management via environment variables

**Session Management:**
- connect-pg-simple package included for PostgreSQL session storage (not currently implemented)

**Build & Deployment:**
- Vite for frontend bundling
- esbuild for server-side bundling
- Separate build outputs: dist/public (frontend), dist (backend)
- Node.js runtime in production mode