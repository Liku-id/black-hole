---
description: Debug API errors in black-hole — trace from client through pages/api BFF routes to the external backend (no local database).
---

# /debug-api — Debug API Errors

Use this workflow when a `/api/*` call fails, returns unexpected data, or auth breaks mid-request.

> **This project has no local database.** The stack is:
>
> `Client (SWR / apiUtils via axios)` → `pages/api/*` (NextApiHandler) → `axios` → **`${BACKEND_URL}/endpoint`**
>
> Auth: iron-session cookie `black-hole-session` → `accessToken` forwarded as `Authorization: Bearer`

> ⚠️ **No middleware exists.** Route protection is client-side (`withAuth`) + server-side (API route session checks via `apiRouteUtils`).

> **Reference:** `.gemini/rules.md` §5–§6, `src/utils/apiUtils.ts`, `src/utils/apiRouteUtils.ts`

---

## 1. Identify the failing layer

| Symptom | Likely layer | Where to look |
|---|---|---|
| Network error in DevTools on `/api/…` | BFF API route | `pages/api/<path>.ts` |
| 401 on `/api/*` | iron-session missing/expired | `src/lib/sessionHelpers.ts`, login flow |
| 401 → redirect to `/login` | Client token refresh failed | `src/utils/apiUtils.ts` → `clearExpiredSession()` |
| Redirect to `/login?redirect=…` | `withAuth` HOC | `src/components/Auth/withAuth.tsx` |
| Role-based redirect (e.g. cashier → `/ots`) | `withAuth` role checks | `src/components/Auth/withAuth.tsx` |
| `{ message, code }` JSON error | Backend rejected request | `BACKEND_URL` endpoint + payload |
| SWR shows stale/empty data | Client cache / response shape | Hook destructuring vs API response |
| `Authentication required` (401) | API route session check | `apiRouteUtils` → `getSession` + `isAuthenticated` |
| Empty UI despite HTTP 200 | Wrong `statusCode` check | Body may require `statusCode === 0` — see `AuthContext` |
| `page: 1` returns wrong slice | Pagination convention | First page is `page: 0` |

---

## 2. Trace from the browser (top-down)

### Step 2a — Find the client call site

Search for the API path:

```bash
rg "/api/my-endpoint" src/ pages/
```

Common call patterns:

| Pattern | File example |
|---|---|
| SWR via `useApi` | `src/hooks/features/events/useEvents.ts` |
| Service → `apiUtils` | `src/services/events/index.ts` |
| Direct `apiUtils` | `src/contexts/AuthContext.tsx` |
| Auth service | `src/services/auth/index.ts` |

### Step 2b — Inspect the network request

In browser DevTools → Network:

1. Confirm request URL is `/api/…` (not `BACKEND_URL`)
2. Confirm **cookies** are sent (`black-hole-session` — `withCredentials: true` in `apiUtils`)
3. Check **Request payload** matches what the API route expects
4. Check **Response** body shape:

```json
// Success (typical backend proxy)
{ "statusCode": 0, "message": "OK", "body": { … } }

// Alternate key casing (check src/types/ for which applies)
{ "status_code": 0, "message": "OK", "body": { … } }

// Or list shape
{ "message": "OK", "body": { "data": […], "pagination": { … } } }

// Error (from apiRouteUtils)
{ "message": "Human-readable error" }

// Auth error
{ "message": "Authentication required" }
```

> **Common false negative:** HTTP status `200` with a non-zero `statusCode` in the JSON body means business failure. Always inspect the body, not just the HTTP status.

### Step 2c — Client error extraction

`apiUtils.handleAxiosError` reads `error.response.data.message`:

```ts
// Thrown as: new Error(errorMessage)
// Catch in component:
catch (err) {
  showError(err instanceof Error ? err.message : 'Request failed');
}
```

Reference: `src/contexts/AuthContext.tsx`, `src/components/Auth/LoginForm.tsx`

---

## 3. Trace the service layer

### Step 3a — Open the matching service

Map feature → service file:

| Feature | Service file |
|---|---|
| Events | `src/services/events/index.ts` |
| Tickets | `src/services/tickets/index.ts` |
| Auth | `src/services/auth/index.ts` |
| Transactions | `src/services/transactions/index.ts` |
| Withdrawals | `src/services/withdrawal/index.ts` |
| Event organizer | `src/services/event-organizer/index.ts` |
| Partners | `src/services/partners/index.ts` |

### Step 3b — Verify service → API mapping

```ts
// Service calls apiUtils with /api/* path:
return apiUtils.get('/api/events', params, 'Failed to fetch events');
return apiUtils.post('/api/my-action', body, 'Failed to create');
```

Check:

- [ ] Correct HTTP method (`get`, `post`, `put`, `patch`, `delete`)
- [ ] Query params match what the API route expects
- [ ] Request body shape matches backend contract (check `src/types/`)
- [ ] Error message string is meaningful

### Step 3c — Trace the hook (if used)

```ts
// src/hooks/features/events/useEvents.ts
const { data, loading, error, mutate } = useApi(
  ['/api/events', filters],
  () => eventsService.getEvents(filters)
);

// Returned shape:
return {
  events: data?.body?.data || [],
  pagination: data?.body?.pagination
};
```

Common hook bugs:

| Problem | Cause |
|---|---|
| Always empty array | Wrong destructuring path (`data?.body?.data` vs `data?.transactions`) |
| Hook never fires | SWR key is `null` or filters undefined |
| Stale after mutation | Missing `mutate()` call after POST/PUT/DELETE |

---

## 4. Trace the API route (BFF layer)

### Step 4a — Map URL → file

| Request URL | API route file |
|---|---|
| `GET /api/events` | `pages/api/events/index.ts` |
| `GET /api/events/[metaUrl]` | `pages/api/events/[metaUrl]/index.ts` |
| `POST /api/auth/login` | `pages/api/auth/login.ts` |
| `GET /api/auth/me` | `pages/api/auth/me.ts` |
| `POST /api/auth/refresh-token` | `pages/api/auth/refresh-token.ts` |
| `GET /api/auth/session` | `pages/api/auth/session.ts` |
| `POST /api/order/create` | `pages/api/order/create.ts` |

### Step 4b — Check the handler

Simple proxy routes use `apiRouteUtils` factories:

```ts
export default apiRouteUtils.createGetHandler({
  endpoint: '/events',
  timeout: 30000
  // requireAuth: true  ← default
});
```

`apiRouteUtils` automatically:

1. Reads iron-session via `getSession(req, res)`
2. Checks `isAuthenticated(session)` (requires `accessToken` + `user`)
3. Sets `Authorization: Bearer ${session.accessToken}`
4. Proxies to `${BACKEND_URL}${endpoint}`
5. Forwards backend errors: `res.status(error.response.status).json(error.response.data)`

Verify:

- [ ] Correct factory method (`createGetHandler`, `createPostHandler`, etc.)
- [ ] `endpoint` path matches backend API
- [ ] `requireAuth: false` only for public routes (login, OTP)
- [ ] Custom handlers transform `req.body` correctly before delegating
- [ ] Dynamic routes interpolate `req.query` params into endpoint

### Step 4c — Test the API route in isolation

```bash
# Check session endpoint (no auth needed for read)
curl -v http://localhost:3000/api/auth/session \
  -H "Cookie: black-hole-session=YOUR_SESSION_COOKIE"

# Authenticated request (after logging in via browser, copy cookie from DevTools)
curl -v http://localhost:3000/api/events \
  -H "Cookie: black-hole-session=YOUR_SESSION_COOKIE"
```

Or run service tests:

```bash
npm test -- src/services/events/index.test.ts
```

---

## 5. Trace to the backend (final hop)

### Step 5a — Check environment variables

Required in `.env.local`:

```
BACKEND_URL=https://your-backend-api.example.com
SECRET_COOKIE_PASSWORD=your-32-char-minimum-secret
```

If `BACKEND_URL` is unset, API routes return 500 or fail silently.

### Step 5b — Identify the backend endpoint

In the API route, find the proxied endpoint:

```ts
// apiRouteUtils builds: `${process.env.BACKEND_URL}${options.endpoint}`
endpoint: '/events'           // → ${BACKEND_URL}/events
endpoint: '/auth/login'       // → ${BACKEND_URL}/auth/login
endpoint: `/events/${metaUrl}` // → ${BACKEND_URL}/events/:metaUrl
```

There is **no ORM or local service layer** — this is the final hop.

### Step 5c — Reproduce against backend directly

```bash
# Get accessToken from iron-session (login first) or backend login endpoint
curl -v "${BACKEND_URL}/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Compare backend response with what the API route returns to the client.

---

## 6. Debug auth failures

Auth spans three layers — check in order:

### 6a — `withAuth` HOC (page routes only)

Reference: `src/components/Auth/withAuth.tsx`

- Is `AuthContext.isAuthenticated` true?
- Is `AuthContext.isLoading` stuck true? (session restore failed)
- Does user role match allowed routes?
- Check browser URL against role restrictions (cashier → `/ots` only, etc.)

### 6b — `AuthContext` session restore

Reference: `src/contexts/AuthContext.tsx`

On app load:

1. `GET /api/auth/session` → checks iron-session
2. Validates `ALLOWED_ROLES`
3. `GET /api/auth/me` or `GET /api/event-organizers/me` (for PIC role)
4. Dispatches `RESTORE_SESSION` or `SESSION_RESTORED`

Common failures:

| Issue | Fix |
|---|---|
| Session exists but user is null | Login didn't call `session.save()` |
| Role blocked | User role not in `ALLOWED_ROLES` |
| PIC data fails | Falls back to `/api/auth/me` |

### 6c — API route session (required for `/api/*` auth)

`apiRouteUtils` reads iron-session:

```ts
const session = await getSession(req, res);
if (isAuthenticated(session) && session.accessToken) {
  headers.Authorization = `Bearer ${session.accessToken}`;
} else {
  return res.status(401).json({ message: 'Authentication required' });
}
```

`isAuthenticated` requires: `session.isLoggedIn && session.user && session.accessToken`

Check:

- [ ] `SECRET_COOKIE_PASSWORD` is set and consistent
- [ ] Cookie `black-hole-session` is present in request (httpOnly, `sameSite: 'lax'`)
- [ ] `apiUtils` sends `withCredentials: true`

### 6d — Token refresh chain

Reference: `src/utils/apiUtils.ts`

On 401 (except login/refresh/clear-session routes):

1. `POST /api/auth/refresh-token` (reads `refreshToken` from session)
2. Updates session with new tokens
3. Retries original request once
4. On refresh failure → `clearExpiredSession()` → redirect to `/login`

```bash
# Test refresh manually
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "Cookie: black-hole-session=YOUR_SESSION_COOKIE"
```

---

## 7. Debug error responses

### API route error forwarding

```ts
// apiRouteUtils catch block:
if (axios.isAxiosError(error) && error.response) {
  return res.status(error.response.status).json(error.response.data);
}
return res.status(500).json({ message: 'Internal server error' });
```

### Login-specific errors

`createLoginHandler` checks roles:

```ts
// 403 if role not in ALLOWED_ROLES:
{ message: 'Access denied…', code: 'ROLE_NOT_ALLOWED' }
```

### Client-side 401 handling

```ts
// apiUtils.handleAxiosError — on 401:
apiUtils.clearExpiredSession(); // POST /api/auth/clear-session → redirect /login
```

---

## 8. Debug SWR-specific issues

Global SWR config in `pages/_app.tsx`:

```ts
fetcher: (url: string) => axios.get(url).then((res) => res.data),
revalidateOnFocus: false
```

`useApi` hook (`src/hooks/useApi.ts`) uses its **own fetcher** passed per hook (service → `apiUtils`) and overrides with `revalidateOnFocus: true`, `refreshInterval: 30000`.

> If debugging raw `useSWR('/api/…')` without `useApi`, behavior differs from domain hooks. Prefer tracing through the hook + service path first.

| Problem | Cause | Fix |
|---|---|---|
| Data never loads | SWR key doesn't match fetcher args | Align `['/api/events', filters]` key with service call |
| Wrong data shape | Response path mismatch | Check `data?.body?.data` vs `data?.transactions` |
| Stale after mutation | No cache invalidation | Call `mutate()` from hook after POST |
| Duplicate requests | Multiple components same key | Normal SWR dedup — not a bug |
| 401 loop | Refresh token expired | Clear cookies, re-login |

---

## 9. Systematic debug checklist

Work top-down; stop when you find the break:

```
[ ] 1. Browser Network tab — which /api/* URL failed? Status? Response body?
[ ] 2. Client call site — service/hook in src/services/ or src/hooks/?
[ ] 3. apiUtils — withCredentials: true? Correct method/path/payload?
[ ] 4. API route — pages/api/<path>.ts exists? apiRouteUtils or custom handler?
[ ] 5. iron-session — black-hole-session cookie present? SECRET_COOKIE_PASSWORD set (≥32 chars)?
[ ] 6. BACKEND_URL — set in .env.local? Endpoint path correct?
[ ] 7. Backend direct curl — same error without Next.js in the middle?
[ ] 8. Auth chain — session → accessToken → Bearer header forwarded?
[ ] 9. Token refresh — /api/auth/refresh-token working?
[ ] 10. Response shape — statusCode vs status_code? statusCode === 0 for success?
[ ] 11. Pagination — using page: 0 for first page?
[ ] 12. SWR — useApi fetcher path (not just global _app fetcher)? mutate() after write?
[ ] 13. Tests — npm test locally (CI does not run tests on PR)
```

---

## 10. Quick reference — key files

| Concern | File |
|---|---|
| Browser HTTP client | `src/utils/apiUtils.ts` |
| API route factories | `src/utils/apiRouteUtils.ts` |
| iron-session config | `src/lib/session.ts` |
| Session helpers | `src/lib/sessionHelpers.ts` |
| Auth state (client) | `src/contexts/AuthContext.tsx` |
| Route protection (client) | `src/components/Auth/withAuth.tsx` |
| Allowed roles | `src/types/auth.ts` → `ALLOWED_ROLES` |
| Login API route | `pages/api/auth/login.ts` |
| Session check API | `pages/api/auth/session.ts` |
| Token refresh API | `pages/api/auth/refresh-token.ts` |
| SWR global config | `pages/_app.tsx` |
| SWR hook wrapper | `src/hooks/useApi.ts` |
| Toast feedback | `src/contexts/ToastContext.tsx` |
| Domain types | `src/types/*.ts` |
| Env template | `.env.local.example` |
| CI/CD (Docker only) | `.github/workflows/docker-publish.yml` |
| Sidebar menu items | `src/layouts/dashboard/drawer-content/index.tsx` |
