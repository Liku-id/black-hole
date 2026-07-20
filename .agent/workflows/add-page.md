---
description: Add a new route in black-hole — pages/ folder setup, page component, Head metadata, withAuth, DashboardLayout, and data hooks.
---

# /add-page — Add a New Route

Use this workflow when adding a dashboard, auth, or feature page under the **Pages Router**.

> ⚠️ **This project uses `pages/`, not `app/`.** There is no `page.tsx`, Metadata API, `error.tsx`, or `loading.tsx`. Pages are client-rendered React components with optional `next/dynamic` code splitting.

> **Reference:** `.gemini/rules.md` §2 (structure), §3 (rendering), §4 (naming)

---

## 0. Decide route placement

| URL you want | Create under |
|---|---|
| `/dashboard` | `pages/dashboard/index.tsx` |
| `/events` (list) | `pages/events/index.tsx` |
| `/events/my-event` (detail) | `pages/events/[metaUrl]/index.tsx` |
| `/finance/withdrawal/foo` | `pages/finance/withdrawal/[metaUrl]/index.tsx` |
| `/login`, `/register` | `pages/login/index.tsx`, `pages/register/index.tsx` |
| `/ots` (cashier) | `pages/ots/index.tsx` |

- Folder name: **kebab-case** (`forgot-password`, `group-tickets`, not `forgotPassword`)
- Dynamic segments: **bracket notation** — `[metaUrl]`, `[id]`, `[eventId]`
- File name is always **`index.tsx`** inside the folder (maps to the folder URL)
- API route files are often **single `.ts` files** (e.g. `pages/api/auth/login.ts`), not always `index.ts` — mirror sibling routes in the same folder

### Root URL note

`next.config.js` redirects `/` → `/register`, but `pages/index.tsx` also performs role-based redirects after `AuthContext` loads. Do not add a competing redirect without checking both files.

### Auth & role access (if needed)

Protected dashboard pages use the **`withAuth` HOC** — not middleware (no `middleware.ts` exists).

| Role | Allowed routes (enforced in `src/components/Auth/withAuth.tsx`) |
|---|---|
| `admin`, `business_development`, `event_organizer_pic` | Full dashboard |
| `ground_staff` | `/events`, `/tickets` (blocks `/events/create`) |
| `finance` | `/events`, `/finance` (blocks `/events/create`) |
| `cashier` | `/ots`, `/tickets`, `/account` |

If adding a route restricted to certain roles, update role checks in `src/components/Auth/withAuth.tsx`.

For new sidebar navigation items, add an entry to the `menuItems` array in `src/layouts/dashboard/drawer-content/index.tsx` (role visibility is filtered in the same file). The `MenuList` component in `menu.tsx` only renders items — it does not define routes.

---

## 1. Create the folder & files

**Standard dashboard page:**

```
pages/my-feature/
└── index.tsx
```

**Dynamic route:**

```
pages/events/[metaUrl]/my-section/
└── index.tsx
```

**Interactive page with heavy sections** — split feature UI into `src/components/features/`:

```
pages/my-feature/
└── index.tsx

src/components/features/my-feature/
├── index.tsx              # Main feature UI
└── index.test.tsx         # optional
```

---

## 2. Implement the page component

### Pattern A — Standard protected dashboard page

Reference: `pages/dashboard/index.tsx`, `pages/events/index.tsx`

```tsx
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';

const MyFeatureContent = dynamic(
  () => import('@/components/features/my-feature')
);

function MyFeaturePage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Wukong Creator - My Feature</title>
      </Head>
      <MyFeatureContent />
    </DashboardLayout>
  );
}

export default withAuth(MyFeaturePage, { requireAuth: true });
```

### Pattern B — Page with data fetching via domain hook

Reference: `pages/events/index.tsx`

```tsx
import { Box, CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useAtom } from 'jotai';

import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { H2, Body1 } from '@/components/common';
import { useMyFeature } from '@/hooks'; // add export in src/hooks/index.ts
import DashboardLayout from '@/layouts/dashboard';

function MyFeaturePage() {
  const [selectedEventOrganizerId] = useAtom(selectedEOIdAtom);
  const { data, loading, error, mutate } = useMyFeature({
    event_organizer_id: selectedEventOrganizerId
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Wukong Creator - My Feature</title>
      </Head>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && <Body1 color="error">{error}</Body1>}

      {!loading && !error && (
        <>
          <H2>My Feature</H2>
          {/* render data */}
        </>
      )}
    </DashboardLayout>
  );
}

export default withAuth(MyFeaturePage, { requireAuth: true });
```

### Pattern C — Auth page (login/register — no DashboardLayout)

Reference: `pages/login/index.tsx`

```tsx
import Head from 'next/head';

import { withAuth } from '@/components/Auth/withAuth';
import LoginForm from '@/components/Auth/LoginForm';

function LoginPage() {
  return (
    <>
      <Head>
        <title>Wukong Creator - Login</title>
      </Head>
      <LoginForm />
    </>
  );
}

// requireAuth: false → redirects authenticated users away
export default withAuth(LoginPage, { requireAuth: false });
```

### Pattern D — Dynamic route with `router.query`

Reference: `pages/events/[metaUrl]/index.tsx`

```tsx
import Head from 'next/head';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function EventDetailPage() {
  const router = useRouter();
  const { metaUrl } = router.query;

  const { event, loading, error } = useEventDetail(
    typeof metaUrl === 'string' ? metaUrl : undefined
  );

  // Wait for router hydration before rendering dynamic content
  if (!router.isReady || !metaUrl) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>Wukong Creator - {event?.name ?? 'Event'}</title>
      </Head>
      {/* … */}
    </DashboardLayout>
  );
}

export default withAuth(EventDetailPage, { requireAuth: true });
```

---

## 3. Page title & metadata (replaces Metadata API)

This project uses **`next/head`** — not `export const metadata` or `generateMetadata`.

| Scenario | Approach |
|---|---|
| Static title | `<Head><title>Wukong Creator - Page Name</title></Head>` |
| Dynamic title (entity name) | Interpolate from hook data: `{event?.name}` |
| SEO meta description | Add `<meta name="description" content="…" />` inside `<Head>` if needed |

Reference: `pages/dashboard/index.tsx`, `pages/events/index.tsx`

> Dashboard pages are behind auth — SEO metadata is rarely needed. Focus on the `<title>` for browser tab identification.

---

## 4. Loading & error states (replaces Suspense / loading.tsx)

This project **does not** use route-level `loading.tsx` or App Router Suspense boundaries.

### Data loading

Use states from `useApi` / domain hooks:

```tsx
const { data, loading, error } = useMyFeature();

if (loading) return <CircularProgress />;
if (error) return <Body1 color="error">{error}</Body1>;
```

### Auth loading

`withAuth` shows a full-screen `CircularProgress` while `AuthContext` restores session.

### Code splitting

Use `next/dynamic` for heavy feature sections (no Suspense wrapper required):

```tsx
const HeavySection = dynamic(
  () => import('@/components/features/my-feature/heavy-section')
);
```

### User feedback on mutations

Use `useToast()` from `@/contexts/ToastContext`:

```tsx
const { showSuccess, showError } = useToast();
```

---

## 5. Wire up supporting files

### BFF API route (if page needs new data)

1. Create `pages/api/my-feature/index.ts` (see `/add-action` workflow)
2. Add service method in `src/services/my-feature/index.ts`
3. Add types in `src/types/my-feature.ts`
4. Add hook in `src/hooks/features/my-feature/useMyFeature.ts`
5. Export hook from `src/hooks/index.ts`

### Event organizer scoping (admin pages)

Read `selectedEOIdAtom` from `@/atoms/eventOrganizerAtom` and pass as `event_organizer_id` filter — reference `pages/events/index.tsx`.

### Navigation

Use `next/router` — **not** `next/navigation` for new code:

```tsx
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/events');
router.push(`/events/${metaUrl}`);
const status = router.query.status; // query params
```

> Legacy pages (`pages/events/index.tsx`, `pages/tickets/index.tsx`) import `useSearchParams` from `next/navigation` inside a Pages Router app. Do not copy that pattern — it is inconsistent and can confuse agents.

---

## 6. Add tests

Co-locate next to the page or feature component:

```tsx
// src/components/features/my-feature/index.test.tsx
import { render, screen } from '@testing-library/react';

// Mock useAuth, useRouter, SWR hooks as needed
describe('MyFeature', () => {
  it('renders heading', () => {
    // …
  });
});
```

Reference existing tests: `src/components/features/events/list/table/index.test.tsx`

---

## 7. Verify

```bash
npm run dev
# Visit http://localhost:3000/my-feature

npm test -- src/components/features/my-feature/index.test.tsx
npm run build
```

Checklist:

- [ ] Page file is `pages/<kebab-case>/index.tsx` (not `app/`)
- [ ] Protected page wrapped with `withAuth(Component, { requireAuth: true })`
- [ ] Dashboard pages use `<DashboardLayout>` + `<Head><title>…</title></Head>`
- [ ] Data fetched via domain hooks (`useApi` / SWR), not direct `BACKEND_URL` calls
- [ ] Loading/error states handled inline (no `loading.tsx`)
- [ ] Role restrictions updated in `withAuth` if route is role-specific
- [ ] New nav item added to `menuItems` in `src/layouts/dashboard/drawer-content/index.tsx`
- [ ] Admin EO filter uses `selectedEOIdAtom` when applicable
- [ ] New hook exported from `src/hooks/index.ts`
- [ ] `npm run build` passes locally (CI does not run build on PR)
