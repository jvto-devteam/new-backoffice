# Finance Cockpit — Design Spec

**Date:** 2026-05-08
**Status:** Approved
**Sub-Plan:** 2 of JVTO Super App (follows Sub-Plan 1: Finance Hub)

---

## Goal

Build `/finance/cockpit/{bookingId}` — a single read-only page showing the complete financial picture of one booking: P&L summary, all expense items with vendor/debt status, customer payment history, and vendor payment history.

This page is complementary to:
- **Finance Hub** (`/finance/hub`) — global view across all bookings
- **EditExpenseManager** (`/finance/expense-manager/{id}/edit`) — editing/managing expense items
- **RekapHutang** (`/finance/rekap-hutang`) — vendor debt payment (per vendor, per month)

The Cockpit is **read-only**. Debt payment remains in RekapHutang. Expense editing remains in EditExpenseManager.

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Finance/FinanceCockpitController.php` | One method: `show()` — assembles all data, renders Inertia |
| `resources/js/Pages/Finance/FinanceCockpit.tsx` | Full page UI |

### Modified Files

| File | Change |
|------|--------|
| `routes/web.php` | +1 route inside finance prefix group |
| `resources/js/Pages/Finance/FinanceHub.tsx` | Add "Detail →" link per booking row |
| `resources/js/Pages/Finance/EditExpenseManager.tsx` | Add "Finance Cockpit" link in header |

### New Route

```
GET /finance/cockpit/{bookingId}  →  FinanceCockpitController@show
```

Named: `finance.cockpit`

No mutation routes needed — Cockpit is read-only.

---

## Data Assembly (`show()` method)

### Booking Header Props

```php
[
    'id'                => $booking->id,
    'booking_code'      => $booking->booking_code ?? $booking->invoice_code_origin,
    'customer'          => $booking->user?->name,
    'package'           => $booking->bookingDetail->first()?->package?->name ?? 'Package',
    'travel_date_start' => $booking->travel_date_start,
    'travel_date_end'   => $booking->travel_date_end,
    'total_pax'         => $booking->total_pax,
    'channel'           => 'TWT' | 'KLOOK' | 'JVTO',  // derived from agent_id / booking_category_id
]
```

### Summary Cards (4 cards)

| Key | Source | Description |
|-----|--------|-------------|
| `revenue` | `bookings.grand_total` | Harga jual ke customer |
| `total_expense` | `bookings.expense_internal_total` | Total expense (managed by updateExpense flow) |
| `margin` | `grand_total - expense_internal_total` | Keuntungan kotor |
| `margin_pct` | `margin / grand_total * 100` | Persentase margin |
| `outstanding_debt` | `bookings.total_expense_debt` | Hutang vendor belum terbayar (auto-synced by BookingExpenseService) |

### Expense Rows

All sources merged into one flat array. Each row:

```php
[
    'type'        => 'hotel' | 'activity' | 'car' | 'crew' | 'others' | 'additional',
    'vendor_name' => string,
    'description' => string,
    'amount'      => int,      // in IDR
    'is_debt'     => bool,     // true = this item is vendor debt
    'is_paid'     => bool,     // true = debt_payment_id IS NOT NULL
    'paid_date'   => string|null,  // from debt_payments.payment_date
]
```

**Sources:**
1. `book_hotels` — amount = `bookRoom.sum('subtotal') + bookHotelMeal.sum('subtotal')`, vendor from `hotel.name`
2. `book_destination_activities` — `subtotal`, vendor from `destinationActivity.name`
3. `book_car_activities` — `subtotal`, vendor from `car.name`
4. `book_crew_activities` — `subtotal`, vendor from `crewRole.name`
5. `book_others_activities` — `subtotal`, vendor from `othersActivity.name`
6. `book_crew_activities` — `subtotal`, description from `crewRole.role` (CrewRole has no vendor_id; crew debt is tracked but not vendor-linked in the same way)
7. `expense_additionals` — `subtotal`, `is_debt=false` always (type: 'additional')

For sources 1–5: `is_debt` from the model's `is_debt` field. `is_paid` = `debt_payment_id IS NOT NULL`. `paid_date` via eager-loaded `debtPayment.payment_date`.

### Customer Payment History

From `booking_payments` (global scope `is_paid='1'` always applies) ordered by `created_at`:

```php
[
    'date'   => string,   // created_at formatted d M Y
    'method' => string,   // paymentMethod.name
    'amount' => int,      // booking_payments.nominal
]
```

Total = `sum('nominal')` across all payment records.

### Vendor Payment History

From `debt_payment_details` where `booking_id = $bookingId`, eager-load `payment.vendor`, `payment.paymentMethod`:

```php
[
    'payment_number' => string,  // debt_payments.payment_number
    'vendor_name'    => string,
    'amount'         => int,
    'payment_date'   => string,
    'method'         => string,
    'proof_url'      => string|null,  // debt_payments.payment_proof
]
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│ ← Finance Hub        [Edit Expense]  [Lihat Booking]│
│                                                     │
│  JVR/001/05/25 · Budi Santoso · 3D Ijen Package    │
│  14–16 Mei 2025 · 4 pax · JVTO                     │
└─────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │ Expense  │ │ Margin   │ │ Hutang   │
│ Rp 12jt  │ │ Rp 8jt   │ │ Rp 4jt   │ │ Rp 2jt   │
│          │ │          │ │   33%    │ │outstanding│
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────┐
│ EXPENSE ITEMS                                       │
├────────────┬──────────────────┬─────────┬──────────┤
│ Tipe       │ Vendor/Deskripsi │ Jumlah  │ Status   │
├────────────┼──────────────────┼─────────┼──────────┤
│ 🏨 Hotel   │ Grand Bromo      │ Rp 800k │ HUTANG   │
│ 🚗 Mobil   │ Toyota Avanza    │ Rp 400k │ HUTANG   │
│ 👤 Crew    │ Guide Ijen       │ Rp 300k │ ✓ LUNAS  │
│ 📍 Aktivitas│ Tiket Ijen      │ Rp 150k │ ✓ LUNAS  │
│ ➕ Tambahan │ Makan Siang     │ Rp 50k  │ INTERNAL │
└────────────┴──────────────────┴─────────┴──────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ PEMBAYARAN CUSTOMER      │ │ PEMBAYARAN VENDOR        │
├──────────────────────────┤ ├──────────────────────────┤
│ 10 Apr · DP · Rp 5jt    │ │ JVR/PAY/04/25/0001       │
│ 13 Mei · Lunas · Rp 7jt │ │ Hotel Grand · Rp 800k    │
│ ─────────────────────── │ │ 15 Apr · Transfer        │
│ Total: Rp 12jt ✓ Lunas  │ │ [lihat bukti bayar]      │
└──────────────────────────┘ └──────────────────────────┘
```

### Status Badge Rules

| Condition | Badge | Color |
|-----------|-------|-------|
| `is_debt=true` AND `is_paid=false` | HUTANG | Merah |
| `is_debt=true` AND `is_paid=true` | ✓ LUNAS | Hijau |
| `is_debt=false` | INTERNAL | Abu-abu |

### Navigation Links

- **← Finance Hub** → `/finance/hub?month={travel_month}&year={travel_year}` (kembali ke hub dengan filter bulan yang sama)
- **Edit Expense** → `/finance/expense-manager/{bookingId}/edit`
- **Lihat Booking** → `/bookings/details/{bookingId}`

---

## Entry Points (links ke Cockpit)

### 1. Finance Hub (`FinanceHub.tsx`)
Kolom Aksi di tabel booking — tambah tombol "Detail" di samping:
```tsx
// Existing: tombol "Bayar" (hanya muncul jika total_debt > 0)
// Add: link "Detail →" selalu muncul
<a href={`/finance/cockpit/${row.id}`}
   className="...indigo outline style...">
    Detail →
</a>
```

### 2. EditExpenseManager (`EditExpenseManager.tsx`)
Di area header/breadcrumb, tambah link:
```tsx
<a href={`/finance/cockpit/${bookingId}`}>Finance Cockpit</a>
```

---

## Constraints & Non-Goals

- **Read-only** — tidak ada form, tidak ada mutation
- **No debt payment UI** — pembayaran hutang tetap di RekapHutang (per vendor, per bulan)
- **No expense editing** — tetap di EditExpenseManager
- **No pagination** — semua data dimuat sekaligus (booking single, data terbatas)
- **No Schedule/Booking Detail link** — defer ke fase berikutnya, cukup Hub + ExpenseManager dulu

---

## Verification

1. `php artisan route:list | grep cockpit` → 1 route muncul
2. Buka `/finance/cockpit/{valid_booking_id}` → halaman render tanpa error
3. Summary cards angkanya konsisten dengan yang tampil di Finance Hub untuk booking yang sama
4. Expense rows mencakup semua sumber (hotel/activity/car/crew/others/additional)
5. Item dengan `debt_payment_id` terisi → badge "✓ LUNAS" hijau
6. Item tanpa `debt_payment_id` dan `is_debt=1` → badge "HUTANG" merah
7. Klik "← Finance Hub" → kembali ke `/finance/hub` dengan filter bulan yang benar
8. Klik "Edit Expense" → buka `/finance/expense-manager/{id}/edit`
9. Link "Detail →" muncul di Finance Hub per booking row
10. `npm run build` → no TypeScript errors
