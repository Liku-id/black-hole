---
description: Add a mutation in black-hole — BFF API route in pages/api/, iron-session auth, validationUtils, error handling, and SWR mutate refresh.
---

# /add-action — Add a Mutation (API Route)

Use this workflow when adding a **write operation** (create, update, delete) to the dashboard.

> ⚠️ **This project does NOT use Server Actions, Zod, or `revalidatePath`.**
> Mutations are implemented as **API routes** in `pages/api/` that proxy to `BACKEND_URL`. Client cache is refreshed with **SWR `mutate()`**, not Next.js cache revalidation.

> ⚠️ **No middleware exists.** API routes authenticate via **iron-session** (`getSession` + `Authorization: Bearer` forwarding in `apiRouteUtils`).

> **Reference:** `.gemini/rules.md` §5 (data fetching), §6 (error handling)

---

## Architecture overview

```
Client form / button
  → apiUtils.post('/api/my-action')   (axios, withCredentials: true)
    → pages/api/my-action.ts          (NextApiHandler)
      → apiRouteUtils.createPostHandler
        → axios POST ${BACKEND_URL}/my-action
          (Authorization: Bearer <accessToken> from iron-session)
            → External backend API
```

Optional layers:

```
Component → custom mutation hook (src/hooks/features/…) → service (src/services/…) → apiUtils → /api/*
```

---

## 1. Choose the API path

| Backend endpoint | API route file | Factory method |
|---|---|---|
| `GET /events` | `pages/api/events/index.ts` | `createGetHandler` |
| `POST /orders` | `pages/api/order/create.ts` | `createPostHandler` |
| `PUT /events/:id` | `pages/api/events/[metaUrl]/index.ts` | `createPutHandler` |
| `PATCH /ticket-types/visibility` | `pages/api/tickets/ticket-types/visibility.ts` | `createPatchHandler` |
| `DELETE /partners/:id` | `pages/api/partners/[id].ts` | `createDeleteHandler` |
| `POST /auth/login` | `pages/api/auth/login.ts` | `createLoginHandler` |
| CSV export | `pages/api/tickets-export/index.ts` | `createExportHandler` |

Naming: **kebab-case** folders mirroring REST resource paths.

Examples in this repo:

- `pages/api/events/index.ts` → `GET ${BACKEND_URL}/events`
- `pages/api/auth/login.ts` → `POST ${BACKEND_URL}/auth/login` + iron-session (single file, not `index.ts`)
- `pages/api/event-organizers/staff/index.ts` → `POST ${BACKEND_URL}/…`
- `pages/api/order/create.ts` → custom pre-processing + `createPostHandler`
- `pages/api/upload-asset.ts` → custom validation (blocks SVG) then `createPostHandler`

### Service folder vs API path

| Client service folder | API route prefix |
|---|---|
| `src/services/event-organizer/` (singular) | `/api/event-organizers/*` (plural) |
| `src/services/events/` | `/api/events/*` |
| `src/services/auth/` | `/api/auth/*` |

Mirror an existing domain's trio: **types** → **service** → **hook** → **page**.

---

## 2. Create the API route

### Simple proxy (preferred when no custom logic needed)

Reference: `pages/api/events/index.ts`

```ts
// pages/api/my-resource/index.ts
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/my-resource',
  timeout: 30000
});
```

Set `requireAuth: false` only for public endpoints (login, OTP):

```ts
export default apiRouteUtils.createPostHandler({
  endpoint: '/auth/otp/request',
  requireAuth: false
});
```

### Dynamic route with path param

Reference: `pages/api/events/[metaUrl]/index.ts`

```ts
import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { metaUrl } = req.query;

  if (req.method === 'GET') {
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/events/${metaUrl}`,
      timeout: 30000
    });
    return getHandler(req, res);
  }

  if (req.method === 'PUT') {
    const putHandler = apiRouteUtils.createPutHandler({
      endpoint: `/events/${metaUrl}`,
      timeout: 30000
    });
    return putHandler(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
```

### Custom pre/post processing

Reference: `pages/api/order/create.ts`

```ts
import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession } from '@/lib/sessionHelpers';
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession(req, res);

    // Transform req.body before proxying
    const body = req.body;
    if (!body.requiredField) {
      return res.status(400).json({ message: 'requiredField is required' });
    }

    req.body = {
      ...body,
      cashierId: session?.user?.id
    };
  } catch (error) {
    console.error('[ERROR] Custom handler failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/my-resource',
    timeout: 30000
  });

  return postHandler(req, res);
}
```

### Auth-aware login handler

Reference: `pages/api/auth/login.ts`

```ts
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createLoginHandler({
  endpoint: '/auth/login',
  timeout: 30000
});
```

`createLoginHandler` automatically:
- Calls backend login
- Checks `ALLOWED_ROLES` from `src/types/auth.ts`
- Stores `user`, `accessToken`, `refreshToken` in iron-session
- Returns user data only (no tokens in response)

---

## 3. Request validation (replaces Zod)

**Do not add Zod** unless the team adopts it project-wide.

### Server-side (API route)

Manual guards before calling `apiRouteUtils`:

```ts
if (!req.body.eventId) {
  return res.status(400).json({ message: 'eventId is required' });
}
```

Define TypeScript interfaces in `src/types/` or at the top of the route file:

```ts
// src/types/my-feature.ts
export interface CreateMyResourceRequest {
  eventId: string;
  name: string;
  quantity: number;
}
```

### Client-side (forms)

Use **react-hook-form** + validators from `src/utils/validationUtils.ts`:

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { validationUtils } from '@/utils';

const methods = useForm<FormData>({ mode: 'onChange' });

// In TextField:
rules={{ validate: validationUtils.emailValidator }}
```

Reference: `src/components/Auth/LoginForm.tsx`, `src/components/features/account/general-form/edit.tsx`

Available validators: `emailValidator`, `passwordValidator`, `phoneNumberValidator`, `organizerNameValidator`, `confirmPasswordValidator`, `isValidNIK`, `isValidNPWP`.

---

## 4. Error handling (try/catch pattern)

### API route errors

`apiRouteUtils` handlers catch axios errors automatically:

```ts
// Backend error → res.status(error.response.status).json(error.response.data)
// Unknown error  → res.status(500).json({ message: 'Internal server error' })
```

For custom handlers, follow the same pattern:

```ts
try {
  // business logic
  return res.status(200).json({ statusCode: 0, message: 'OK', body: data });
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({ message: 'Internal server error' });
}
```

Backend error shape (typical):

```json
{ "message": "Human-readable error", "code": 400 }
```

### Client-side error display

`apiUtils.handleAxiosError` extracts `data.message`:

```tsx
import { useToast } from '@/contexts/ToastContext';

const { showError, showSuccess } = useToast();

try {
  await myFeatureService.create(payload);
  showSuccess('Created successfully');
} catch (err) {
  showError(err instanceof Error ? err.message : 'Request failed');
}
```

401 errors trigger automatic token refresh via `apiUtils.makeRequest` → `/api/auth/refresh-token`. On refresh failure, session is cleared and user is redirected to `/login`.

---

## 5. Cache refresh (replaces revalidatePath)

No server-side cache revalidation exists. After a successful mutation:

### Option A — SWR mutate from hook (preferred)

```tsx
const { data, mutate } = useMyFeature();

await myFeatureService.create(payload);
mutate(); // revalidate the SWR key
```

### Option B — `useSWRConfig` for broader invalidation

```tsx
import { useSWRConfig } from 'swr';

const { mutate } = useSWRConfig();
await myFeatureService.create(payload);
await mutate((key) => Array.isArray(key) && key[0] === '/api/events');
```

### Option C — Redirect to fresh page

```tsx
const router = useRouter();
await eventsService.createEvent(payload);
router.push(`/events/create/${metaUrl}/ticket`);
```

### Option D — Logout clears all SWR cache

Reference: `src/contexts/AuthContext.tsx` — `mutate(() => true, undefined, { revalidate: false })`

---

## 6. Service & hook layers

### Service (client → /api/*)

Reference: `src/services/events/index.ts`

```ts
// src/services/my-feature/index.ts
import { CreateMyResourceRequest } from '@/types/my-feature';
import { apiUtils } from '@/utils/apiUtils';

class MyFeatureService {
  async create(data: CreateMyResourceRequest) {
    return apiUtils.post('/api/my-feature', data, 'Failed to create resource');
  }

  async getList(filters?: Record<string, string>) {
    return apiUtils.get('/api/my-feature', filters, 'Failed to fetch resources');
  }
}

export const myFeatureService = new MyFeatureService();
```

Export from `src/services/index.ts`:

```ts
export { myFeatureService } from './my-feature';
```

### Read hook (SWR)

Reference: `src/hooks/features/events/useEvents.ts`

```ts
// src/hooks/features/my-feature/useMyFeature.ts
import { myFeatureService } from '@/services/my-feature';
import { useApi } from '../../useApi';

export const useMyFeature = (filters?: Record<string, string>) => {
  const { data, loading, error, mutate } = useApi(
    ['/api/my-feature', filters],
    () => myFeatureService.getList(filters)
  );

  return { data: data?.body?.data ?? [], loading, error, mutate };
};
```

### Mutation hook (manual state)

Reference: `src/hooks/features/organizers/useUpdateEventOrganizerGeneral.ts`

```ts
// src/hooks/features/my-feature/useCreateMyResource.ts
import { useState } from 'react';
import { myFeatureService } from '@/services/my-feature';
import { CreateMyResourceRequest } from '@/types/my-feature';

export const useCreateMyResource = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (payload: CreateMyResourceRequest) => {
    setIsPending(true);
    setError(null);
    try {
      return await myFeatureService.create(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create';
      setError(msg);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};
```

Export from `src/hooks/index.ts`.

### Check business success in mutation handlers

Many backend responses use `statusCode: 0` for success (not `200`):

```tsx
const response = await eventsService.submitEvent(metaUrl);
if (response.statusCode === 0) {
  showSuccess(response.message);
  mutate();
}
```

Reference: `src/contexts/AuthContext.tsx` (`meResponse.statusCode === 0 && meResponse.body`).

### Pagination in list filters

Use **0-indexed** pages when passing filters to services/hooks:

```tsx
const [filters, setFilters] = useState({ show: 10, page: 0, name: '' });
```

---

## 7. Wire up the UI

### Form submission

Reference: `src/components/Auth/LoginForm.tsx`

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { Button, TextField } from '@/components/common';

const MyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { showSuccess, showError } = useToast();
  const { mutate, isPending } = useCreateMyResource();
  const methods = useForm<FormData>({ mode: 'onChange' });

  const onSubmit = async (data: FormData) => {
    try {
      await mutate(data);
      showSuccess('Saved successfully');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <TextField name="name" label="Name" />
        <Button type="submit" disabled={isPending}>Save</Button>
      </form>
    </FormProvider>
  );
};
```

### Non-form action (button click)

```tsx
const { showSuccess, showError } = useToast();
const { mutate: refetch } = useMyFeature();

const handleDelete = async (id: string) => {
  try {
    await myFeatureService.delete(id);
    showSuccess('Deleted');
    refetch();
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Delete failed');
  }
};
```

---

## 8. Add tests

Reference: `src/services/auth/index.test.ts`, `src/components/Auth/LoginForm.test.tsx`

```ts
// src/services/my-feature/index.test.ts
import { myFeatureService } from './index';
import { apiUtils } from '@/utils/apiUtils';

jest.mock('@/utils/apiUtils');

describe('MyFeatureService', () => {
  it('calls POST /api/my-feature', async () => {
    (apiUtils.post as jest.Mock).mockResolvedValue({ statusCode: 0, body: { id: '1' } });
    await myFeatureService.create({ eventId: 'e1', name: 'Test', quantity: 1 });
    expect(apiUtils.post).toHaveBeenCalledWith('/api/my-feature', expect.any(Object), expect.any(String));
  });
});
```

Run: `npm test -- src/services/my-feature/index.test.ts`

---

## 9. Verify

```bash
# Ensure BACKEND_URL and SECRET_COOKIE_PASSWORD are set in .env.local

# Dev — test the route (with session cookie after login)
curl -X POST http://localhost:3000/api/my-feature \
  -H "Content-Type: application/json" \
  -H "Cookie: black-hole-session=…" \
  -d '{"eventId":"…","name":"Test"}'

npm test -- src/services/my-feature/index.test.ts
npm run build
```

Checklist:

- [ ] API route in `pages/api/`, not a Server Action
- [ ] Uses `apiRouteUtils` factory when possible; custom logic only when needed
- [ ] `requireAuth` set correctly (`false` only for public endpoints)
- [ ] Input validated manually or via `validationUtils` (no Zod unless team adopts)
- [ ] iron-session auth forwarded via `apiRouteUtils` (Bearer token from session)
- [ ] Service method added in `src/services/` calling `/api/*` via `apiUtils`
- [ ] Types defined in `src/types/`
- [ ] Hook exported from `src/hooks/index.ts`
- [ ] Success checked via `statusCode === 0` (or matching type) — not HTTP status alone
- [ ] List filters use `page: 0` for first page
- [ ] Client refreshes data via SWR `mutate()` or redirect (no `revalidatePath`)
- [ ] Errors surfaced via `useToast` or hook `error` state
- [ ] `SECRET_COOKIE_PASSWORD` (≥32 chars) and `BACKEND_URL` set in `.env.local`
- [ ] Co-located test passes; `npm run build` passes locally
