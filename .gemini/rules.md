# Black Hole (Wukong Creator Dashboard) — AI Coding Rules

> Organizer/admin dashboard for event creators. This is a **BFF (Backend-for-Frontend)** — it has **no local database**. All domain data lives in an external REST API at `BACKEND_URL`; this repo proxies via `pages/api/*` and renders a Material-UI dashboard.

---

## 1. Project Overview

| Area | Stack |
|---|---|
| **Framework** | Next.js **14.2.35**, **Pages Router** (`pages/`), TypeScript |
| **React** | **18.2.0** |
| **Routing** | `pages/` directory — **no `app/` directory exists** |
| **UI library** | **Material-UI v5** (`@mui/material`, `@mui/icons-material`) |
| **Styling** | **Emotion** (`@emotion/react`, `@emotion/styled`, `@emotion/cache`, `@emotion/server`) — MUI `sx` prop and `styled()` |
| **Database** | **None in this repo.** Data fetched from external REST API via `BACKEND_URL` |
| **Auth** | **iron-session** — encrypted httpOnly cookie `black-hole-session` stores `user`, `accessToken`, `refreshToken`; client auth state via `AuthContext` + `withAuth` HOC |
| **Client state** | **Jotai** atoms in `src/atoms/` (e.g. selected event organizer) |
| **Client data fetching** | **SWR** (global fetcher in `pages/_app.tsx`; custom `useApi` hook wraps SWR) |
| **Forms** | **react-hook-form** + validators in `src/utils/validationUtils.ts` |
| **HTTP clients** | `apiUtils` (browser → `/api/*` via axios, `withCredentials: true`) |
| **API proxy** | `apiRouteUtils` factory in `src/utils/apiRouteUtils.ts` (API routes → `BACKEND_URL`) |
| **Testing** | Jest + Testing Library; co-located `*.test.ts(x)` files |
| **TypeScript** | `strict: false` in `tsconfig.json` (legacy) — prefer strict typing in new code |

### Related repositories

| Repo | Role |
|---|---|
| **black-hole** (this repo) | Creator/organizer dashboard (BFF + MUI UI) |
| **black-void** | Consumer-facing Wukong ticketing site — different stack (App Router, Tailwind, next-intl). Do not copy patterns blindly. |

### Auth roles (`src/types/auth.ts`)

| Role | Value | Dashboard access |
|---|---|---|
| Admin | `admin` | Full dashboard |
| Business Development | `business_development` | Full dashboard |
| Event Organizer PIC | `event_organizer_pic` | Full dashboard (loads `EventOrganizer` via `/api/event-organizers/me`) |
| Ground Staff | `ground_staff` | `/events`, `/tickets` only (no `/events/create`) |
| Finance | `finance` | `/events`, `/finance` only (no `/events/create`) |
| Cashier | `cashier` | `/ots`, `/tickets`, `/account` only |
| Buyer / Guest | `buyer`, `guest` | **Blocked** at login (`ALLOWED_ROLES` check) |

`NEXT_PUBLIC_PREVILAGE_ROLE` can extend admin-like privileges for specific roles in `DashboardLayout`.

### Environment variables (`.env.local.example`)

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | External REST API base URL (server-side only) |
| `SECRET_COOKIE_PASSWORD` | iron-session encryption key |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_POSTHOG_KEY` / `HOST` | Analytics |
| `NEXT_PUBLIC_WUKONG_URL` | Consumer site URL |
| `NEXT_PUBLIC_PREVILAGE_ROLE` | Extra admin-privilege roles (typo preserved in env name) |
| `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION` | Facebook domain meta tag in `_document.tsx` |
| `NEXT_PUBLIC_BLOG_URL` | External blog link |
| `NEXT_PUBLIC_APP_VERSION` | Display version string |

**Required for local dev** — copy `.env.local.example` → `.env.local` and set at minimum:

```
BACKEND_URL=…
SECRET_COOKIE_PASSWORD=…   # min 32 characters (iron-session requirement)
```

`SECRET_COOKIE_PASSWORD` must be **≥ 32 characters** or iron-session will fail at runtime.

### CI/CD & deployment

| Item | Detail |
|---|---|
| **CI workflow** | `.github/workflows/docker-publish.yml` — runs **only on merged PRs** to `main` or `develop` |
| **CI does NOT run** | `npm test`, `npm run lint`, or `npm run build` in GitHub Actions — verify locally before opening a PR |
| **Docker image** | Built from `staging.dockerfile` (Node **18** Alpine); `npm install --legacy-peer-deps` in Docker only |
| **Image tags** | `main` → `{DOCKERHUB_USER}/black-hole:{sha}` (prod); `develop` → `{DOCKERHUB_USER}/black-hole-stag:{sha}` |
| **Deploy trigger** | Post-build dispatch to `Liku-id/byteplus-infra` with `service: black-hole` |
| **Build env file** | Docker copies `.env.development` at build time — not `.env.local` |

### Root URL behavior (easy to confuse)

| Source | Behavior |
|---|---|
| `next.config.js` redirect | `/` → `/register` (permanent: false) |
| `pages/index.tsx` | After auth loads, redirects authenticated users by role (`/dashboard`, `/events`, `/ots`) or unauthenticated to `/register` |

---

## 2. Project Structure

```
black-hole/
├── next.config.js          # Webpack @ alias, redirects (/ → /register), image remotePatterns
├── pages/                  # Next.js Pages Router — all routes live here
│   ├── _app.tsx            # Global providers: Emotion, MUI Theme, SWR, Toast, Auth
│   ├── _document.tsx       # HTML shell, fonts (Onest, Bebas Neue), favicons
│   ├── index.tsx           # Root redirect
│   ├── 404.tsx             # Custom not-found page
│   ├── unauthorized.tsx    # Access-denied page
│   ├── login/              # Auth pages (no DashboardLayout)
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── dashboard/          # Main dashboard + legal pages
│   ├── events/             # Event list, detail, create, edit flows
│   │   ├── [metaUrl]/      # Event detail, invitation, partner-ticket
│   │   ├── create/         # Multi-step event creation wizard
│   │   └── edit/[metaUrl]/ # Edit info, tickets, assets, group-tickets
│   ├── tickets/            # Attendee ticket list
│   ├── transactions/       # Transaction list
│   ├── finance/            # Finance analytics, withdrawals
│   ├── approval/           # Admin approval queues (events, OTS, withdrawals)
│   ├── organizers/         # Organizer management (admin)
│   ├── creator/            # Creator profile pages
│   ├── team/               # Staff management
│   ├── account/            # Account settings (general, bank, legal)
│   ├── ots/                # On-the-spot sales (cashier)
│   └── api/                # BFF API routes — proxy to BACKEND_URL
│       ├── auth/           # login, logout, session, me, refresh-token, OTP
│       ├── events/         # CRUD, submissions, assets, invitations, OTS
│       ├── tickets/        # Ticket types, additional forms, export
│       ├── transactions/   # List, summary, export
│       ├── event-organizers/ # Organizer CRUD, staff, bank, legal
│       ├── withdrawal/     # Withdrawal requests and history
│       ├── partners/       # Partner management
│       ├── order/          # OTS order creation
│       └── list/           # Reference data (cities, payment methods)
├── src/
│   ├── components/
│   │   ├── common/         # Reusable MUI primitives (Button, TextField, Table, Modal, …)
│   │   ├── features/       # Feature-specific UI grouped by domain
│   │   │   ├── events/     # create/, edit/, detail/, list/, invitation/, partner-ticket/
│   │   │   ├── dashboard/  # Dashboard widgets
│   │   │   ├── finance/    # Analytics, transactions, withdrawals
│   │   │   ├── approval/   # Admin approval tables/modals
│   │   │   ├── account/    # Profile forms
│   │   │   ├── registration/ # Organizer registration flow
│   │   │   ├── ots/        # On-the-spot sales UI
│   │   │   ├── ticket-list/
│   │   │   └── team-member/
│   │   ├── Auth/           # LoginForm, withAuth HOC
│   │   ├── OrganizersTable/  # Legacy top-level component
│   │   └── TransactionsTable/
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Login/logout/session restore, role-based redirect
│   │   └── ToastContext.tsx  # Snackbar toasts (showSuccess, showError, …)
│   ├── hooks/
│   │   ├── useApi.ts         # SWR wrapper (key + fetcher)
│   │   ├── features/         # Domain hooks (useEvents, useTickets, …)
│   │   └── list/             # Reference-data hooks (useCities, usePaymentMethods)
│   ├── services/             # Client service layer → /api/*
│   │   ├── auth/             # login, logout, me, refresh
│   │   ├── events/           # Event CRUD, invitations, submissions
│   │   ├── tickets/          # Ticket types, export
│   │   ├── transactions/   # Transactions, export
│   │   ├── event-organizer/  # Organizer profile updates
│   │   ├── withdrawal/       # Withdrawal flows
│   │   ├── partners/         # Partner CRUD
│   │   ├── discounts/        # Discount management
│   │   ├── assets/           # File upload
│   │   ├── staff/            # Team member management
│   │   └── list/             # Cities, payment methods
│   ├── layouts/
│   │   └── dashboard/        # DashboardLayout (sidebar, header, EO dropdown)
│   ├── lib/
│   │   ├── session.ts        # iron-session config + SessionData type
│   │   └── sessionHelpers.ts # getSession, setSessionData, isAuthenticated
│   ├── atoms/                # Jotai atoms (selectedEOIdAtom, selectedEONameAtom)
│   ├── theme/                # MUI theme (base.ts, ThemeProvider.tsx)
│   ├── types/                # Domain TypeScript interfaces
│   └── utils/                # apiUtils, apiRouteUtils, validationUtils, formatters
└── public/                   # Static assets (icons, logos, favicons)
```

### Path aliases

| Alias | Maps to |
|---|---|
| `@/*` | `./src/*` |
| `@/public/*` | `./public/*` |

Configured in `tsconfig.json` and `next.config.js` webpack alias.

### Key page patterns

- **Protected pages** — wrap default export with `withAuth(PageComponent, { requireAuth: true })`
- **Auth pages** (login/register) — `withAuth(Component, { requireAuth: false })` to redirect authenticated users
- **Dashboard pages** — wrap content in `<DashboardLayout>` + `<Head>` for title
- **Admin EO switcher** — read `selectedEOIdAtom` from Jotai; pass `event_organizer_id` filter to hooks

---

## 3. Rendering Conventions

> **This project uses the Pages Router, not the App Router.** There is no `app/` directory, no Server Components, and no `'use client'` directive. All pages are client-rendered React components.

### Next.js alignment (read this before "modernizing")

| Latest Next.js / App Router practice | This repo |
|---|---|
| `app/` directory + `page.tsx` | **`pages/` + `index.tsx`** |
| Server Components by default | **All client-rendered** — no RSC boundary |
| `metadata` / `generateMetadata` | **`next/head`** `<Head><title>…</title></Head>` |
| `loading.tsx` / `error.tsx` | **Inline hook loading** + `pages/404.tsx` |
| Server Actions + `revalidatePath` | **`pages/api/*` BFF** + SWR `mutate()` |
| `middleware.ts` for auth | **`withAuth` HOC** + iron-session on API routes |

**Do not migrate existing routes to App Router patterns** as part of feature work. The stack is intentionally Pages Router + client SWR until the team plans a migration.

### Pages Router model

- Every file in `pages/` is a route. Folders map to URL segments; `[param]` creates dynamic routes.
- **No `getServerSideProps` or `getStaticProps`** are used — all data is fetched client-side.
- Global setup lives in `pages/_app.tsx` (providers) and `pages/_document.tsx` (HTML shell).

### When components need browser APIs / hooks

In Pages Router, pages and components can use hooks directly — no `'use client'` needed. Use hooks (`useState`, `useEffect`, SWR, Jotai, react-hook-form) freely in:

- `pages/*.tsx` route files
- `src/components/**/*.tsx` feature components
- `src/layouts/**/*.tsx`

### Code splitting

Use `next/dynamic` for heavy feature sections:

```tsx
const EventStatistic = dynamic(
  () => import('@/components/features/dashboard/event-stat')
);
```

Reference: `pages/dashboard/index.tsx`

### Route protection (not middleware)

- **No `middleware.ts` exists.** Auth is enforced client-side via `withAuth` HOC.
- `withAuth` checks `AuthContext`, redirects unauthenticated users to `/login?redirect=…`, and enforces role-based route access.
- API routes enforce auth server-side via iron-session (`apiRouteUtils` reads session, forwards `Authorization: Bearer`).

### Layout composition

```tsx
function MyPage() {
  return (
    <DashboardLayout>
      <Head><title>Wukong Creator - Page Title</title></Head>
      {/* page content */}
    </DashboardLayout>
  );
}

export default withAuth(MyPage, { requireAuth: true });
```

### Navigation

- Use `next/router` → `useRouter()` for navigation (`router.push`, `router.replace`, `router.query`)
- Some pages also use `useSearchParams` from `next/navigation` for query params (hybrid usage exists — prefer `router.query` for consistency in new code)

### Do NOT migrate to App Router patterns

- Do not create `app/` routes, `layout.tsx`, `error.tsx`, or `loading.tsx` unless the team explicitly migrates.
- Do not add `'use client'` directives — they are App Router-only and unused here.

---

## 4. Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| React components | **PascalCase** | `EventsTable`, `LoginForm`, `DashboardLayout` |
| Component folders | **kebab-case** with `index.tsx` | `components/features/events/list/table/index.tsx` |
| Page route folders | **kebab-case** | `forgot-password/`, `checkout-payment/`, `group-tickets/` |
| Dynamic route segments | **bracket notation** | `[metaUrl]`, `[id]`, `[eventId]`, `[eo_id]` |
| Hooks | **camelCase**, `use` prefix | `useEvents`, `useApi`, `useWithdrawals` |
| Hook files | **camelCase** in `hooks/features/<domain>/` | `useEventDetail.ts` |
| Jotai atoms | **camelCase** + `Atom` suffix | `selectedEOIdAtom`, `selectedEONameAtom` |
| Services | **camelCase** class instances | `eventsService`, `authService` |
| Service files | domain folder + `index.ts` | `services/events/index.ts` |
| Utility functions | **camelCase** | `apiUtils`, `validationUtils`, `formatUtils` |
| API route files | **kebab-case**, mirror REST paths | `pages/api/auth/refresh-token.ts`, `pages/api/events/[metaUrl]/index.ts` |
| Type files | **kebab-case** in `src/types/` | `event.ts`, `events-submission.ts`, `organizer.ts` |
| Interfaces / types | **PascalCase** | `EventDetail`, `TicketType`, `WithdrawalSummary` |
| Test files | co-located **`*.test.ts(x)`** | `index.test.tsx` next to `index.tsx` |
| Static assets | **kebab-case** | `wukong.svg`, `finance-revert.svg` |

### Barrel exports

- Shared UI: `import { Button, H2, TextField } from '@/components/common'`
- Hooks: `import { useEvents, useTickets } from '@/hooks'`
- Services: `import { eventsService, authService } from '@/services'`

### Legacy naming

Some older components use PascalCase top-level folders (`Auth/`, `OrganizersTable/`). New feature code should go under `components/features/<domain>/`.

---

## 5. Data Fetching & Mutations

> **This project does NOT use Server Actions, Zod, or `revalidatePath`/`revalidateTag`.** Follow the existing BFF + SWR + service layer pattern.

### Architecture: BFF API Routes

```
Browser (SWR / apiUtils via axios)
    →  /api/*  (pages/api/* NextApiHandler)
        →  axios  →  BACKEND_URL + endpoint
            (Authorization: Bearer <accessToken> from iron-session)
```

### Read operations (client)

1. **Service** calls `apiUtils.get('/api/…')` in `src/services/<domain>/`
2. **Hook** wraps SWR via `useApi` in `src/hooks/features/<domain>/`
3. **Page/component** consumes the hook

```tsx
// Hook pattern (src/hooks/features/events/useEvents.ts)
const { data, loading, error, mutate } = useApi(
  ['/api/events', filters],
  () => eventsService.getEvents(filters)
);
```

`useApi` defaults: `refreshInterval: 30000`, `revalidateOnFocus: true`, `errorRetryCount: 3`.

Global SWR config in `_app.tsx`: `revalidateOnFocus: false` (hook-level overrides apply).

### Write operations (mutations)

**Pattern A — Service + manual state hook** (for updates):

```tsx
// src/hooks/features/organizers/useUpdateEventOrganizerGeneral.ts
const { mutate, isPending, error } = useUpdateEventOrganizerGeneral();
await mutate({ eoId, payload });
```

**Pattern B — Service called directly from component** (for one-off actions):

```tsx
await eventsService.submitEvent(metaUrl);
mutate(); // SWR revalidate from useApi
```

**Pattern C — AuthContext methods** for login/logout.

### API route creation

Prefer `apiRouteUtils` factory handlers:

```ts
// Simple proxy
export default apiRouteUtils.createGetHandler({
  endpoint: '/events',
  timeout: 30000
});

// Auth endpoints
export default apiRouteUtils.createLoginHandler({ endpoint: '/auth/login' });
export default apiRouteUtils.createRefreshTokenHandler({ endpoint: '/auth/refresh-token' });
export default apiRouteUtils.createLogoutHandler({ endpoint: '/auth/logout' });
```

Available factories: `createGetHandler`, `createPostHandler`, `createPutHandler`, `createPatchHandler`, `createDeleteHandler`, `createExportHandler`, `createLoginHandler`, `createRefreshTokenHandler`, `createLogoutHandler`.

For custom pre/post processing, wrap a factory (see `pages/api/order/create.ts`).

`requireAuth: false` opts out of session check (rare — login/OTP routes).

### Form validation

Use **react-hook-form** with validators from `src/utils/validationUtils.ts`:

```tsx
const methods = useForm<LoginFormData>({ mode: 'onChange' });

// In TextField rules:
rules={{ validate: validationUtils.emailValidator }}
```

Available validators: `emailValidator`, `passwordValidator`, `phoneNumberValidator`, `organizerNameValidator`, `confirmPasswordValidator`, plus standalone checks (`isValidEmail`, `isValidNIK`, `isValidNPWP`, `validatePassword`).

Do **not** introduce Zod unless the team explicitly adopts it.

### Cache invalidation after mutations

- Call `mutate()` from the relevant `useApi` hook to revalidate SWR cache
- On logout, `AuthContext` clears all SWR cache: `mutate(() => true, undefined, { revalidate: false })`
- No `revalidatePath` — not applicable to Pages Router BFF pattern

### Token refresh

`apiUtils.makeRequest` auto-retries on 401 by calling `/api/auth/refresh-token`. On refresh failure, clears session and redirects to `/login`.

### Backend response shapes

Most endpoints return:

```ts
{ statusCode: number; message: string; body: T }
// or
{ status_code: number; message: string; body: T }
```

Some list endpoints nest data differently — check the matching type in `src/types/` or existing service/hook.

### Backend success & pagination conventions

| Convention | Detail |
|---|---|
| **Business success** | Many endpoints return `statusCode: 0` in JSON (not `200`). Auth checks use `response.statusCode === 0 && response.body` — see `src/contexts/AuthContext.tsx` |
| **HTTP status** | Proxy forwards backend HTTP status; a `200` HTTP response can still carry a non-zero `statusCode` in the body — always check the type file |
| **Pagination** | **0-indexed** — initial page is `page: 0` (see `pages/events/index.tsx`, `useEvents` filters) |
| **Snake vs camelCase** | Backend responses mix `statusCode` / `status_code`, `event_organizer_id` / `eventOrganizerId` — match the interface in `src/types/` for each endpoint |
| **Service vs API path** | Service folder `src/services/event-organizer/` (singular) proxies to API `/api/event-organizers/*` (plural) — follow existing naming per domain |

### SWR fetcher duality (common agent bug)

Two SWR configurations coexist:

| Source | Fetcher | Used by |
|---|---|---|
| `pages/_app.tsx` global `SWRConfig` | `axios.get(url).then(res => res.data)` | Rare direct `useSWR('/api/…')` calls |
| `src/hooks/useApi.ts` | Custom `fetcher` arg (via service → `apiUtils`) | **Dominant pattern** — all domain hooks |

New data fetching should use **`useApi` + service + `apiUtils`**, not raw `useSWR` with the global fetcher.

---

## 6. Error Handling

> **No `error.tsx` or `loading.tsx` route files exist** (App Router pattern). Use the patterns below.

### API routes (`pages/api/*`)

`apiRouteUtils` handlers catch axios errors and forward backend responses:

```ts
// Success: res.status(response.status).json(responseData)
// Backend error: res.status(error.response.status).json(error.response.data)
// Unknown error: res.status(500).json({ message: 'Internal server error' })
```

Auth errors (401) preserve session so the client can attempt token refresh. Session cleanup happens after refresh failure.

Custom handlers should follow the same pattern — try/catch, forward `error.response.data`, return 500 for unexpected errors.

### Client-side API errors

- **`apiUtils.handleAxiosError`** — extracts `data.message` or `data.error` from axios responses
- **401 (non-login)** — triggers `clearExpiredSession()` → redirect to `/login`
- **SWR errors** — `useApi` exposes `error: string | null` (from `error.message`)

### User-facing feedback

- **`useToast()`** from `ToastContext` — `showSuccess`, `showError`, `showWarning`, `showInfo`
- **Inline error display** — `error` state from hooks, `AuthContext.error` for login
- **Loading states** — `loading` from `useApi`, `isPending` from mutation hooks, MUI `CircularProgress` in `withAuth`

### Page-level error UI

| File | Purpose |
|---|---|
| `pages/404.tsx` | Custom 404 page with navigation buttons |
| `pages/unauthorized.tsx` | Access denied page |

### Auth errors

- **403 on login** — role not in `ALLOWED_ROLES` → `ROLE_NOT_ALLOWED` code
- **401 on API calls** — automatic token refresh; failure → session clear + login redirect
- **Role-based redirect** — `withAuth` redirects restricted roles away from unauthorized routes

### Serialized errors

N/A — no Server Actions. API routes return JSON with HTTP status codes; client reads `error.message` from thrown `Error` or `response.data.message`.

---

## 7. ⛔ Don'ts

### Architecture & data

- **Don't add Prisma, Drizzle, or any local ORM** — there is no database in this repo
- **Don't call `BACKEND_URL` directly from the browser** — always go through `/api/*` routes
- **Don't introduce Server Actions or `app/` directory routes** — this is a Pages Router project
- **Don't add Zod** unless explicitly adopted — use `validationUtils` + react-hook-form
- **Don't use `revalidatePath` / `revalidateTag`** — SWR `mutate()` handles client cache
- **Don't add `getServerSideProps` / `getStaticProps`** without team approval — the dominant pattern is client-side SWR

### Auth & security

- **Don't store JWT tokens in localStorage** — tokens live in iron-session server-side; client `AuthContext` holds user profile only
- **Don't bypass `withAuth`** for protected pages — it enforces authentication and role-based access
- **Don't create `middleware.ts`** expecting it to protect routes — auth is client-side (`withAuth`) + server-side (API route session checks)
- **Don't skip `ALLOWED_ROLES` check** when adding auth endpoints — login handler already enforces this
- **Don't expose `accessToken`/`refreshToken` in API responses** — login handler returns user data only; tokens stay in session

### UI & dependencies

- **Don't add shadcn/ui or Tailwind** — use MUI v5 + Emotion (`sx` prop, `styled()`)
- **Don't create `components/ui/`** — use `src/components/common/` primitives
- **Don't mix UI libraries** — the design system is Material-UI with custom theme in `src/theme/`

### Rendering & data fetching

- **Don't assume Server Components or `'use client'`** — all pages are client-rendered Pages Router components
- **Don't use `useEffect` for initial data fetching in new code** when SWR/`useApi` is appropriate — prefer domain hooks
- **Don't fetch data in API routes from the client bypassing services** — keep the service → hook → component layering

### Code quality

- **Don't use `any` for new code** — define interfaces in `src/types/` or co-located with features (legacy code has `as any` in `withAuth` — don't spread)
- **Don't hardcode API URLs** — use `/api/*` on client, `process.env.BACKEND_URL` on server
- **Don't ignore TypeScript errors broadly** — `strict: false` is legacy; new code should be properly typed

### AI-specific pitfalls

- **Don't copy patterns from `black-void`** — it uses App Router, Tailwind, next-intl, and different auth (httpOnly JWT cookies + proxy.ts)
- **Don't create an `app/` directory** thinking this is App Router — routes go in `pages/`
- **Don't add `error.tsx` / `loading.tsx`** — use existing 404/unauthorized pages, toast, and hook loading states
- **Don't assume middleware protects routes** — no middleware file exists; use `withAuth` + API session checks
- **Don't use `next/navigation` for new pages** — use `next/router` (`useRouter`, `router.query`). Legacy pages import `useSearchParams` from `next/navigation` in a Pages Router app — do not extend that pattern
- **Don't "modernize" to App Router / Server Actions / RSC** when implementing features — the project is intentionally Pages Router + client SWR BFF
- **Don't treat HTTP 200 as business success blindly** — check `statusCode === 0` (or the shape in the matching `src/types/` file) before using `response.body`
- **Don't use 1-based pagination** — pass `page: 0` for the first page; grep sibling hooks/pages for the filter shape
- **Don't add a dashboard page without updating the sidebar** — register new nav items in `src/layouts/dashboard/drawer-content/index.tsx` (`menuItems` array), not only in `withAuth`
- **Don't skip the service + hook + types trio** when adding a new API route — a bare `pages/api/*` file with inline `fetch` in a component breaks the established layering
- **Don't rely on CI to catch test/lint failures** — GitHub Actions only builds and pushes Docker images on merged PRs; run `npm test` and `npm run build` locally

---

## 8. Entity Relationships

> Domain models live in the **external backend API**, not in this repo. Types are defined in `src/types/` based on API responses. Below is the ticketing domain cheat sheet.

```
User (1) ──< (0..1) EventOrganizer          # via user_id; PIC role loads organizer profile
EventOrganizer (1) ──< (N) Event            # eventOrganizerId
EventOrganizer (1) ──< (N) Staff            # team members with roles (ground_staff, finance, cashier)
EventOrganizer (1) ──< (N) Partner          # event_organizer_id
EventOrganizer (1) ──> (1) BankInformation ──> Bank

Event (N) ──> (1) City                      # cityId / city
Event (N) ──< (N) PaymentMethod             # paymentMethodIds (M2M)
Event (1) ──< (N) TicketType                # event_id
Event (1) ──< (N) GroupTicket               # ticket_type_id → TicketType
Event (1) ──< (N) EventAsset ──> Asset      # images/media for event
Event (1) ──< (N) EventAssetChange          # pending asset change approvals
Event (1) ──< (N) Invitation                # ticket_type_id, email/phone recipients
Event (1) ──< (N) Transaction               # purchases
Event (1) ──< (N) WithdrawalSummary         # finance settlement per event
Event (1) ──< (N) Discount                  # promo codes
Event (1) ──< (1) OTSApproval               # on-the-spot sales enablement request

TicketType (1) ──< (N) AdditionalForm       # custom attendee fields (field, type, isRequired, order)
TicketType (1) ──< (N) Ticket               # issued tickets
TicketType (0..1) ── PartnershipInfo        # partner ticket private links

GroupTicket (N) ──> (1) TicketType          # bundle: bundle_quantity at bundle price

Transaction (1) ──> (1) PaymentMethod
Transaction (1) ──> (1) Event
Transaction (0..1) ──> TicketType             # single ticket purchase
Transaction (0..1) ──> GroupTicket            # group/bundle purchase
Transaction (1) ──< (N) Ticket                # transaction_id
Transaction (1) ──> PaymentDetails            # VirtualAccount and/or QrisPayment

Ticket (1) ──< (N) AttendeeAdditionalData     # answers to additional forms

Partner (1) ──< (N) PartnerTicketType         # partner-specific ticket pricing/links

EventSubmission (approval queue)
  ├── type: 'new' | 'update'
  ├── event: EventSubmissionEvent
  └── eventUpdateRequest?: EventUpdateRequest  # pending field changes

Withdrawal
  ├── eventId → Event
  ├── eventOrganizerId → EventOrganizer
  └── status: pending | approved | rejected

User roles (access control)
  ├── admin, business_development     → full access
  ├── event_organizer_pic             → organizer-scoped (own EO data)
  ├── ground_staff                    → events (read) + tickets
  ├── finance                         → events (read) + finance/withdrawals
  └── cashier                         → OTS (on-the-spot sales) + tickets
```

### Key domain types by file

| File | Main entities |
|---|---|
| `src/types/event.ts` | `Event`, `EventDetail`, `TicketType`, `GroupTicket`, `EventAsset`, `Invitation`, `OTSApproval` |
| `src/types/organizer.ts` | `EventOrganizer`, `BankInformation`, `EventOrganizerStatistics` |
| `src/types/ticket.ts` | `Ticket`, `AttendeeAdditionalData`, `TicketInvitation` |
| `src/types/transaction.ts` | `Transaction`, `PaymentMethod`, `PaymentDetails`, `ExportTransactionData` |
| `src/types/events-submission.ts` | `EventSubmission`, `EventUpdateRequest` |
| `src/types/auth.ts` | `User`, `AuthUser`, `UserRole`, `ALLOWED_ROLES` |
| `src/types/staff.ts` | `Staff`, `CreateStaffRequest` |
| `src/types/ots.ts` | `OTSSummaryData`, `OTSTransaction` |

### Event lifecycle statuses

Events progress through statuses tracked in `EventCountByStatus`: `draft`, `onReview`, `approved`, `onGoing`, `done`, `rejected`. Ticket types and group tickets have their own approval statuses (`pending`, `approved`, `rejected`).
