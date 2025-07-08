# API Services Documentation

This directory contains all API services organized in a clean, modular structure.

## 📁 File Structure

```
src/api/
├── index.ts              # Main API exports
├── config.ts             # API configuration
├── error.ts              # Custom error handling
├── auth.ts               # Authentication API
├── events.ts             # Events API
├── organizers.ts         # Event organizers API
└── README.md             # This documentation
```

## 🔧 Core Services

### `api/config.ts`
Centralized API configuration including base URLs, headers, and request options.

```typescript
import { API_BASE_URL, DEFAULT_HEADERS, API_OPTIONS } from '@/api/config';
```

### `api/error.ts`
Custom error class for API error handling with additional properties.

```typescript
import { ApiError } from '@/api/error';
```

## 🔐 Authentication API

### `api/auth.ts`
Handles login and logout operations with role validation.

```typescript
import { authApi } from '@/api/auth';

// Login (only admins can access)
const result = await authApi.login({
  email: 'admin@example.com',
  password: 'password123'
});

// Logout
await authApi.logout(userId);
```

**Role Validation:**
- Only users with `roleId: '1'` (admin) can successfully log in
- Non-admin users will receive a 403 error with message "Access denied. Only administrators can access this system."
- The system automatically validates roles during login

## 📊 Data APIs

### `api/events.ts`
Handles event-related operations.

```typescript
import { eventsApi } from '@/api/events';

// Get all events
const events = await eventsApi.getEvents();
```

### `api/organizers.ts`
Handles event organizer operations.

```typescript
import { organizersApi } from '@/api/organizers';

// Get all event organizers
const organizers = await organizersApi.getEventOrganizers();
```

## 🎣 React Hooks

### `useAuth.ts`
Authentication and user management hook with React integration.

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, isLoggedIn, isLoading, login, logout } = useAuth();

// Login
const error = await login({ email: 'admin@example.com', password: 'password' });

// Check authentication status
if (isLoggedIn) {
  // User is authenticated
}

// Logout
logout();
```

### `useToken.ts`
Token management hook for localStorage operations.

```typescript
import { useToken } from '@/hooks/useToken';

const token = useToken();

// Check if user is authenticated
if (token.isAuthenticated()) {
  // User is logged in
}

// Get access token
const accessToken = token.getAccessToken();

// Clear all tokens
token.clearTokens();
```

### `useEvents.ts`
React hook for managing events data.

```typescript
import { useEvents } from '@/hooks/useEvents';

const { events, loading, error, refresh } = useEvents();
```

### `useEventOrganizers.ts`
React hook for managing event organizers data.

```typescript
import { useEventOrganizers } from '@/hooks/useEventOrganizers';

const { eventOrganizers, loading, error, refresh } = useEventOrganizers();
```

## 🔐 Role-Based Access Control

### Role Mapping
The system uses the following role mapping:

| Role ID | Role Name | Access Level |
|---------|-----------|--------------|
| `'1'`   | `admin`   | Full access   |
| `'2'`   | `partner` | No access     |
| `'3'`   | `buyer`   | No access     |

### Role Validation Functions

```typescript
import { 
  canAccessAdmin, 
  getRoleName, 
  getRole, 
  hasRole, 
  isAdminRole 
} from '@/models/roles';

// Check admin access
const isAdmin = canAccessAdmin('1'); // true
const isAdmin2 = canAccessAdmin('2'); // false

// Get role information
const roleName = getRoleName('1'); // 'admin'
const role = getRole('1'); // { id: '1', name: 'admin' }

// Check specific roles
const hasAdminRole = hasRole('1', 'admin'); // true
const hasPartnerRole = hasRole('2', 'partner'); // true
```

## 🔄 Import Options

### Option 1: Direct imports (recommended)
```typescript
import { authApi } from '@/api/auth';
import { eventsApi } from '@/api/events';
import { organizersApi } from '@/api/organizers';
import { useAuth } from '@/hooks/useAuth';
import { useToken } from '@/hooks/useToken';
import { canAccessAdmin } from '@/models/roles';
```

### Option 2: Main index imports
```typescript
import { 
  authApi, 
  eventsApi, 
  organizersApi 
} from '@/api';
```

## 🚀 Usage Examples

### Authentication Flow
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (credentials) => {
    const error = await login(credentials);
    if (error) {
      // Handle error
    } else {
      // Redirect to dashboard
    }
  };
}
```

### Protected Routes
```typescript
import { AuthGate } from '@/components/AuthGate';

function ProtectedPage() {
  return (
    <AuthGate>
      <div>Protected content</div>
    </AuthGate>
  );
}
```

### Role-Based Access
```typescript
import { useAuth } from '@/hooks/useAuth';

function AdminPanel() {
  const { isAdmin, hasRole } = useAuth();
  
  if (!isAdmin()) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin panel content</div>;
}
```

## 🔧 Error Handling

All API calls use the custom `ApiError` class for consistent error handling:

```typescript
import { ApiError } from '@/api/error';

try {
  const result = await authApi.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

## 📝 Notes

- All API services are located in the `src/api/` directory
- React hooks are in `src/hooks/` directory
- Role validation utilities are in `src/models/roles.ts`
- Authentication context is in `src/contexts/AuthContext.tsx`
- Protected routes use `src/components/AuthGate.tsx`
- The system only allows admin users (roleId: '1') to access the application