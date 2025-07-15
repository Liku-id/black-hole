# Wukong Backoffice - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Features](#features)
5. [API Integration](#api-integration)
6. [Global Utilities](#global-utilities)
7. [Event Organizers System](#event-organizers-system)
8. [Development Guide](#development-guide)
9. [Build & Deployment](#build--deployment)
10. [Performance Analysis](#performance-analysis)
11. [Troubleshooting](#troubleshooting)
12. [Upgrade Plan](#upgrade-plan)

---

## 🎯 Project Overview

**Wukong Backoffice** is a modern React-based admin dashboard built with Next.js 12, TypeScript, and Material-UI. It provides a comprehensive event management system with authentication, real-time data synchronization, and responsive design.

### 🛠️ Tech Stack

- **Framework**: Next.js 12.1.6
- **Language**: TypeScript 4.7.3
- **UI Library**: Material-UI 5.8.2
- **Styling**: Emotion 11.7.1
- **Data Fetching**: SWR 2.3.4
- **Authentication**: Custom JWT-based system
- **Date Handling**: date-fns 2.28.0

### 📁 Project Structure

```
├── pages/                    # Next.js pages (routing)
│   ├── api/                 # API routes
│   ├── organizers/          # Organizers management
│   ├── events/              # Events management
│   ├── dashboard/           # Dashboard views
│   └── login/               # Authentication
├── src/
│   ├── components/          # Reusable UI components
│   ├── layouts/             # Page layouts
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   └── theme/               # Material-UI theme
├── public/                  # Static assets
└── demo-reference/          # Demo components (excluded from build)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Backend API server running

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd black-hole
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your backend URL
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to `http://localhost:3000`

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

---

## 🏗️ Architecture

### Authentication System

- **JWT-based authentication** with secure token storage
- **Protected routes** using HOCs and middleware
- **Role-based access control** for different user types
- **Session management** with automatic token refresh

### Data Flow

```
Frontend → API Routes → Backend API → Database
    ↓
SWR Cache → React Components → UI Updates
```

### State Management

- **React Context** for global state (auth, theme, sidebar)
- **SWR** for server state management and caching
- **Local component state** for UI interactions

---

## ✨ Features

### Core Features

- 📊 **Dashboard**: Real-time analytics and metrics
- 👥 **User Management**: Authentication and user profiles
- 🎯 **Event Management**: Create, edit, and manage events
- 🏢 **Organizer Management**: Complete organizer lifecycle
- 📱 **Responsive Design**: Mobile-first approach
- 🌙 **Theme System**: Light/dark mode support

### Event Organizers System

- **Paginated Table**: Display organizers with pagination
- **Real-time Updates**: SWR-powered data synchronization
- **Advanced Filtering**: Search and filter capabilities
- **Bank Information**: Complete financial details
- **Document Management**: NIK, NPWP, and photo handling
- **Action Controls**: Edit, delete, and view operations

---

## 🔗 API Integration

### Base Configuration

```typescript
// src/services/organizersService.ts
class OrganizersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  async getEventOrganizers(): Promise<EventOrganizersResponse> {
    const response = await fetch(`${this.baseUrl}/api/event-organizers`);
    return this.handleResponse(response);
  }
}
```

### API Endpoints

#### Event Organizers

**GET** `/api/event-organizers`

**Response Format:**
```json
{
  "statusCode": 0,
  "message": "success",
  "body": {
    "eventOrganizers": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone_number": "string",
        "bank_information": {
          "bank": {
            "name": "string",
            "logo": "string"
          },
          "accountNumber": "string",
          "accountHolderName": "string"
        },
        "nik": "string",
        "npwp": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
}
```

#### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "string",
  "password": "string"
}
```

**POST** `/api/auth/logout`
```json
{
  "message": "Logged out successfully"
}
```

---

## 🛠️ Global Utilities

### Date Utilities (`src/utils/dateUtils.ts`)

```typescript
// Format date for display
const displayDate = formatDateTime(new Date());

// Available functions:
- formatDate()           // "15 Jul 2025"
- formatTime()           // "14:30"
- formatDateTime()       // "15 Jul 2025, 14:30"
- formatFullDateTime()   // "15 Jul 2025, 14:30:45"
- formatRelativeTime()   // "2 hours ago"
- formatForAPI()         // "2025-07-15T14:30:00Z"
```

### String Utilities (`src/utils/stringUtils.ts`)

```typescript
// Text manipulation
const shortText = truncate(longDescription, 50);
const title = toTitleCase("hello world"); // "Hello World"

// Available functions:
- truncate()            // Truncate with ellipsis
- capitalizeWords()     // Capitalize each word
- toTitleCase()         // Convert to title case
- camelToHuman()        // "firstName" → "First Name"
- getInitials()         // "John Doe" → "JD"
- formatPhoneNumber()   // Format Indonesian phones
- isEmpty()             // Check if string is empty
- toSlug()              // Convert to URL slug
```

### Validation Utilities (`src/utils/validationUtils.ts`)

```typescript
// Email validation
const isValid = isValidEmail("user@example.com");

// Form validation
const errors = validateLoginForm(email, password);
const hasErrors = !isValidForm(errors);

// Available validators:
- isValidEmail()        // Email format
- isValidPhoneNumber()  // Indonesian phone numbers
- isValidNIK()          // Indonesian NIK (16 digits)
- isValidNPWP()         // Indonesian NPWP (15 digits)
- isValidURL()          // URL format
- validatePassword()    // Password strength
- validateRequired()    // Required fields
- validateMinLength()   // Minimum length
- validateMaxLength()   // Maximum length
```

### Format Utilities (`src/utils/formatUtils.ts`)

```typescript
// Currency formatting
const price = formatCurrency(150000); // "Rp 150.000"

// Available formatters:
- formatCurrency()      // Indonesian Rupiah
- formatNumber()        // Number with separators
- formatPercentage()    // Percentage format
- formatFileSize()      // File size (KB, MB, GB)
- formatBankAccount()   // Bank account format
- formatIDNumber()      // ID with dashes
- formatStatus()        // Status with colors
```

### API Utilities (`src/utils/apiUtils.ts`)

```typescript
// HTTP requests
const data = await get('/api/organizers');
const result = await post('/api/organizers', newOrganizer);

// Available methods:
- get()                 // GET requests
- post()                // POST requests
- put()                 // PUT requests
- delete()              // DELETE requests
- uploadFile()          // File uploads
- downloadFile()        // File downloads
- retry()               // Retry with backoff
- buildQueryString()    // URL parameters
```

---

## 👥 Event Organizers System

### Overview

The Event Organizers system provides complete management of event organizers with real-time data synchronization and comprehensive UI components.

### Components Structure

```
src/components/OrganizersTable/
├── index.tsx           # Main table component
└── types.ts           # TypeScript definitions

pages/organizers/
└── index.tsx          # Organizers page

src/hooks/
└── useOrganizers.ts   # SWR data fetching hook

src/services/
└── organizersService.ts # API service layer
```

### Key Features

#### 1. Data Management
- **Real-time Updates**: SWR automatically revalidates data
- **Caching**: Intelligent caching with 30-second refresh
- **Error Handling**: Comprehensive error states and retries
- **Loading States**: Smooth loading indicators

#### 2. Table Features
- **Pagination**: Configurable page sizes (5, 10, 25, 50)
- **Selection**: Multi-select with checkboxes
- **Sorting**: Sortable columns
- **Actions**: Edit, delete, view operations
- **Responsive**: Mobile-friendly design

#### 3. Data Display
- **Organizer Details**: Name, title, description
- **Contact Information**: Email, formatted phone numbers
- **Banking Details**: Bank name, account info
- **Registration Info**: NIK, NPWP numbers
- **Timestamps**: Formatted creation dates

### Usage Example

```typescript
// Using the organizers hook
const { organizers, loading, error, mutate } = useOrganizers();

// Refresh data manually
const handleRefresh = () => {
  mutate();
};

// Display in component
<OrganizersTable 
  organizers={organizers} 
  loading={loading} 
  onRefresh={handleRefresh} 
/>
```

---

## 💻 Development Guide

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Conventional Commits**: Standardized commit messages

### Component Guidelines

1. **Use TypeScript interfaces** for all props and state
2. **Implement proper error boundaries** for error handling
3. **Use Material-UI components** for consistent design
4. **Follow React hooks rules** for state management
5. **Implement loading states** for better UX

### File Naming Conventions

- **Components**: PascalCase (`OrganizersTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`useOrganizers.ts`)
- **Services**: camelCase with suffix (`organizersService.ts`)
- **Types**: PascalCase interfaces (`EventOrganizer.ts`)
- **Utils**: camelCase (`dateUtils.ts`)

### Development Workflow

1. **Create feature branch** from main
2. **Implement components** with TypeScript
3. **Add comprehensive tests** for new features
4. **Update documentation** for API changes
5. **Submit pull request** with description

---

## 🚀 Build & Deployment

### Build Configuration

The project uses Next.js with custom webpack configuration:

```javascript
// next.config.js
const nextConfig = {
  // Exclude demo-reference from build
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/demo-reference/**']
    };
    return config;
  }
};
```

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm start

# Export static files
npm run export
```

### Build Analysis

After running `npm run build`, you'll see:

```
Page                     Size     First Load JS
┌ ○ /                    889 B    192 kB
├ ○ /dashboard           288 B    144 kB
├ ○ /events              839 B    192 kB
├ ○ /login               7.39 kB  192 kB
└ ○ /organizers          18.5 kB  226 kB
```

**Performance Indicators:**
- 🟢 **Green**: Excellent performance (< 150 kB)
- 🟡 **Yellow**: Good performance (150-200 kB)
- 🔴 **Red**: Attention needed (> 200 kB, but acceptable)

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] Database connections working
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled

---

## 📊 Performance Analysis

### Bundle Analysis

Your application achieves excellent performance:

- **Homepage**: 192 kB (Good)
- **Dashboard**: 144 kB (Excellent)
- **Events**: 192 kB (Good)
- **Login**: 192 kB (Good)
- **Organizers**: 226 kB (Attention, but acceptable)

### Performance Optimizations

1. **Code Splitting**: Each page loads only required code
2. **Static Generation**: Most pages pre-rendered at build time
3. **Image Optimization**: Next.js automatic image optimization
4. **Bundle Optimization**: Tree shaking and minification
5. **Caching Strategy**: SWR provides intelligent caching

### Monitoring

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Size**: Track bundle growth over time
- **API Performance**: Monitor response times
- **Error Tracking**: Implement error monitoring

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Errors

**Issue**: TypeScript compilation errors
```bash
error TS2307: Cannot find module '@/components/...'
```

**Solution**: Check tsconfig.json path mappings
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. API Connection Issues

**Issue**: Network errors when fetching data
```
Failed to fetch organizers from backend API
```

**Solution**: Verify environment variables
```bash
# Check .env.local
BACKEND_URL=http://localhost:8080
```

#### 3. Authentication Problems

**Issue**: Login redirects not working
```
Unauthorized access detected
```

**Solution**: Check token storage and validation
```typescript
// Clear tokens and try again
localStorage.removeItem('authToken');
```

### Debug Mode

Enable debug mode for detailed logging:
```javascript
// Add to .env.local
DEBUG=true
NODE_ENV=development
```

---

## 🔄 Upgrade Plan

### Current vs Target Versions

| Package | Current | Target | Status |
|---------|---------|--------|--------|
| Next.js | 12.1.6 | 15.3.5 | 🟡 Major upgrade needed |
| React | 17.0.2 | 18.3.1 | 🟡 Breaking changes |
| TypeScript | 4.7.3 | 5.6.3 | 🟢 Minor updates |
| Material-UI | 5.8.2 | 6.1.6 | 🟡 API changes |

### Migration Strategy

#### Phase 1: Dependencies Update (2-3 hours)
```bash
# Update package.json
npm install next@15.3.5 react@18.3.1 react-dom@18.3.1

# Fix immediate conflicts
npm audit fix
```

#### Phase 2: Next.js 15 Migration (3-4 hours)
- Update next.config.js for v15 compatibility
- Migrate to App Router (optional)
- Fix deprecated APIs
- Update TypeScript configuration

#### Phase 3: React 18 Migration (1-2 hours)
- Update React rendering (createRoot)
- Fix StrictMode issues
- Test concurrent features

#### Phase 4: Material-UI v6 (2-3 hours)
- Remove deprecated packages
- Update component imports
- Migrate theme configuration
- Fix API changes

#### Phase 5: Testing & Validation (2 hours)
- Comprehensive functionality testing
- Performance validation
- Cross-browser compatibility

### Breaking Changes to Address

1. **Next.js App Router**: Optional migration
2. **React 18 Concurrent Features**: May affect rendering
3. **Material-UI v6**: Component API changes
4. **TypeScript 5**: Stricter type checking

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [SWR Documentation](https://swr.vercel.app/)

### Development Tools

- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets
- **Browser DevTools**: React Developer Tools
- **Testing**: Jest, React Testing Library
- **Performance**: Lighthouse, Web Vitals

### Support

For issues and questions:
1. Check this documentation first
2. Search existing issues in the repository
3. Create a new issue with detailed description
4. Include error logs and reproduction steps

---

## 🎉 Conclusion

This documentation provides a comprehensive guide to the Wukong Backoffice system. The application is built with modern best practices, includes robust error handling, and provides excellent performance characteristics.

Key strengths:
- ✅ **Modern Architecture**: Next.js, TypeScript, Material-UI
- ✅ **Comprehensive Utilities**: Global utility system for consistency
- ✅ **Real-time Data**: SWR-powered data synchronization
- ✅ **Excellent Performance**: 144-226 kB bundle sizes
- ✅ **Developer Experience**: TypeScript, ESLint, hot reloading

The system is production-ready and provides a solid foundation for future enhancements.

---

*Last updated: July 15, 2025*
