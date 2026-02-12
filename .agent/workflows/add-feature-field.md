---
description: Menambah atau mengubah field/property di sebuah fitur (full stack dari type → API → service → hook → component)
---

# Menambah / Mengubah Feature Field

> Workflow ini untuk task seperti: menambah `is_public` di ticket, menghapus `platformFee`, menambah field baru di form create event, dll.
> Ini adalah task paling sering di project ini.

---

## Step 1: Identifikasi Scope Perubahan

Tentukan:
- **Field name** (misal `is_public`, `admin_fee`)
- **Tipe data** (boolean, string, number, enum)
- **Dari backend API mana** field ini datang
- **Dimana saja field ini digunakan** — cari dengan grep:

```bash
# Cari semua penggunaan field
grep -rn "is_public\|isPublic" src/ pages/ --include="*.ts" --include="*.tsx"
```

---

## Step 2: Update Type Definitions

File: `src/types/<domain>.ts`

### Menambah field baru:
```typescript
// Di interface yang relevan
export interface TicketType {
  // ...existing fields
  is_public: boolean;  // ← tambahkan field baru
}
```

### Menghapus field:
Hapus field dari interface, lalu grep untuk memastikan tidak ada yang reference.

> [!IMPORTANT]
> Gunakan nama field **PERSIS** seperti yang dikembalikan backend (biasanya `snake_case`).
> Jika menambah field di response, tambahkan juga di request type jika field tersebut bisa di-submit.

---

## Step 3: Update Service Layer (jika perlu)

File: `src/services/<domain>/index.ts`

Jika field baru perlu dikirim ke backend (create/update):

```typescript
// Update payload interface di service
interface TicketTypePayload {
  // ...existing fields
  isPublic: boolean;  // ← camelCase untuk payload ke BFF
}
```

> [!WARNING]
> Perhatikan perbedaan naming: backend response pakai `snake_case` (`is_public`), tapi payload dari frontend kadang pakai `camelCase` (`isPublic`). Cek existing pattern di service file tersebut.

---

## Step 4: Update Hook (jika return value berubah)

File: `src/hooks/features/<domain>/use<Name>.ts`

Jika hook perlu expose field baru di return type:

```typescript
interface UseTicketsReturn {
  // ...existing
  // biasanya tidak perlu ubah jika data langsung dari `data?.body`
}
```

> Kebanyakan hook langsung return `data?.body?.data` sehingga field baru otomatis tersedia. Hanya perlu diubah jika ada destructuring/mapping custom.

---

## Step 5: Update Component — Tampilkan Field

### Di table (list view):
```typescript
// Tambah kolom baru
<TableCell>{item.is_public ? 'Public' : 'Private'}</TableCell>
```

### Di form (create/edit) — react-hook-form pattern:

Setup `useForm` dengan default values (termasuk field baru):
```typescript
import { useForm, Controller } from 'react-hook-form';

interface FormValues {
  name: string;
  isPublic: boolean;       // ← field baru
  // ...existing fields
}

const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
  defaultValues: {
    name: '',
    isPublic: true,        // ← default value
  }
});

// Jika edit form: set default values dari API data
useEffect(() => {
  if (existingData) {
    reset({
      name: existingData.name,
      isPublic: existingData.is_public,  // ← map snake_case → camelCase
    });
  }
}, [existingData, reset]);
```

Render field dengan `Controller` + common components:
```typescript
// Boolean (Switch/Checkbox)
<Controller
  name="isPublic"
  control={control}
  render={({ field }) => (
    <Switch checked={field.value} onChange={field.onChange} />
  )}
/>

// Text input
<Controller
  name="fieldName"
  control={control}
  rules={{ required: 'Field is required' }}
  render={({ field, fieldState: { error } }) => (
    <TextField
      {...field}
      label="Label"
      error={!!error}
      helperText={error?.message}
    />
  )}
/>

// Select/Dropdown
<Controller
  name="status"
  control={control}
  render={({ field }) => (
    <Select value={field.value} onChange={field.onChange} options={statusOptions} />
  )}
/>
```

> [!TIP]
> Gunakan `watch('fieldName')` untuk reactive values (conditional rendering).
> Gunakan `setValue('fieldName', value)` untuk programmatic updates.

### Di detail view (read-only):
```typescript
<Body2>{data.is_public ? 'Public' : 'Private'}</Body2>
```

---

## Step 6: Update Component — Form Submission

Jika field baru perlu dikirim saat create/update:

```typescript
const handleSubmit = async (formData: FormValues) => {
  const payload = {
    ...existingPayload,
    isPublic: formData.isPublic,  // ← tambah field baru
  };
  await ticketsService.createTicketType(payload);
};
```

> [!WARNING]
> Pastikan field ada di payload interface service. Jangan kirim field yang tidak ada di backend API — ini bisa menyebabkan error 400.

---

## Step 7: Jika Menghapus Field (seperti platformFee removal)

Lakukan cleanup menyeluruh:

```bash
# 1. Cari semua referensi
grep -rn "platformFee\|platform_fee\|PLATFORM_FEE" src/ pages/ --include="*.ts" --include="*.tsx"

# 2. Hapus dari:
#    - Types (interfaces, enums)
#    - Services (payload interfaces, method params)
#    - Hooks (return values)
#    - Components (form fields, table columns, display)
#    - Validation logic
#    - Constants/options arrays
```

> [!CAUTION]
> Saat menghapus field, JANGAN hapus field yang masih dikirim backend di response.
> Hapus hanya dari UI/form/validation. Type di `src/types/` boleh tetap ada jika backend masih mengirim field tersebut.

---

## Step 8: Verifikasi

// turbo
1. `npm run lint` — pastikan no unused variables/imports

// turbo
2. `npm run build` — pastikan TypeScript tidak error

3. Test semual tampilan yang terpengaruh:
   - List/table view: field baru muncul?
   - Create form: field bisa diisi dan terkirim?
   - Edit form: field ter-load dengan value existing?
   - Detail view: field tampil dengan benar?

4. Test edge cases:
   - Field kosong/null dari backend
   - Field dengan value unexpected

---

## Checklist

- [ ] Type definition diupdate di `src/types/`
- [ ] Service payload diupdate (jika field dikirim ke backend)
- [ ] Hook return type diupdate (jika ada custom destructuring)
- [ ] Component: tampilan field baru di table/detail/form
- [ ] Component: form submission include field baru
- [ ] Tidak ada unused imports/variables setelah perubahan
- [ ] `npm run lint` pass
- [ ] `npm run build` pass
- [ ] Browser test: semua view yang terpengaruh berfungsi
