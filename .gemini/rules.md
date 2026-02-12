# Black Hole — Creator Dashboard

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Application** | Creator Dashboard untuk mengelola event, tiket, transaksi, dan withdrawal |
| **Language** | TypeScript (strict: false) |
| **Framework** | Next.js 14 — **Pages Router** (`pages/`) |
| **UI Library** | MUI (Material UI) v5 + Emotion |
| **State Management** | SWR (server-state / data fetching), Jotai (minimal client-state — only 2 atoms) |
| **Forms** | react-hook-form |
| **HTTP Client** | Axios (via `apiUtils` wrapper) |
| **Session** | iron-session v8 (encrypted httpOnly cookie `black-hole-session`) |
| **Testing** | Jest + React Testing Library |
| **Linting** | ESLint (next/core-web-vitals, prettier, import) + Prettier |
| **CI / Deploy** | Jenkins (`Jenkinsfile`), AWS CodeBuild (`buildspec.yml`), Docker (`staging.dockerfile`) |
| **External Services** | Backend API (`BACKEND_URL`), AWS S3 (assets/images), Google Tag Manager, PostHog |
| **Package Manager** | npm |

---

## 2. Project Structure

```
black-hole/
├── pages/                     # Next.js Pages Router
│   ├── _app.tsx               # App entrypoint (providers: Emotion → MUI Theme → SWR → Toast → Auth)
│   ├── _document.tsx          # Custom document (SSR Emotion cache)
│   ├── api/                   # BFF API routes (proxy ke backend)
│   │   ├── auth/              # Login, logout, session, refresh-token, me
│   │   ├── events/            # CRUD events, submissions, assets, approvals
│   │   ├── tickets/           # Ticket operations
│   │   ├── transactions/      # Transaction queries & exports
│   │   ├── withdrawal/        # Withdrawal operations
│   │   └── ...                # Domain-specific API routes
│   ├── events/                # Event pages (list, create, edit, detail)
│   ├── dashboard/             # Dashboard page
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── finance/               # Finance pages
│   ├── approval/              # Approval pages
│   └── ...                    # Other feature pages
│
├── src/
│   ├── atoms/                 # Jotai atoms (global client state)
│   ├── components/
│   │   ├── Auth/              # Auth HOC (`withAuth`)
│   │   ├── common/            # Reusable UI primitives (Button, Modal, TextField, Typography, Table, etc.)
│   │   │   └── index.ts       # Barrel export semua common components
│   │   ├── features/          # Feature-specific components (grouped by domain)
│   │   │   ├── events/        # Event-related components (create, edit, list, detail)
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── finance/       # Finance components
│   │   │   ├── approval/      # Approval components
│   │   │   ├── tickets/       # Ticket components
│   │   │   └── ...
│   │   ├── OrganizersTable/   # Legacy component (PascalCase folder)
│   │   └── TransactionsTable/ # Legacy component
│   │
│   ├── contexts/              # React Contexts
│   │   ├── AuthContext.tsx     # Auth state (useReducer), login/logout, session restore
│   │   └── ToastContext.tsx    # Toast notifications (MUI Snackbar)
│   │
│   ├── hooks/
│   │   ├── useApi.ts          # Generic SWR wrapper hook
│   │   ├── features/          # Domain-specific hooks (useEvents, useTickets, etc.)
│   │   ├── list/              # Reference data hooks (useCities, usePaymentMethods)
│   │   └── index.ts           # Barrel export
│   │
│   ├── layouts/
│   │   └── dashboard/         # Dashboard layout (sidebar, drawer, header)
│   │
│   ├── lib/
│   │   ├── session.ts         # iron-session config & SessionData interface
│   │   ├── sessionHelpers.ts  # Session CRUD helpers (getSession, setSessionData, clearSessionData)
│   │   └── ticketTemplate.ts  # Ticket PDF template
│   │
│   ├── services/              # Service layer (class-based, singleton instances)
│   │   ├── auth/              # AuthService
│   │   ├── events/            # EventsService
│   │   ├── tickets/           # TicketsService
│   │   ├── transactions/      # TransactionsService
│   │   └── ...                # Domain services
│   │
│   ├── theme/
│   │   ├── base.ts            # MUI theme config (palette, colors)
│   │   └── ThemeProvider.tsx   # Theme provider wrapper
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # UserRole enum, AuthState, LoginRequest/Response, etc.
│   │   ├── event.ts           # Event, EventDetail, TicketType, GroupTicket, etc.
│   │   ├── ticket.ts          # Ticket, TicketsResponse, TicketInvitation
│   │   ├── transaction.ts     # Transaction types
│   │   ├── organizer.ts       # EventOrganizer types
│   │   └── ...
│   │
│   └── utils/                 # Utility modules (object-literal pattern)
│       ├── apiUtils.ts        # Client-side HTTP wrapper (auto token refresh)
│       ├── apiRouteUtils.ts   # Server-side API route factory (BFF proxy)
│       ├── validationUtils.ts # Form validation (email, phone, NIK, NPWP, password)
│       ├── formatUtils.ts     # Formatting (price, currency, number, status)
│       ├── dateUtils.ts       # Date formatting & manipulation
│       ├── stringUtils.ts     # String operations
│       ├── fileUtils.ts       # File handling
│       ├── debounceUtils.ts   # Debounce helper
│       ├── encryptUtils.ts    # Encryption utilities
│       ├── security.ts        # Security helpers (URL validation)
│       ├── csvParser.ts       # CSV parsing
│       ├── deviceUtils.ts     # Device detection
│       └── index.ts           # Barrel export
│
├── public/                    # Static assets (icons, images)
└── deployment/                # Deployment configs
```

---

## 3. Naming Conventions

### Files & Folders

| Kategori | Convention | Contoh |
|----------|-----------|--------|
| **Pages** | `kebab-case/` folder + `index.tsx` | `pages/events/edit/[metaUrl]/tickets/index.tsx` |
| **API Routes** | `kebab-case/` folder + `index.ts` | `pages/api/events/index.ts` |
| **Components (common)** | `kebab-case/` folder + `index.tsx` | `src/components/common/text-field/index.tsx` |
| **Components (feature)** | `kebab-case/` folder + `index.tsx` | `src/components/features/events/create/ticket/table/index.tsx` |
| **Hooks** | `camelCase` dengan prefix `use` | `useEvents.ts`, `useTicketType.ts` |
| **Services** | `kebab-case/` folder + `index.ts` | `src/services/events/index.ts` |
| **Types** | `kebab-case` file | `auth.ts`, `event.ts`, `ticket.ts` |
| **Utils** | `camelCase` + suffix `Utils` | `apiUtils.ts`, `formatUtils.ts`, `validationUtils.ts` |
| **Atoms (Jotai)** | `camelCase` + suffix `Atom` | `eventOrganizerAtom.ts`, `pendingPartnerAtom.ts` |
| **Contexts** | `PascalCase` + suffix `Context` | `AuthContext.tsx`, `ToastContext.tsx` |

### Code

| Kategori | Convention | Contoh |
|----------|-----------|--------|
| **Interfaces** | `PascalCase` | `EventDetail`, `TicketType`, `LoginRequest` |
| **Response types** | `PascalCase` + suffix `Response` | `EventsResponse`, `MeResponse` |
| **Request types** | `PascalCase` + suffix `Request` | `CreateEventRequest`, `LoginRequest` |
| **Enums** | `PascalCase` name, `SCREAMING_SNAKE` values | `UserRole.EVENT_ORGANIZER_PIC` |
| **Service classes** | `PascalCase` + suffix `Service` | `class EventsService` |
| **Service singletons** | `camelCase` + suffix `Service` | `const eventsService = new EventsService()` |
| **Hook functions** | `camelCase` prefix `use` | `useEvents()`, `useApi()` |
| **Utility objects** | `camelCase` + suffix `Utils` | `apiUtils.get()`, `formatUtils.formatPrice()` |
| **Components** | `PascalCase` function | `function Events()`, `EventsTable` |
| **HOC** | `camelCase` prefix `with` | `withAuth(Component, options)` |
| **Constants** | `SCREAMING_SNAKE_CASE` | `ALLOWED_ROLES` |

---

## 4. Error Handling

### Architecture (3 layers)

```
Backend API  →  API Route (pages/api/)  →  Client (browser)
                    ↓                         ↓
             apiRouteUtils               apiUtils
             (server-side)              (client-side)
```

### Server-side (API Routes via `apiRouteUtils`)
- Semua API routes menggunakan `apiRouteUtils.create*Handler()` (factory pattern)
- Error dari backend di-forward langsung: `res.status(error.response.status).json(error.response.data)`
- Non-axios error return `500` dengan `{ message: 'Internal server error' }`
- Auth error (401) di-propagate ke client untuk trigger token refresh

### Client-side (`apiUtils`)
- `apiUtils.makeRequest()` otomatis retry 401 dengan `refreshTokens()`
- Jika refresh gagal → `clearExpiredSession()` → redirect ke `/login`
- Error response di-parse oleh `apiUtils.handleAxiosError()`:
  - Cek `data.message`, `data.error`, atau `data.details[]`
  - Return `new Error(errorMessage)` (single Error object)
- Error di-log via `console.error('API Error:', { message, status, data, url, code })`

### Service layer
- Service methods wrap calls dalam `try/catch`
- `console.error` di dalam catch, lalu re-throw error
- Tidak transform error — let it propagate ke hook/component

### Component layer
- Hooks (`useApi`) expose `error: string | null` dari SWR
- Components tampilkan error message secara kondisional
- Toast context (`useToast`) untuk user-facing notifications: `showSuccess()`, `showError()`, `showWarning()`, `showInfo()`

### Response format standar dari backend:
```typescript
{ statusCode: number; message: string; body: T }
```

---

## 5. Authentication & Authorization

### Session Flow (BFF Pattern)
1. **Login**: Client → `POST /api/auth/login` → backend `/auth/login` → response tokens + user → simpan ke iron-session (encrypted cookie) → return user only (no tokens ke client)
2. **Authenticated requests**: API routes baca `session.accessToken` dari cookie → tambahkan `Authorization: Bearer` ke request ke backend
3. **Token refresh**: Client-side `apiUtils` detect 401 → call `/api/auth/refresh-token` → API route update session tokens → retry original request
4. **Logout**: Clear session + SWR cache → redirect `/login`

### User Roles (`UserRole` enum)
| Role | Access |
|------|--------|
| `admin` | Full access |
| `business_development` | Full access |
| `event_organizer_pic` | Event organizer dashboard (gets data from `/event-organizers/me`) |
| `ground_staff` | View events (ongoing/upcoming/past) + tickets only |
| `finance` | View events + finance pages only |
| `buyer` | **NOT ALLOWED** pada dashboard ini |
| `guest` | **NOT ALLOWED** pada dashboard ini |

### Authorization Mechanism
- **`ALLOWED_ROLES`**: Array role yang boleh akses dashboard (`admin`, `business_development`, `event_organizer_pic`, `ground_staff`, `finance`)
- **`withAuth` HOC**: Wrap page component → cek `isAuthenticated` → redirect ke `/login` jika belum login
  - Role-based routing: `ground_staff` hanya boleh `/events` + `/tickets`, `finance` hanya `/events` + `/finance`
  - Usage: `export default withAuth(Events, { requireAuth: true })`
- **Role check di login**: `apiRouteUtils.createLoginHandler` cek role terhadap `ALLOWED_ROLES`, return 403 jika tidak authorized

### Key Auth Files
- `src/contexts/AuthContext.tsx` — Provider + `useAuth()` hook
- `src/components/Auth/withAuth.tsx` — HOC guard
- `src/lib/session.ts` — Session config
- `src/lib/sessionHelpers.ts` — Session CRUD helpers
- `src/types/auth.ts` — Types + `UserRole` enum + `ALLOWED_ROLES`

---

## 6. Key Patterns

### BFF Proxy Pattern (Backend for Frontend)
```typescript
// pages/api/events/index.ts — Semua API route pakai factory dari apiRouteUtils
import { apiRouteUtils } from '@/utils/apiRouteUtils';
export default apiRouteUtils.createGetHandler({
  endpoint: '/events',
  timeout: 30000
});
```
Available factories: `createGetHandler`, `createPostHandler`, `createPutHandler`, `createDeleteHandler`, `createLoginHandler`, `createRefreshTokenHandler`, `createLogoutHandler`, `createExportHandler`

### File Upload Pattern (exception to factory)
```typescript
// pages/api/upload-asset.ts — satu-satunya API route yang TIDAK langsung pakai factory
export default async function handler(req, res) {
  // 1. Manual method check (POST only)
  // 2. Body validation: { type, file, filename, privacy, fileGroup }
  // 3. Security: block SVG uploads (Stored XSS prevention)
  // 4. Baru pakai factory di dalam handler:
  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/upload-asset',
    timeout: 60000  // ← 60s (double dari default 30s)
  });
  return await postHandler(req, res);
}
```

### Service Layer Pattern (Class-based Singleton)
```typescript
class EventsService {
  async getEvents(filters?: EventsFilters): Promise<EventsResponse> {
    return await apiUtils.get('/api/events', params, 'Failed to fetch events');
  }
}
const eventsService = new EventsService();
export { eventsService };
```

### Hook Pattern (2 variants)

**Variant A: via `useApi` wrapper** (preferred untuk hook baru)
```typescript
const useEvents = (filters?: EventsFilters): UseEventsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events', filters],    // SWR key (array untuk auto-revalidation)
    () => eventsService.getEvents(filters)
  );
  return { events: data?.body?.data || [], loading, error, mutate, pagination: ... };
};
```

**Variant B: raw `useSWR`** (legacy — beberapa hook masih pakai ini)
```typescript
const useTransactions = (filters: TransactionsFilters) => {
  const { data, isLoading, error, mutate } = useSWR<TransactionsResponse>(
    filters.eventId ? ['/api/transactions', filters] : null,
    () => transactionsService.getEventTransactions(filters)
  );
  return {
    transactions: data?.transactions || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : typeof error === 'string' ? error : null,
    mutate,
    pagination: data?.pagination
  };
};
```
> **Catatan**: `useApi` preferred karena sudah normalize error dan loading state. Raw `useSWR` butuh manual error normalization.

### Hooks Organization
```
src/hooks/
├── useApi.ts                    # Generic SWR wrapper (shared)
├── features/                    # Domain-specific hooks (CRUD data yang sering berubah)
│   ├── events/useEvents.ts
│   ├── tickets/useTickets.ts
│   ├── transactions/useTransactions.ts
│   └── ...
├── list/                        # Reference/lookup data (jarang berubah)
│   ├── useCities.ts
│   └── usePaymentMethods.ts
└── index.ts                     # Barrel export
```

### Page Pattern
```typescript
function Events() {
  const { user } = useAuth();
  const { events, loading, error, mutate } = useEvents(filters);
  return (
    <DashboardLayout>
      <Head><title>Events - Black Hole Dashboard</title></Head>
      {/* Content */}
    </DashboardLayout>
  );
}
export default withAuth(Events, { requireAuth: true });
```

### Toast Notifications
```typescript
const { showSuccess, showError } = useToast();
showSuccess('Event created successfully');
showError(error.message);
```

### Provider Hierarchy (`_app.tsx`)
```
CacheProvider (Emotion) → ThemeProvider (MUI) → SWRConfig → ToastProvider → AuthProvider → Component
```

### Import Alias & Utils Import Styles
```typescript
import { eventsService } from '@/services';
import { useEvents } from '@/hooks';
import { Button, TextField } from '@/components/common';
```
Path alias: `@/` → `./src/`

Utils punya 3 cara import (semua valid, pilih yang paling readable):
```typescript
// Style 1: Import util object (preferred untuk banyak functions dari 1 module)
import { formatUtils } from '@/utils';
formatUtils.formatPrice(1000);

// Style 2: Import function langsung (preferred untuk 1-2 functions)
import { formatPrice, formatCurrency } from '@/utils';
formatPrice(1000);

// Style 3: Unified utils object (jarang dipakai)
import { utils } from '@/utils';
utils.format.formatPrice(1000);
```

### Common Components
Primitives tersedia di `@/components/common`: `Button`, `Card`, `DateField`, `DropdownSelector`, `Modal`, `Popup`, `PhoneField`, `Select`, `Tabs`, `TextField`, `TextArea`, `TimeField`, `Typography` (H1-H4, Body1, Body2, Caption, Overline), `Accordion`, `Checkbox`, `Breadcrumb`, `Dropzone`, `AutoComplete`, `MultiSelect`, `Pagination`, `StyledTable*`

### State Management Breakdown
| Mekanisme | Scope | Contoh |
|-----------|-------|--------|
| **SWR / `useApi`** | Server state (API data) | `useEvents()`, `useTickets()` — auto revalidate, cache |
| **AuthContext (useReducer)** | Auth state global | `useAuth()` → `{ user, isAuthenticated, login, logout }` |
| **ToastContext (useState)** | Toast notification | `useToast()` → `{ showSuccess, showError }` |
| **Jotai atoms** | Shared UI state lintas component | Hanya 2 atom: `selectedEOIdAtom` (dropdown EO), `pendingPartnerAtom` (form data antar step) |
| **react-hook-form** | Form-local state | `useForm()`, `Controller`, `watch`, `setValue` |
| **useState** | Component-local state | Filters, active tab, search value, modals open/close |

> Jotai digunakan **sangat minimal**. Jangan buat atom baru kecuali benar-benar butuh share state antar component yang tidak parent-child dan bukan server-state.

### Event Organizer Conditional Flow
User dengan role `event_organizer_pic` punya flow data berbeda:
```typescript
// AuthContext.tsx — saat session restore
if (user.role.name === UserRole.EVENT_ORGANIZER_PIC) {
  // Ambil data organizer dari /event-organizers/me (BUKAN /users/me)
  const eoData = await authService.getEventOrganizerMe();
  // User object = EventOrganizer type
}

// Di page/component: cek tipe user dengan type guard
import { isEventOrganizer, User, EventOrganizer } from '@/types/auth';

if (isEventOrganizer(user)) {
  // user: EventOrganizer — punya organizer_type, nik, npwp, ktp_photo_id, etc.
  const isComplete = !!user.organizer_type && !!user.nik && ...; // form completeness check
} else {
  // user: User — punya role.name, dipakai untuk admin/BD/staff
  const userRole = (user as User).role?.name;
}
```
> Pattern ini penting: `AuthUser = User | EventOrganizer`. Selalu gunakan `isEventOrganizer()` sebelum akses EO-specific fields.

### Test Pattern
- **Co-located**: Test files di **sebelah** component (`index.test.tsx` next to `index.tsx`), bukan di folder `__tests__/`
- **Naming**: `[component-folder]/index.test.tsx`
- **Framework**: Jest + React Testing Library (`render`, `screen`, `fireEvent`)
- **48 test files** tersebar di `src/components/features/`

Common mock patterns:
```typescript
// Mock next/router (hampir setiap test)
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush, pathname: '/', query: {}, asPath: '/' });

// Mock service
jest.mock('@/services', () => ({ eventsService: { getEvents: jest.fn() } }));

// Mock data harus ikuti type shape
const mockEvent: Event = { id: '1', name: 'Test', metaUrl: 'test', ... };
```

---

## 7. ⛔ Don'ts

1. **Jangan langsung call backend URL dari client** — Semua HTTP requests dari browser harus ke `/api/*` (BFF proxy). Backend URL (`BACKEND_URL`) hanya digunakan di server-side (API routes).

2. **Jangan simpan tokens di client** — Access token dan refresh token hanya ada di server-side iron-session. Client TIDAK boleh akses tokens.

3. **Jangan buat API route tanpa `apiRouteUtils`** — Gunakan factory functions (`createGetHandler`, `createPostHandler`, dll.), kecuali handler yang sangat custom.

4. **Jangan skip barrel exports** — Tambahkan service baru ke `src/services/index.ts`, hook baru ke `src/hooks/index.ts`, common component ke `src/components/common/index.ts`.

5. **Jangan buat HTTP calls langsung pakai `axios`** — Gunakan `apiUtils` (client-side) atau `apiRouteUtils` (server-side). Mereka handle auth headers, token refresh, dan error handling.

6. **Jangan hardcode warna** — Gunakan MUI theme (`theme.palette.*`). Referensi palette ada di `src/theme/base.ts`.

7. **Jangan edit generated files** — `.next/`, `node_modules/`, `coverage/`, `next-env.d.ts`

8. **Jangan bypass `withAuth`** — Setiap page yang butuh login harus di-wrap: `export default withAuth(Component, { requireAuth: true })`.

9. **Jangan buat global state tanpa pertimbangan** — Gunakan Jotai atom untuk state yang benar-benar perlu di-share antar component yang tidak parent-child. Untuk server-state, gunakan SWR hooks.

10. **Jangan tambahkan `'use client'` directive** — Project ini pakai Pages Router, bukan App Router. Semua component di `pages/` sudah client-side by default.

11. **Jangan ubah import order** — ESLint enforces: `builtin → external → internal → parent → sibling → index` dengan newlines antar group, sorted alphabetically.

---

## 8. Entity Relationships

```
EventOrganizer (1) ────── (N) Event
       │                       │
       │                       ├── (N) TicketType
       │                       │         │
       │                       │         ├── (N) GroupTicket
       │                       │         │
       │                       │         └── (N) Ticket (issued)
       │                       │                   │
       │                       │                   └── (1) Transaction
       │                       │
       │                       ├── (N) EventAsset ── (1) Asset
       │                       │
       │                       ├── (N) PaymentMethod ── (1) Bank
       │                       │
       │                       ├── (N) Invitation
       │                       │
       │                       ├── (1) City
       │                       │
       │                       └── (0..1) EventUpdateRequest (pending edits)
       │
       ├── (1) BankInformation ── (1) Bank
       ├── (0..1) Asset (profile photo)
       ├── (0..1) Asset (KTP photo)
       └── (0..1) Asset (NPWP photo)

User ──── (1) Role { admin | business_development | event_organizer_pic | ground_staff | finance }
  │
  └── (0..1) EventOrganizer (if role = event_organizer_pic)
```

### Key Type Unions
- `AuthUser = User | EventOrganizer` — tipe guard: `isEventOrganizer(user)`
- `TicketStatus = 'pending' | 'issued' | 'cancelled' | 'redeemed'`
- `EventStatus` prefixes: `EVENT_STATUS_ON_GOING`, `EVENT_STATUS_APPROVED`, `EVENT_STATUS_DRAFT`, `EVENT_STATUS_REJECTED`, `EVENT_STATUS_ON_REVIEW`, `EVENT_STATUS_DONE`

---

## 9. Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint-fix` | Auto-fix lint issues |
| `npm run format` | Format all files (Prettier) |
| `npm run format:check` | Check formatting |
| `npm run format:fix` | Format + lint fix |
| `npm run test` | Run tests (Jest) |
| `npm run test:watch` | Watch mode tests |
| `npm run test:coverage` | Test coverage report |

### Environment Variables
Copy `.env.local.example` → `.env.local` dan isi:
- `BACKEND_URL` — Backend API URL (server-side only)
- `SECRET_COOKIE_PASSWORD` — iron-session secret (min 32 chars)
- `NEXT_PUBLIC_API_URL` — Public API URL
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` — Analytics
- `NEXT_PUBLIC_WUKONG_URL` — Main platform URL
- `NEXT_PUBLIC_BLOG_URL` — Blog URL

---

## 10. Communication Preferences

| Setting | Value |
|---------|-------|
| **Chat language** | Bahasa Indonesia |
| **Code language** | English (variable names, comments, error messages) |
| **Commit messages** | English, imperative mood |
| **UI text** | Mixed — some Indonesian ("Cari Event"), some English ("Create New Event") |
| **Error messages** | English (from backend & utils) |
| **Prettier** | Single quotes, no trailing comma, 2-space indent, 80 char width |
| **ESLint** | import order enforced, react-hooks/rules strict |
