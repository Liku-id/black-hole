---
description: Debugging error di endpoint tertentu (cara trace dari error code/log sampai root cause)
---

# Debugging Endpoint Error

> Gunakan workflow ini saat menemukan error di salah satu endpoint — baik dari browser, staging, atau production.
> Arsitektur BFF: **Browser → `/api/*` (Next.js) → Backend (`BACKEND_URL`)** — error bisa terjadi di setiap layer.

---

## Step 1: Identifikasi Error Layer

Buka **Network tab** di browser DevTools:

| Symptom | Layer | Langkah |
|---------|-------|---------|
| Request ke `/api/*` gagal (4xx/5xx) | BFF atau Backend | → Step 2 |
| Request ke `/api/*` tidak terkirim | Client-side | → Step 3 |
| Request sukses tapi data salah | Response transform / Type mismatch | → Step 4 |
| Token expired / 401 loop | Auth flow | → Step 5 |
| Staging-only error (lokal OK) | Environment config | → Step 6 |

---

## Step 2: Debug BFF API Route

### 2a. Temukan file API route

```bash
# Cari API route berdasarkan path
# Misal error di /api/events/123/summary
find pages/api/ -name "*.ts" | head -30

# Atau langsung cari
ls pages/api/events/
```

Path mapping:
- `/api/events` → `pages/api/events/index.ts`
- `/api/events/[id]` → `pages/api/events/[id].ts` atau `pages/api/events/[id]/index.ts`
- `/api/tickets?eventId=xxx` → `pages/api/tickets/index.ts`

### 2b. Cek endpoint backend yang dipanggil

Buka file API route, cari:
```typescript
endpoint: '/backend-path'  // ini yang dipanggil ke BACKEND_URL
```

### 2c. Test backend langsung

```bash
# Test dari terminal (bypass BFF)
curl -X GET "$BACKEND_URL/backend-path" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

> [!TIP]
> Untuk ambil token aktif, buka `pages/api/auth/tokens.ts` atau cek session via:
> - Browser → Network tab → cari request `/api/auth/session` → response body

### 2d. Cek transformQuery & transformResponse

Jika API route punya `transformQuery`, cek apakah:
- Field names di-rename dengan benar (misal `eventId` → `event_id`)
- Required params divalidasi
- Array params di-serialize dengan benar

---

## Step 3: Debug Client-side (Request Tidak Terkirim)

### 3a. Cek service method

```bash
grep -rn "nama_endpoint\|path_yang_dicari" src/services/ --include="*.ts"
```

Pastikan:
- Path ke `/api/*` benar (bukan langsung ke backend)
- Method HTTP benar (GET/POST/PUT/DELETE)
- Params dikirim dengan benar

### 3b. Cek hook / SWR key

```bash
grep -rn "useNamaHook\|'/api/path'" src/hooks/ --include="*.ts"
```

Cek apakah:
- SWR key bernilai `null` → request di-skip (conditional fetching)
- Dependency (misal `eventId`) belum ter-set saat hook dipanggil
- `useApi` key array konsisten (jangan ubah reference setiap render)

### 3c. Cek `apiUtils.makeRequest` error handling

Error 401 di-retry otomatis via `refreshTokens()`. Jika retry gagal → redirect ke `/login`.
Cek Console tab untuk:
```
API Error: { message, status, data, url, code }
```

---

## Step 4: Debug Response / Data Mismatch

### 4a. Bandingkan response actual vs expected

1. Network tab → cari request → tab Response  
2. Bandingkan dengan type definition di `src/types/<domain>.ts`

```bash
# Cek type definition
grep -A 20 "export interface NamaType" src/types/
```

### 4b. Cek hook data extraction

Banyak hook ada pattern:
```typescript
return {
  data: data?.body?.data || [],  // ← pastikan path ini benar
  pagination: data?.body?.pagination
};
```

Jika backend ubah response structure → harus update extraction path di hook.

### 4c. Cek `transformResponse` di API route

```bash
grep -rn "transformResponse" pages/api/ --include="*.ts"
```

---

## Step 4.5: Debug SWR Caching Gotchas

### Data tidak update setelah mutasi (create/update/delete)

SWR meng-cache data berdasarkan key. Setelah create/update/delete, data bisa stale:

```typescript
// ✅ Solusi: panggil mutate() setelah mutasi berhasil
const { mutate } = useTickets(filters);

const handleDelete = async (id: string) => {
  await ticketsService.deleteTicketType(id);
  mutate();  // ← force re-fetch data
  showSuccess('Deleted successfully');
};
```

> [!WARNING]
> `mutate()` tanpa argument = re-fetch dari API. Jangan confuse dengan `mutate(newData)` yang update cache tanpa re-fetch.

### SWR key mismatch — data tidak ter-update

SWR key HARUS consistent. Problem terjadi jika:
```typescript
// ❌ Object reference berubah setiap render → infinite re-fetch
const { data } = useApi(['/api/events', { page, show }], fetcher);

// ✅ Gunakan serializable key — SWR compare by value, bukan reference
// useApi sudah handle ini via JSON.stringify di SWR key comparison
```

### Conditional fetching — request tidak terkirim

```typescript
// Key = null → SWR skip request entirely (no error, no loading)
const { data } = useApi(
  eventId ? ['/api/events', eventId] : null,  // null = don't fetch
  () => eventsService.getEvent(eventId!)
);

// Debug: cek apakah dependency (eventId) sudah ada value-nya
console.log('SWR key:', eventId ? 'active' : 'skipped (eventId is falsy)');
```

### Stale data setelah navigasi

SWR cache persists selama app session. Jika data harus fresh saat page mount:
```typescript
const { data, mutate } = useApi(key, fetcher, {
  revalidateOnMount: true,     // Force re-fetch saat component mount
  revalidateOnFocus: true,     // Re-fetch saat tab focus (default di SWRConfig)
});
```

---

## Step 5: Debug Auth Issues

### 5a. Token expired loop (infinite 401 → refresh → 401)

Trace flow:
1. `apiUtils.makeRequest` detect 401
2. Call `refreshTokens()` → `POST /api/auth/refresh-token`
3. `apiRouteUtils.createRefreshTokenHandler` → call backend refresh endpoint
4. Jika berhasil → update session → retry original request
5. Jika gagal → `clearExpiredSession()` → redirect `/login`

Jika stuck di loop:
- Cek `pages/api/auth/refresh-token.ts` — apakah backend endpoint benar?
- Cek di server logs apakah refresh token sudah expired di backend
- Cek cookie `black-hole-session` di browser → Application tab → Cookies

### 5b. Role not allowed

```bash
grep -rn "ROLE_NOT_ALLOWED\|ALLOWED_ROLES" src/ pages/ --include="*.ts" --include="*.tsx"
```

Cek `src/types/auth.ts` → `ALLOWED_ROLES` array.

### 5c. Session cookie hilang

- Periksa cookie `black-hole-session` di browser Application tab
- Cek `httpOnly: true`, `secure` setting di `src/lib/session.ts`
- Di development (`NODE_ENV !== 'production'`), `secure: false`
- Pastikan `SECRET_COOKIE_PASSWORD` di `.env` minimal 32 karakter

---

## Step 6: Debug Staging-only Issues

### 6a. Cek environment variables

```bash
# Variable yang relevan
BACKEND_URL          # Server-side only — TIDAK boleh NEXT_PUBLIC_
NEXT_PUBLIC_API_URL  # Client-side public URL
SECRET_COOKIE_PASSWORD  # Session encryption key
```

> [!CAUTION]
> `BACKEND_URL` di staging mungkin berbeda dari lokal.
> Pastikan backend staging aktif dan accessible dari Next.js server.

### 6b. Cek network dari server container

Jika di staging Docker container:
- Apakah container bisa reach `BACKEND_URL`?
- Apakah DNS resolve benar di environment staging?
- Cek `staging.dockerfile` untuk environment setup

### 6c. Cek image domains

Jika error terkait image loading:
```javascript
// next.config.js → images.domains
domains: [
  'wukong-staging-public.s3.ap-southeast-3.amazonaws.com',
  // ...pastikan domain staging ada di sini
]
```

---

## Quick Reference: File Tracing Map

```
Browser error di /api/events/[id]
  ├── API Route: pages/api/events/[id].ts atau pages/api/events/[id]/index.ts
  │     └── Calls: ${BACKEND_URL}/events/${id}
  │     └── Auth: session.accessToken dari iron-session
  │
  ├── Service: src/services/events/index.ts → eventsService.getEventDetail()
  │     └── Calls: apiUtils.get('/api/events/${id}')
  │
  ├── Hook: src/hooks/features/events/useEventDetail.ts
  │     └── SWR key: ['/api/events', id]
  │
  ├── Type: src/types/event.ts → EventDetailResponse
  │
  └── Component: pages/events/detail/[metaUrl].tsx
        └── Uses: useEventDetail(metaUrl)
```

---

## Checklist Debug Selesai

- [ ] Root cause teridentifikasi (layer mana: client/BFF/backend)
- [ ] Fix diterapkan di file yang tepat
- [ ] Error handling memadai (tidak swallow error tanpa log)
- [ ] `npm run build` pass setelah fix
- [ ] Browser test: error tidak muncul lagi
- [ ] Edge case: test dengan token expired, network offline, invalid data
