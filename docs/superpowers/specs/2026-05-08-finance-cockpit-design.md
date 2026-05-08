# Finance Cockpit — Design Spec

**Date:** 2026-05-08
**Status:** Approved
**Sub-Plan:** 2 of JVTO Super App (follows Sub-Plan 1: Finance Hub)

---

## Goal

Build `/finance/cockpit/{bookingId}` — a single page showing the complete financial picture of one booking: P&L summary, all expense items with vendor/debt status, customer payment history, vendor payment history, and crew transfer status.

Additionally, extend **Finance Hub** (`/finance/hub`) with a crew expense summary section per period — showing total crew expense, how many bookings are pending transfer, and how much needs to be prepared.

This page is complementary to:
- **Finance Hub** (`/finance/hub`) — global view across all bookings
- **EditExpenseManager** (`/finance/expense-manager/{id}/edit`) — editing/managing expense items
- **RekapHutang** (`/finance/rekap-hutang`) — vendor debt payment (per vendor, per month)

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Finance/FinanceCockpitController.php` | Two methods: `show()` + `markCrewTransfer()` |
| `resources/js/Pages/Finance/FinanceCockpit.tsx` | Full page UI |
| `database/migrations/XXXX_add_crew_transfer_fields_to_bookings.php` | New columns on `bookings` table |

### Modified Files

| File | Change |
|------|--------|
| `routes/web.php` | +2 routes (GET cockpit, POST crew-transfer) |
| `resources/js/Pages/Finance/FinanceHub.tsx` | Add "Detail →" link per row + crew summary section |
| `resources/js/Pages/Finance/EditExpenseManager.tsx` | Add "Finance Cockpit" link in header |

### New Routes

```
GET  /finance/cockpit/{bookingId}                →  FinanceCockpitController@show
POST /finance/cockpit/{bookingId}/crew-transfer  →  FinanceCockpitController@markCrewTransfer
```

Named: `finance.cockpit`, `finance.cockpit.crew-transfer`

---

## Database Change

### Migration: `add_crew_transfer_fields_to_bookings`

```php
Schema::table('bookings', function (Blueprint $table) {
    $table->enum('crew_transfer_status', ['pending', 'transferred'])
          ->default('pending')
          ->after('total_expense_debt_paid');
    $table->date('crew_transfer_date')->nullable()->after('crew_transfer_status');
    $table->string('crew_transfer_proof')->nullable()->after('crew_transfer_date');
});
```

`crew_transfer_status` defaults to `pending`. Set to `transferred` when staff uploads proof.

---

## Data Assembly (`show()` method)

### Booking Header Props

```php
[
    'id'                    => $booking->id,
    'booking_code'          => $booking->booking_code ?? $booking->invoice_code_origin,
    'customer'              => $booking->user?->name,
    'package'               => $booking->bookingDetail->first()?->package?->name ?? 'Package',
    'travel_date_start'     => $booking->travel_date_start,
    'travel_date_end'       => $booking->travel_date_end,
    'total_pax'             => $booking->total_pax,
    'channel'               => 'TWT' | 'KLOOK' | 'JVTO',
    // Crew transfer
    'crew_transfer_status'  => $booking->crew_transfer_status,   // 'pending' | 'transferred'
    'crew_transfer_date'    => $booking->crew_transfer_date,
    'crew_transfer_proof'   => $booking->crew_transfer_proof
                                ? Storage::url($booking->crew_transfer_proof)
                                : null,
    'total_crew_expense'    => (int) BookCrewActivity::where('booking_id', $booking->id)->sum('subtotal'),
]
```

### Summary Cards (4 cards)

| Key | Source | Description |
|-----|--------|-------------|
| `revenue` | `bookings.grand_total` | Harga jual ke customer |
| `total_expense` | `bookings.expense_internal_total` | Total expense (managed by updateExpense flow) |
| `margin` | `grand_total - expense_internal_total` | Keuntungan kotor |
| `margin_pct` | `margin / grand_total * 100` | Persentase margin (%) |
| `outstanding_debt` | `bookings.total_expense_debt` | Hutang vendor belum terbayar (auto-synced) |

### Expense Rows

All sources merged into one flat array. All items shown regardless of `is_debt` value.

Each row:

```php
[
    'type'        => 'hotel' | 'activity' | 'car' | 'crew' | 'others' | 'additional',
    'description' => string,
    'amount'      => int,
    'is_debt'     => bool,
    'is_paid'     => bool,        // debt_payment_id IS NOT NULL
    'paid_date'   => string|null, // from debt_payments.payment_date
]
```

**Sources (6 total):**
1. `book_hotels` — ALL records; amount = `bookRoom.sum('subtotal') + bookHotelMeal.sum('subtotal')`, label from `hotel.name`
2. `book_destination_activities` — ALL records; `subtotal`, label from `destinationActivity.name`
3. `book_car_activities` — ALL records; `subtotal`, label from `car.name`
4. `book_crew_activities` — ALL records; `subtotal`, label from `crewRole.role` (no vendor_id needed)
5. `book_others_activities` — ALL records; `subtotal`, label from `othersActivity.name`
6. `expense_additionals` — ALL records; `subtotal`, label from `item` field; always `is_debt=false`

For sources 1–5: `is_debt` from model field. `is_paid` = `debt_payment_id IS NOT NULL`. `paid_date` via eager-loaded `debtPayment.payment_date`.

### Customer Payment History

From `booking_payments` (global scope `is_paid='1'` auto-applies) ordered by `created_at`:

```php
[
    'date'   => string,   // created_at formatted d M Y
    'method' => string,   // paymentMethod.name
    'amount' => int,      // booking_payments.nominal
]
```

Total = `sum('nominal')`.

### Vendor Payment History

From `debt_payment_details` where `booking_id = $bookingId`, eager-load `payment.vendor`, `payment.paymentMethod`:

```php
[
    'payment_number' => string,
    'vendor_name'    => string,
    'amount'         => int,      // debt_payment_details.amount
    'payment_date'   => string,
    'method'         => string,
    'proof_url'      => string|null,
]
```

---

## UI Layout (`FinanceCockpit.tsx`)

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
│ Tipe       │ Deskripsi        │ Jumlah  │ Status   │
├────────────┼──────────────────┼─────────┼──────────┤
│ 🏨 Hotel   │ Grand Bromo      │ Rp 800k │ HUTANG   │
│ 🚗 Mobil   │ Toyota Avanza    │ Rp 400k │ HUTANG   │
│ 👤 Crew    │ Guide Ijen       │ Rp 300k │ ✓ LUNAS  │
│ 📍 Aktivitas│ Tiket Ijen      │ Rp 150k │ ✓ LUNAS  │
│ ➕ Tambahan │ Makan Siang     │ Rp 50k  │ INTERNAL │
└────────────┴──────────────────┴─────────┴──────────┘

┌─────────────────────────────────────────────────────┐
│ CREW TRANSFER          [BELUM TRANSFER] [Tandai ▼] │
│                                                     │
│  Total crew expense booking ini: Rp 300.000         │
│  Status: ● Belum Transfer                           │
│                                                     │
│  (setelah transfer → tampil:)                       │
│  ✓ Ditransfer 15 Mei 2025 · [lihat bukti]           │
└─────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ PEMBAYARAN CUSTOMER      │ │ PEMBAYARAN VENDOR        │
├──────────────────────────┤ ├──────────────────────────┤
│ 10 Apr · Transfer · 5jt │ │ JVR/PAY/04/25/0001       │
│ 13 Mei · Cash · Rp 7jt  │ │ Hotel Grand · Rp 800k    │
│ ─────────────────────── │ │ 15 Apr · Transfer        │
│ Total: Rp 12jt           │ │ [lihat bukti bayar]      │
└──────────────────────────┘ └──────────────────────────┘
```

### Crew Transfer Section Behaviour

- **Status `pending`**: badge merah "BELUM TRANSFER" + tombol "Tandai Transfer" → buka modal
- **Status `transferred`**: badge hijau "✓ SUDAH TRANSFER" + tanggal + link bukti transfer. Tidak ada tombol ubah (immutable setelah transfer dikonfirmasi)

### Crew Transfer Modal

Form sederhana, submit ke `POST /finance/cockpit/{id}/crew-transfer`:

```
┌────────────────────────────────┐
│ Tandai Crew Transfer           │
│                                │
│ Tanggal Transfer: [date input] │
│ Bukti Transfer:  [file upload] │
│   (jpg/png/pdf, max 5MB)       │
│                                │
│ Total: Rp 300.000              │
│                                │
│ [Batal]    [Simpan]            │
└────────────────────────────────┘
```

### Status Badge Rules (Expense Items)

| Condition | Badge | Color |
|-----------|-------|-------|
| `is_debt=true` AND `is_paid=false` | HUTANG | Merah |
| `is_debt=true` AND `is_paid=true` | ✓ LUNAS | Hijau |
| `is_debt=false` | INTERNAL | Abu-abu |

---

## `markCrewTransfer()` Controller Method

```php
public function markCrewTransfer(Request $request, int $bookingId): \Illuminate\Http\RedirectResponse
{
    $request->validate([
        'transfer_date' => 'required|date',
        'proof_file'    => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
    ]);

    $booking = Booking::findOrFail($bookingId);

    $proofPath = $request->file('proof_file')->store('crew_transfer_proofs', 'public');

    $booking->update([
        'crew_transfer_status' => 'transferred',
        'crew_transfer_date'   => $request->transfer_date,
        'crew_transfer_proof'  => $proofPath,
    ]);

    return redirect()->route('finance.cockpit', $bookingId)
        ->with('success', 'Crew transfer berhasil dicatat.');
}
```

Note: `booking` model allows these fields via `$fillable` or `$guarded`. If guarded, use direct attribute assignment + `save()` instead (same pattern as `BookingExpenseService`).

---

## Finance Hub Extension — Crew Summary Section

Add a new section **below the 4 summary cards** in `FinanceHub.tsx`, filtered by the same month/year as the booking table.

### Backend: new key in `financeHub()` controller

```php
'crew_summary' => [
    'total_crew_expense'     => (int) BookCrewActivity::whereHas('booking', fn($q) =>
                                    $q->where('status','booked')
                                      ->where('travel_date_start','like',"$year-$month%")
                                )->sum('subtotal'),
    'bookings_pending'       => Booking::where('status','booked')
                                    ->where('travel_date_start','like',"$year-$month%")
                                    ->where('crew_transfer_status','pending')
                                    ->count(),
    'bookings_transferred'   => Booking::where('status','booked')
                                    ->where('travel_date_start','like',"$year-$month%")
                                    ->where('crew_transfer_status','transferred')
                                    ->count(),
],
```

### Frontend: crew summary bar in `FinanceHub.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│ 👤 CREW EXPENSE BULAN INI                                        │
│  Total: Rp 8.400.000 │ Belum Transfer: 7 booking │ Sudah: 3     │
└──────────────────────────────────────────────────────────────────┘
```

Displayed as a single horizontal bar between summary cards and booking table. Filters automatically update when month/year changes.

---

## Navigation Links

- **← Finance Hub** → `/finance/hub?month={travel_month}&year={travel_year}`
- **Edit Expense** → `/finance/expense-manager/{bookingId}/edit`
- **Lihat Booking** → `/bookings/details/{bookingId}`

---

## Entry Points

### 1. Finance Hub (`FinanceHub.tsx`)
Kolom Aksi — tambah "Detail →" di samping tombol "Bayar":
```tsx
<a href={`/finance/cockpit/${row.id}`} className="...indigo outline...">Detail →</a>
```

### 2. EditExpenseManager (`EditExpenseManager.tsx`)
Header area:
```tsx
<a href={`/finance/cockpit/${bookingId}`}>Finance Cockpit</a>
```

---

## Constraints & Non-Goals

- **One mutation only** — `markCrewTransfer()` (immutable after set: no undo)
- **No debt payment UI** — tetap di RekapHutang
- **No expense editing** — tetap di EditExpenseManager
- **No pagination** — semua data dimuat sekaligus
- **Crew transfer is booking-level** — satu status per booking, bukan per item crew

---

## Verification

1. `php artisan migrate` → kolom `crew_transfer_status`, `crew_transfer_date`, `crew_transfer_proof` muncul di `bookings`
2. `php artisan route:list | grep cockpit` → 2 routes (GET + POST)
3. Buka `/finance/cockpit/{valid_booking_id}` → halaman render tanpa error
4. Summary cards angkanya konsisten dengan Finance Hub untuk booking yang sama
5. Expense rows mencakup semua 6 sumber (hotel/activity/car/crew/others/additional)
6. Item dengan `debt_payment_id` terisi → badge "✓ LUNAS" hijau
7. Item `is_debt=0` → badge "INTERNAL" abu-abu
8. Crew transfer section: status awal "BELUM TRANSFER" (merah)
9. Klik "Tandai Transfer" → modal muncul, isi tanggal + upload bukti → submit
10. Setelah submit: badge berubah hijau "✓ SUDAH TRANSFER", tanggal + link bukti muncul
11. Finance Hub crew summary bar tampil dengan angka yang benar per bulan
12. Klik "← Finance Hub" → kembali dengan filter bulan yang benar
13. `npm run build` → no TypeScript errors
