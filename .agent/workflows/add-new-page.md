---
description: Membuat page/halaman baru di dashboard (withAuth + DashboardLayout + hooks + role access)
---

# Membuat Page Baru

> Semua page authenticated di project ini mengikuti pattern yang sama:
> `withAuth` HOC → `DashboardLayout` → `<Head>` → Content (hooks + components)

---

## Step 1: Tentukan Routing & File Path

Next.js Pages Router — file path = URL path:

```
pages/my-feature/index.tsx        → /my-feature
pages/my-feature/create/index.tsx → /my-feature/create
pages/my-feature/[id]/index.tsx   → /my-feature/:id (dynamic)
```

> [!IMPORTANT]
> Gunakan `kebab-case` untuk folder names.
> Nama file selalu `index.tsx` (bukan `MyFeature.tsx`).

---

## Step 2: Buat Page File (Skeleton)

File: `pages/<feature>/index.tsx`

```typescript
import { Box } from '@mui/material';
import Head from 'next/head';

import { withAuth } from '@/components/Auth/withAuth';
import { H2, Body2 } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/layouts/dashboard';

function MyFeature() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Head>
        <title>My Feature - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Header */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginBottom="24px"
        >
          <H2 color="text.primary" fontWeight={700}>
            My Feature
          </H2>
        </Box>

        {/* Content */}
        <Body2>Content here</Body2>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(MyFeature, { requireAuth: true });
```

> [!WARNING]
> Jangan lupa `export default withAuth(...)` — tanpa ini page bisa diakses tanpa login.
> Jangan lupa `<Head>` dengan `<title>` — ini penting untuk SEO dan browser tab.

---

## Step 3: Role-Based Access (jika perlu restrict)

Jika page hanya boleh diakses role tertentu:

```typescript
import { isEventOrganizer, UserRole, User } from '@/types/auth';

function MyFeature() {
  const { user } = useAuth();

  // Ambil role name (handle EventOrganizer vs User union type)
  const userRole = user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;

  // Conditional rendering berdasarkan role
  const canCreate = userRole !== UserRole.GROUND_STAFF && userRole !== UserRole.FINANCE;

  return (
    <DashboardLayout>
      {/* ... */}
      {canCreate && <Button onClick={handleCreate}>Create</Button>}
    </DashboardLayout>
  );
}
```

Untuk page yang HANYA boleh diakses role tertentu, tambahkan redirect di `withAuth.tsx`:
```typescript
// src/components/Auth/withAuth.tsx → tambahkan di useEffect role-based section
if (userRole === 'ground_staff') {
  const isAllowedBase = path.startsWith('/events') || path.startsWith('/tickets');
  // tambahkan path baru: || path.startsWith('/my-feature')
}
```

> [!CAUTION]
> Jika page baru harus accessible untuk `ground_staff` atau `finance`, pastikan path ditambahkan di whitelist di `withAuth.tsx`. Default-nya mereka di-redirect ke `/events`.

---

## Step 4: Integrasikan Data (Hooks)

### Jika data sudah ada (hook tersedia):

```typescript
import { useEvents } from '@/hooks';

function MyFeature() {
  const [filters, setFilters] = useState({ page: 0, show: 10 });
  const { events, loading, error, mutate, pagination } = useEvents(filters);

  if (loading) return <CircularProgress />;
  if (error) return <Body2>{error}</Body2>;

  return (
    <>
      {events.map(event => <div key={event.id}>{event.name}</div>)}
      <Pagination /* ... */ />
    </>
  );
}
```

### Jika butuh hook baru:

Ikuti workflow `/add-api-endpoint` untuk buat: API route → service → hook → use di page.

---

## Step 5: Tambah Navigasi (Sidebar)

File: `src/layouts/dashboard/drawer-content/index.tsx`

Tambahkan menu item baru di sidebar navigation:

```typescript
{
  title: 'My Feature',
  path: '/my-feature',
  icon: <SomeIcon />,      // MUI icon atau Image dari /public/icon/
  roles: ['admin', 'business_development', 'event_organizer_pic']  // roles yang bisa lihat menu ini
}
```

> [!WARNING]
> Sidebar navigation punya role-based filter. Pastikan role yang sesuai bisa lihat menu item baru.

---

## Step 6: Common Page Patterns

### Search + Filter + Tabs (seperti Events page):

```typescript
import { useDebouncedCallback } from '@/utils';

const [searchValue, setSearchValue] = useState('');
const [activeTab, setActiveTab] = useState('active');
const [filters, setFilters] = useState({ page: 0, show: 10, status: 'active' });

const debouncedSetFilters = useDebouncedCallback((value: string) => {
  setFilters(prev => ({ ...prev, name: value, page: 0 }));
}, 1000);

const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchValue(event.target.value);
  debouncedSetFilters(event.target.value);
};

const handleTabChange = (newTab: string) => {
  setActiveTab(newTab);
  setFilters(prev => ({ ...prev, status: newTab, page: 0 }));
};

const handlePageChange = (newPage: number) => {
  setFilters(prev => ({ ...prev, page: newPage }));
};
```

### Toast notifications:

```typescript
import { useToast } from '@/contexts/ToastContext';

const { showSuccess, showError } = useToast();

const handleAction = async () => {
  try {
    await someService.doSomething();
    showSuccess('Action berhasil');
    mutate();  // refresh data
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Action gagal');
  }
};
```

### EventOrganizer conditional (jika page EO-specific):

```typescript
import { useAtom } from 'jotai';
import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';

const [selectedEOId] = useAtom(selectedEOIdAtom);

useEffect(() => {
  setFilters(prev => {
    const newFilters = { ...prev, page: 0 };
    if (selectedEOId) {
      newFilters.event_organizer_id = selectedEOId;
    } else {
      delete newFilters.event_organizer_id;
    }
    return newFilters;
  });
}, [selectedEOId]);
```

---

## Step 7: Verifikasi

// turbo
1. `npm run lint` — pastikan no lint errors

// turbo
2. `npm run build` — pastikan build success

3. Browser test:
   - Navigate ke page baru via URL langsung
   - Navigate via sidebar menu
   - Test dengan user role yang berbeda (admin, EO, ground_staff)
   - Test redirect ke login saat belum authenticated
   - Cek title di browser tab

---

## Checklist

- [ ] Page file di `pages/<feature>/index.tsx`
- [ ] `withAuth(Component, { requireAuth: true })` export
- [ ] `<DashboardLayout>` wrap content
- [ ] `<Head><title>Feature - Black Hole Dashboard</title></Head>`
- [ ] Role-based rendering (jika applicable)
- [ ] Hook integration untuk data
- [ ] Sidebar menu ditambahkan di `drawer-content/index.tsx`
- [ ] withAuth.tsx whitelist diupdate (jika page perlu diakses ground_staff/finance)
- [ ] Error/loading/empty states ter-handle
- [ ] `npm run lint` pass
- [ ] `npm run build` pass
