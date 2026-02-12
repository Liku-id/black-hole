---
description: Menambah endpoint/API baru (full BFF flow dari API route → service → hook → component)
---

# Menambah Endpoint/API Baru

> Project ini **tidak punya database langsung**. Semua data dari backend external (`BACKEND_URL`).
> Alur: **Client → Next.js API Route (BFF proxy) → Backend API**

---

## Step 1: Tentukan Backend Endpoint

Pastikan endpoint backend sudah tersedia. Catat:
- HTTP method (GET/POST/PUT/DELETE)
- Path (misal `/events/{id}/financial-summary`)
- Request body / query params
- Response body shape

---

## Step 2: Buat API Route (BFF Proxy)

File: `pages/api/<domain>/<endpoint>.ts`

### Opsi A: Simple proxy (tanpa transform)

```typescript
import { apiRouteUtils } from '@/utils/apiRouteUtils';

// GET endpoint
export default apiRouteUtils.createGetHandler({
  endpoint: '/backend-path',
  timeout: 30000
});

// POST endpoint
export default apiRouteUtils.createPostHandler({
  endpoint: '/backend-path',
  timeout: 30000
});
```

### Opsi B: Dengan query transform (rename params, validasi, dll)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { apiRouteUtils } from '@/utils/apiRouteUtils';

const transformQuery = (query: any) => {
  const { myParam, page = '0', show = '10' } = query;
  if (!myParam) throw new Error('myParam is required');
  return { backend_param: myParam, page, limit: show };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: '/backend-path',
    transformQuery,
    timeout: 30000
  });
  return await getHandler(req, res);
}
```

### Opsi C: Dynamic path (pakai `[id]`)

File: `pages/api/<domain>/[id]/summary.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/backend-path/${id}/summary`,
    timeout: 30000
  });
  return await getHandler(req, res);
}
```

### Opsi D: File upload (validasi manual + factory di dalam handler)

File: `pages/api/upload-asset.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, file, filename, privacy, fileGroup } = req.body;

  if (!type || !file || !filename || !privacy || !fileGroup) {
    return res.status(400).json({ code: 400, message: 'All fields are required', details: [] });
  }

  // Security: block SVG uploads (Stored XSS prevention)
  const isSvg = filename.toLowerCase().endsWith('.svg') || type === 'image/svg+xml';
  if (isSvg) {
    return res.status(400).json({ code: 400, message: 'SVG files are not allowed', details: [] });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/upload-asset',
    timeout: 60000  // ← 60s untuk file upload (default 30s)
  });
  return await postHandler(req, res);
}
```

> [!WARNING]
> Jangan hardcode `BACKEND_URL` di API route. `apiRouteUtils` sudah handle prepend `process.env.BACKEND_URL`.
> Jangan set `requireAuth: false` kecuali endpoint memang public.
> Untuk file upload, selalu validasi file type secara server-side (jangan trust client MIME type saja).

---

## Step 3: Tambah Type Definitions

File: `src/types/<domain>.ts`

```typescript
// Request type (jika POST/PUT)
export interface CreateFooRequest {
  name: string;
  // ...fields
}

// Response type
export interface FooResponse {
  statusCode: number;
  message: string;
  body: {
    // ...response shape dari backend
  };
}
```

> [!IMPORTANT]
> Naming convention: `PascalCase` + suffix `Request`/`Response`.
> Field names ikuti apa yang backend return (bisa `snake_case` atau `camelCase` — jangan transform).

---

## Step 4: Tambah Service Method

File: `src/services/<domain>/index.ts`

Tambahkan method di class service yang sudah ada:

```typescript
async getFoo(id: string): Promise<FooResponse> {
  try {
    return await apiUtils.get<FooResponse>(
      `/api/<domain>/${id}/foo`,       // BFF route, BUKAN backend URL
      undefined,
      'Failed to fetch foo'
    );
  } catch (error) {
    console.error('Error fetching foo:', error);
    throw error;
  }
}
```

Jika service baru (domain baru):
1. Buat `src/services/<new-domain>/index.ts`
2. Export dari `src/services/index.ts`:
   ```typescript
   export { fooService } from './<new-domain>';
   ```

> [!WARNING]
> Service HARUS call `/api/*` path (BFF route), **BUKAN** backend URL langsung.
> Selalu wrap dalam `try/catch`, `console.error`, lalu `throw error`.

---

## Step 5: Buat Hook

File: `src/hooks/features/<domain>/use<Name>.ts`

### GET (read data)

```typescript
import { fooService } from '@/services';
import { FooResponse } from '@/types/<domain>';
import { useApi } from '../../useApi';

interface UseFooReturn {
  data: FooResponse['body'] | undefined;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useFoo = (id: string | null): UseFooReturn => {
  const { data, loading, error, mutate } = useApi(
    id ? ['/api/<domain>/foo', id] : null,   // SWR key — null = skip
    () => fooService.getFoo(id!)
  );

  return {
    data: data?.body,
    loading,
    error,
    mutate
  };
};

export { useFoo };
```

### POST/PUT/DELETE (mutation)

```typescript
import { useState } from 'react';
import { fooService } from '@/services';
import { CreateFooRequest } from '@/types/<domain>';

const useCreateFoo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFoo = async (data: CreateFooRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fooService.createFoo(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create foo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createFoo, loading, error };
};

export { useCreateFoo };
```

Daftarkan di barrel:
```
// src/hooks/index.ts
export { useFoo } from './features/<domain>/useFoo';
```

---

## Step 6: Gunakan di Component/Page

```typescript
import { useFoo } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { data, loading, error } = useFoo(someId);
  const { showSuccess, showError } = useToast();

  // Handle loading & error states
  if (loading) return <CircularProgress />;
  if (error) return <Body2>{error}</Body2>;

  return <div>{data?.name}</div>;
}
```

---

## Step 7: Verifikasi

// turbo
1. `npm run lint` — pastikan no lint errors (terutama import order)

// turbo
2. `npm run build` — pastikan build success

3. Test manual di browser:
   - Buka Network tab
   - Cek request ke `/api/<domain>/<endpoint>`
   - Pastikan response sesuai expected shape
   - Cek error handling (misal: disconnect internet, expired session)

---

## Checklist

- [ ] API route di `pages/api/` pakai `apiRouteUtils`
- [ ] Types di `src/types/`
- [ ] Service method di `src/services/` (call `/api/` bukan backend langsung)
- [ ] Hook di `src/hooks/features/` (pakai `useApi` untuk GET)
- [ ] Barrel export updated (`services/index.ts`, `hooks/index.ts`)
- [ ] Error handling: try/catch + console.error + re-throw
- [ ] Toast notification untuk user-facing errors
- [ ] `npm run lint` pass
- [ ] `npm run build` pass
