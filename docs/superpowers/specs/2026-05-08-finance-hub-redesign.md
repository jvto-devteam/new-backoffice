# Finance Hub Redesign — Design Spec

**Date:** 2026-05-08
**Status:** Approved
**Scope:** Redesign `/finance/hub` from a debt-tracker into a comprehensive financial dashboard

---

## Goal

Transform Finance Hub from an expense/debt-only view into a true one-stop financial dashboard covering profitability, cash flow, urgent fund requirements, and one-month prediction — using Approach B (tab-based dashboard).

---

## Architecture

**Files modified (no new files):**

| File | Change |
|------|--------|
| `app/Http/Controllers/FinanceController.php` | Extend `financeHub()` with revenue, payment, profit, and prediction data |
| `resources/js/Pages/Finance/FinanceHub.tsx` | Full redesign with tab navigation |

**New data queries added to `financeHub()`:**
- `BookingPayment::whereHas('booking', ...)->sum('nominal')` — total customer payments received per period
- `Booking::where('travel_date_start', next_month)->...` — prediction data for next month
- Per-booking payment totals via eager load `bookingPayment` on the bookings query

**Booking number fix (included in this redesign):**
```php
// For TWT (agent_id=1) and KLOOK (booking_category_id=3): use invoice_code_origin
// For JVTO: use booking_code
'booking_code' => in_array($channel, ['TWT', 'KLOOK'])
    ? ($b->invoice_code_origin ?? $b->booking_code)
    : ($b->booking_code ?? $b->invoice_code_origin)
```
This fix applies in BOTH `financeHub()` (booking table) and `FinanceCockpitController::show()` (booking header).

---

## Tab Structure

Two tabs controlled by URL param `?tab=current` (default) or `?tab=prediction`.

```
[Bulan Ini] [Prediksi Bulan Depan]
```

---

## Tab 1: "Bulan Ini"

### 1a. KPI Cards — 6 cards in 2 rows

**Row 1 — Revenue side (blue/green tones):**

| Card | Value | Source |
|------|-------|--------|
| Grand Total | sum(bookings.grand_total) | Bookings for selected month |
| Terkumpul | sum(booking_payments.nominal) for bookings of the month | BookingPayment eager-loaded, sum per period |
| Piutang Customer | Grand Total − Terkumpul | Derived |

**Row 2 — Expense/P&L side (orange/red tones):**

| Card | Value | Source |
|------|-------|--------|
| Total Expense | sum(bookings.expense_internal_total) | Existing |
| Profit Kotor | Grand Total − Total Expense | Derived; show margin % below value |
| Hutang Vendor | sum(bookings.total_expense_debt) | Existing (unpaid vendor debt) |

**Profit card color logic:**
- Margin ≥ 30% → green
- Margin 15–29% → yellow
- Margin < 15% → red

### 1b. Kebutuhan Dana — below KPI cards

Single horizontal card answering: *"Berapa total kas yang harus disiapkan sekarang?"*

```
┌──────────────────────────────────────────────────────────┐
│ 💰  KEBUTUHAN DANA MENDESAK                              │
│                                                          │
│  Hutang Vendor (outstanding)      Rp XX.XXX.XXX    [→]  │
│  Crew Transfer Pending            Rp XX.XXX.XXX    [→]  │
│  ────────────────────────────────────────────────────    │
│  Total perlu disiapkan            Rp XX.XXX.XXX         │
└──────────────────────────────────────────────────────────┘
```

- **Hutang Vendor** = `sum(bookings.total_expense_debt)` for the period — link `[→]` to `/finance/rekap-hutang?month=X&year=Y`
- **Crew Transfer Pending** = `BookCrewActivity::whereHas('booking', fn($q) => $q->where('crew_transfer_status','pending')->where('travel_date_start','like',"$year-$month%"))->sum('subtotal')` — no link (data visible in crew summary bar below)
- **Total** = Hutang Vendor + Crew Transfer Pending

### 1c. Crew Summary Bar — existing, kept as-is

The existing crew summary bar (👤 Crew Expense Bulan Ini with pending/transferred counts) stays between Kebutuhan Dana and the booking table.

### 1d. Enhanced Booking Table

Columns added vs current:

| Column | Source | Notes |
|--------|--------|-------|
| Grand Total | `bookings.grand_total` | New column |
| Terkumpul | `sum(booking_payments.nominal)` per booking | Eager-loaded |
| Piutang | `grand_total - terkumpul` | Derived per row |
| Profit | `grand_total - expense_internal_total` | Derived per row |

**Full column order:**
Booking · Customer · Tgl · Grand Total · Terkumpul · Piutang · Expense · Profit · Hutang · Aging · Aksi

**Filter additions:**
Existing: month/year/status
No new filters needed.

**Per-row data note:** `terkumpul` per booking requires eager-loading `bookingPayment`. Since `BookingPayment` has a global scope `is_paid='1'`, no additional filter needed. Sum `nominal` per booking.

---

## Tab 2: "Prediksi Bulan Depan"

Shows **confirmed bookings** (status='booked') for the next calendar month — not estimates, pure actuals.

### 2a. Prediction KPI Cards — 4 cards

| Card | Value | Source |
|------|-------|--------|
| Expected Revenue | sum(grand_total) next month bookings | |
| Expected Expense | sum(expense_internal_total) next month | Note if 0: "Expense belum diisi" |
| Expected Profit | Revenue − Expense | Only shown if expense > 0 |
| Dana Siapkan | sum(total_expense_crew) next month bookings | Crew kas yang harus disiapkan |

**"Dana Siapkan"** uses `total_expense_crew` from `bookings` — this is the cash JVTO must prepare to pay crew for upcoming trips.

If `expense_internal_total = 0` for most bookings: show "Expected Profit" card with a yellow badge "Data expense belum lengkap".

### 2b. Prediction Booking Table

Simpler than Tab 1 (no payment data yet):

| Column | Notes |
|--------|-------|
| Booking | Code (with channel badge) |
| Customer | Name |
| Tanggal Trip | travel_date_start |
| Grand Total | Expected revenue |
| Expense | expense_internal_total (0 if not yet filled) |
| Status Expense | Badge: "Belum Diisi" (yellow) if expense=0, "Sudah Diisi" (green) if > 0 |
| Aksi | Detail → (link to Finance Cockpit) |

---

## Controller Data Shape

### `financeHub()` new props structure

```php
return Inertia::render('Finance/FinanceHub', [
    // ── Tab 1: Bulan Ini ──────────────────────────────
    'bookings'     => $bookings,          // enhanced with grand_total, terkumpul, piutang, profit
    'kpi'          => [
        'grand_total'     => int,
        'terkumpul'       => int,         // booking_payments sum for period
        'piutang'         => int,         // grand_total - terkumpul
        'total_expense'   => int,
        'profit'          => int,         // grand_total - total_expense
        'margin_pct'      => float,
        'hutang_vendor'   => int,         // total_expense_debt outstanding
    ],
    'kebutuhan_dana' => [
        'hutang_vendor'   => int,         // same as kpi.hutang_vendor
        'crew_pending'    => int,         // BookCrewActivity sum for pending-transfer bookings
        'total'           => int,
    ],
    'crew_summary' => [...],              // existing, unchanged

    // ── Tab 2: Prediksi ───────────────────────────────
    'prediction' => [
        'bookings'        => [...],       // next month booking rows (simpler shape)
        'expected_revenue'=> int,
        'expected_expense'=> int,
        'expected_profit' => int,
        'dana_siapkan'    => int,         // sum(total_expense_crew) next month
        'expense_complete'=> bool,        // false if any booking has expense=0
    ],

    // ── Shared ────────────────────────────────────────
    'filters'  => compact('month', 'year', 'tab', 'status'),
    'months'   => [...],
    'years'    => [...],
]);
```

---

## Navigation & Filters

- **Tab state:** `?tab=current` (default) or `?tab=prediction`
- **Period filter (month/year):** applies to Tab 1 (bulan ini). Tab 2 always shows next month relative to selected period.
- **Status filter:** applies only to Tab 1 booking table (`all`, `has_debt`, `fully_paid`)
- When switching from Tab 1 to Tab 2, month/year param stays — Tab 2 automatically shows next month

---

## Constraints

- **No new routes** — single existing `/finance/hub` route
- **No new pages** — modifications only
- **No chart library additions** — use existing Tailwind/numbers layout (no ApexCharts for this page)
- **Booking number fix** applied in both `financeHub()` and `FinanceCockpitController::show()`

---

## Verification

1. `npm run build` → no TypeScript errors
2. `/finance/hub` loads correctly — default tab shows current month
3. KPI cards: Grand Total matches sum of booking grand_total for the period
4. Terkumpul: matches sum of booking_payments.nominal for bookings in the period
5. Profit = Grand Total − Total Expense (verify with 1-2 manual bookings)
6. Kebutuhan Dana total = Hutang Vendor + Crew Pending
7. Link `[→]` on Hutang Vendor navigates to RekapHutang with correct filters
8. Tab "Prediksi" shows next month bookings, Dana Siapkan = sum(total_expense_crew)
9. Booking number: TWT/KLOOK bookings show `invoice_code_origin`, JVTO shows `booking_code`
10. Booking table has new columns: Grand Total, Terkumpul, Piutang, Profit
