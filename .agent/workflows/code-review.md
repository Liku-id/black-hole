---
description: Code review checklist untuk PR/MR di project Black Hole
---

# Code Review Checklist

> Gunakan checklist ini saat me-review atau sebelum submit PR.
> Urutan: Architecture → Types → Logic → UI → Security → Quality

---

## 1. Architecture & Pattern Compliance

- [ ] **BFF pattern dijaga**: Client TIDAK call backend langsung — semua via `/api/*`
- [ ] **API route pakai `apiRouteUtils`**: Tidak bikin handler manual kecuali sangat custom
- [ ] **Service pakai `apiUtils`**: Tidak pakai `axios` langsung di service/component
- [ ] **Token di server-side only**: Tidak ada `accessToken`/`refreshToken` di client state/localStorage
- [ ] **Barrel exports updated**: Service/hook/component baru sudah di-export di `index.ts` masing-masing

---

## 2. Type Safety

- [ ] **Interface sesuai backend response**: Field names match (biasanya `snake_case`)
- [ ] **Response type punya `statusCode`, `message`, `body`**: Ikuti pola standar
- [ ] **Request type terpisah dari response**: `CreateFooRequest` vs `FooResponse`
- [ ] **Tidak ada `any` yang bisa dihindari**: Gunakan proper types
- [ ] **Union types pakai type guard**: Contoh `isEventOrganizer(user)` sebelum access organizer fields

---

## 3. Error Handling

- [ ] **Service: try/catch + console.error + re-throw**: Tidak swallow error, tidak transform jadi null
- [ ] **Hook: error di-expose ke component**: Via `error: string | null`
- [ ] **Component: error state di-handle di UI**: Loading, error, empty state semua ada
- [ ] **Toast notification untuk user-facing errors**: Pakai `useToast()` — `showError()`
- [ ] **API route: error response di-forward**: `res.status(error.response.status).json(error.response.data)`

---

## 4. Auth & Security

- [ ] **Page pakai `withAuth`**: `export default withAuth(Component, { requireAuth: true })`
- [ ] **Role-based access benar**: `ground_staff` dan `finance` limited — cek `withAuth.tsx` logic
- [ ] **URL validate pakai `validateRedirectUrl`**: Tidak redirect ke external URL tanpa validasi
- [ ] **Sensitive data di-mask**: NIK, NPWP, bank account pakai `formatUtils.formatIDNumber()`/`formatBankAccount()`
- [ ] **Environment variables**: Server-only vars TIDAK pakai prefix `NEXT_PUBLIC_`

---

## 5. Component Quality

- [ ] **Pakai common components**: `Button`, `TextField`, `Modal`, `Select` dll dari `@/components/common`
- [ ] **Pakai MUI theme colors**: Tidak hardcode warna — gunakan `theme.palette.*` atau string seperti `'text.primary'`, `'primary.main'`
- [ ] **Typography pakai wrapper**: `H1`-`H4`, `Body1`, `Body2`, `Caption` dari common — bukan raw `<h1>`, `<p>`
- [ ] **Layout pakai `DashboardLayout`**: Semua page authenticated di-wrap `<DashboardLayout>`
- [ ] **`<Head>` dengan title**: Setiap page punya `<title>Page Name - Black Hole Dashboard</title>`

---

## 6. State Management

- [ ] **SWR untuk server state**: Data dari API pakai `useApi` / SWR hooks — bukan useState manual
- [ ] **SWR key consistent**: Array key `['/api/path', params]` — null kalau skip
- [ ] **Jotai untuk shared client state**: Cross-component state pakai atoms — bukan prop drilling atau context untuk simple values
- [ ] **Form pakai react-hook-form**: Bukan useState per field
- [ ] **Tidak ada duplicate API calls**: Cek SWR key tidak bikin multiple identical requests

---

## 7. Import & Code Style

- [ ] **Import order ESLint**: `builtin → external → internal → parent → sibling → index` (dengan newlines)
- [ ] **Import via barrel** jika ada: `from '@/services'`, `from '@/hooks'`, `from '@/components/common'`
- [ ] **Prettier compliant**: Single quotes, no trailing comma, 2-space indent, 80 char width
- [ ] **No unused variables/imports**: TypeScript `noUnusedLocals` + `noUnusedParameters` aktif
- [ ] **Tidak ada `'use client'` directive**: Project ini Pages Router, bukan App Router

---

## 8. Naming Conventions

- [ ] **Files/folders**: `kebab-case` (components, services, hooks folders)
- [ ] **Hooks**: `useCamelCase` (misal `useEventDetail`)
- [ ] **Services**: `class PascalCase` + `const camelCase` singleton
- [ ] **Types**: `PascalCase` interface + suffix `Request`/`Response`
- [ ] **Utils**: Object literal `camelCaseUtils` (misal `formatUtils.formatPrice()`)
- [ ] **Constants**: `SCREAMING_SNAKE_CASE`

---

## 9. Performance

- [ ] **SWR config appropriate**: `refreshInterval` dan `revalidateOnFocus` sesuai use case
- [ ] **Debounce pada search/filter**: Pakai `useDebouncedCallback` dari `@/utils`
- [ ] **Conditional fetch**: SWR key `null` saat dependency belum ready
- [ ] **Tidak fetch data di loop**: Gabungkan batch API jika possible
- [ ] **Next.js Image**: Gunakan `next/image` untuk optimized images — cek `domains` di `next.config.js`

---

## 10. Testing (jika applicable)

- [ ] **Test file ada** (untuk component yang complex / critical)
- [ ] **Test pakai React Testing Library**: `render`, `screen`, `userEvent`
- [ ] **Test file naming**: `*.test.tsx` atau `*.test.ts`
- [ ] **Jest runs clean**: `npm run test` pass
- [ ] **Mock API correctly**: Jangan call real API di test

---

## Quick Shell Commands

```bash
# Lint check
npm run lint

# Type check + build
npm run build

# Run tests
npm run test

# Format check
npm run format:check

# Full check sebelum commit
npm run format:fix && npm run build && npm run test
```
