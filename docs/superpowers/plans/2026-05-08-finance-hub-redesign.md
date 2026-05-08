# Finance Hub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Finance Hub into a comprehensive tab-based financial dashboard covering profitability, cash flow, kebutuhan dana, and one-month prediction — plus fix booking number logic for TWT/KLOOK channels.

**Architecture:** Modify only `FinanceController::financeHub()` (extend data queries) and `FinanceHub.tsx` (full redesign). The existing route and `/finance/hub` URL stay unchanged. Tab state is controlled via `?tab=current` (default) or `?tab=prediction` URL params. Fix booking code (TWT/KLOOK → `invoice_code_origin`) in both `financeHub()` and `FinanceCockpitController::show()`.

**Tech Stack:** Laravel 11, PHP 8.2, React 18 + TypeScript, Inertia.js, Tailwind CSS, lucide-react

---

## Context (critical for implementers)

- **Working directory:** `/Applications/XAMPP/xamppfiles/htdocs/new-backoffice`
- **Branch:** `dev-finance`
- **`financeHub()` method** is at line 3006 of `app/Http/Controllers/FinanceController.php` (total ~3100 lines)
- **`FinanceCockpitController::show()`** is at `app/Http/Controllers/Finance/FinanceCockpitController.php`
- **`BookingPayment`** has a global scope `is_paid='1'` (always active) and uses `nominal` as the amount field
- **`BookCrewActivity`** is already imported in `FinanceController` (line 10)
- **`Booking`** model is fully guarded — use `->select()` + map, not mass-assignment
- The existing `FinanceHub.tsx` props `summary` and `view` filter are being **replaced** in this redesign
- `DebtPaymentModal` import and `payTarget` state must be **kept** in `FinanceHub.tsx`

---

## File Map

| Action | File |
|--------|------|
| MODIFY | `app/Http/Controllers/FinanceController.php` (lines ~3006–3100) |
| MODIFY | `app/Http/Controllers/Finance/FinanceCockpitController.php` (booking code fix only) |
| MODIFY | `resources/js/Pages/Finance/FinanceHub.tsx` (complete rewrite) |

---

## Task 1: Fix Booking Code Logic in Both Controllers

**Files:**
- Modify: `app/Http/Controllers/FinanceController.php` (inside `financeHub()` booking map)
- Modify: `app/Http/Controllers/Finance/FinanceCockpitController.php` (inside `show()`)

**The fix:** For TWT (agent_id=1) and KLOOK (booking_category_id=3), use `invoice_code_origin`. For JVTO, use `booking_code`.

- [ ] **Step 1: Fix booking code in `financeHub()` method**

In `FinanceController.php`, find the line inside the `$bookings->map(...)` closure that reads:
```php
'booking_code'      => $b->booking_code ?? $b->invoice_code_origin,
```

Replace it with:
```php
'booking_code'      => in_array($channel, ['TWT', 'KLOOK'])
                        ? ($b->invoice_code_origin ?? $b->booking_code)
                        : ($b->booking_code ?? $b->invoice_code_origin),
```

Note: `$channel` is already defined above this line in the same closure.

- [ ] **Step 2: Fix booking code in `FinanceCockpitController::show()`**

In `FinanceCockpitController.php`, find the line inside the `show()` method that reads:
```php
'booking_code'         => $booking->booking_code ?? $booking->invoice_code_origin,
```

Replace it with:
```php
'booking_code'         => in_array($channel, ['TWT', 'KLOOK'])
                           ? ($booking->invoice_code_origin ?? $booking->booking_code)
                           : ($booking->booking_code ?? $booking->invoice_code_origin),
```

Note: `$channel` is already defined above this line in `show()`.

- [ ] **Step 3: Verify app boots**

```bash
php artisan route:list --path=finance 2>&1 | head -5
```

Expected: No errors, routes listed normally.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/FinanceController.php app/Http/Controllers/Finance/FinanceCockpitController.php
git commit -m "fix: use invoice_code_origin for TWT/KLOOK booking codes in financeHub and cockpit"
```

---

## Task 2: Extend `financeHub()` Controller

**Files:**
- Modify: `app/Http/Controllers/FinanceController.php` — replace the entire `financeHub()` method body (lines ~3006–3100)

This task replaces the entire `financeHub()` method with a version that:
1. Adds `bookingPayment` eager-load to compute `terkumpul` per booking
2. Adds `grand_total`, `terkumpul`, `piutang`, `profit` per booking row
3. Computes 7-field `kpi` aggregate
4. Computes `kebutuhan_dana` (hutang vendor + crew pending)
5. Adds `prediction` data for next month
6. Adds `tab` to filters (replaces `view`)
7. Fixes `total_expense_crew` added to SELECT

- [ ] **Step 1: Replace the `financeHub()` method**

Find the method starting at line 3006. Replace the entire method body (from `public function financeHub` to its closing `}`) with:

```php
public function financeHub(Request $request): \Inertia\Response
{
    $month  = $request->month  ?: date('m');
    $year   = $request->year   ?: date('Y');
    $tab    = $request->tab    ?: 'current';
    $status = $request->status ?: 'all';

    // ── Current month bookings ─────────────────────────────────────
    $query = Booking::select(
            'id', 'user_id', 'booking_code', 'invoice_code_origin',
            'travel_date_start', 'travel_date_end', 'total_pax',
            'grand_total', 'agent_id', 'booking_category_id',
            'expense_internal_total', 'total_expense_crew',
            'total_expense_debt', 'total_expense_debt_paid'
        )
        ->with(['user:id,name', 'bookingDetail.package:id,name', 'bookingPayment'])
        ->where('status', 'booked')
        ->where('travel_date_start', 'like', "$year-$month%");

    if ($status === 'has_debt') {
        $query->where('total_expense_debt', '>', 0);
    } elseif ($status === 'fully_paid') {
        $query->where('total_expense_debt', 0)->where('total_expense_debt_paid', '>', 0);
    }

    $bookings = $query->orderBy('travel_date_start')->get()->map(function ($b) {
        $channel = match(true) {
            $b->agent_id == 1            => 'TWT',
            $b->booking_category_id == 3 => 'KLOOK',
            default                      => 'JVTO',
        };

        // TWT/KLOOK use invoice_code_origin; JVTO uses booking_code
        $bookingCode = in_array($channel, ['TWT', 'KLOOK'])
            ? ($b->invoice_code_origin ?? $b->booking_code)
            : ($b->booking_code ?? $b->invoice_code_origin);

        $daysOverdue = 0;
        if ($b->travel_date_end) {
            $diff = now()->diffInDays($b->travel_date_end, false);
            $daysOverdue = $diff < 0 ? abs((int) $diff) : 0;
        }

        $grandTotal = (int) ($b->grand_total ?? 0);
        $terkumpul  = (int) $b->bookingPayment->sum('nominal');
        $expense    = (int) ($b->expense_internal_total ?? 0);

        return [
            'id'                => $b->id,
            'channel'           => $channel,
            'booking_code'      => $bookingCode,
            'customer'          => $b->user?->name ?? '-',
            'package'           => $b->bookingDetail->first()?->package?->name ?? 'Package',
            'travel_date_start' => $b->travel_date_start,
            'travel_date_end'   => $b->travel_date_end,
            'total_pax'         => $b->total_pax,
            'grand_total'       => $grandTotal,
            'terkumpul'         => $terkumpul,
            'piutang'           => max(0, $grandTotal - $terkumpul),
            'total_expense'     => $expense,
            'profit'            => $grandTotal - $expense,
            'total_debt'        => (int) ($b->total_expense_debt ?? 0),
            'total_paid'        => (int) ($b->total_expense_debt_paid ?? 0),
            'days_overdue'      => $daysOverdue,
        ];
    });

    // ── KPI aggregates ─────────────────────────────────────────────
    $kpiGrandTotal   = (int) $bookings->sum('grand_total');
    $kpiTerkumpul    = (int) $bookings->sum('terkumpul');
    $kpiTotalExpense = (int) $bookings->sum('total_expense');
    $kpiProfit       = $kpiGrandTotal - $kpiTotalExpense;
    $kpiMarginPct    = $kpiGrandTotal > 0 ? round($kpiProfit / $kpiGrandTotal * 100, 1) : 0;
    $kpiHutang       = (int) $bookings->sum('total_debt');

    $kpi = [
        'grand_total'   => $kpiGrandTotal,
        'terkumpul'     => $kpiTerkumpul,
        'piutang'       => max(0, $kpiGrandTotal - $kpiTerkumpul),
        'total_expense' => $kpiTotalExpense,
        'profit'        => $kpiProfit,
        'margin_pct'    => $kpiMarginPct,
        'hutang_vendor' => $kpiHutang,
    ];

    // ── Kebutuhan dana ─────────────────────────────────────────────
    $crewPendingAmount = (int) BookCrewActivity::whereHas('booking', function ($q) use ($year, $month) {
        $q->where('status', 'booked')
          ->where('travel_date_start', 'like', "$year-$month%")
          ->where('crew_transfer_status', 'pending');
    })->sum('subtotal');

    $kebutuhanDana = [
        'hutang_vendor' => $kpiHutang,
        'crew_pending'  => $crewPendingAmount,
        'total'         => $kpiHutang + $crewPendingAmount,
    ];

    // ── Crew summary ───────────────────────────────────────────────
    $crewSummary = [
        'total_crew_expense'   => (int) BookCrewActivity::whereHas('booking', function ($q) use ($year, $month) {
            $q->where('status', 'booked')->where('travel_date_start', 'like', "$year-$month%");
        })->sum('subtotal'),
        'bookings_pending'     => Booking::where('status', 'booked')
            ->where('travel_date_start', 'like', "$year-$month%")
            ->where('crew_transfer_status', 'pending')->count(),
        'bookings_transferred' => Booking::where('status', 'booked')
            ->where('travel_date_start', 'like', "$year-$month%")
            ->where('crew_transfer_status', 'transferred')->count(),
    ];

    // ── Prediction (next month) ────────────────────────────────────
    $nextMonthInt = (int) $month + 1;
    $nextYear     = $nextMonthInt > 12 ? (int) $year + 1 : (int) $year;
    $nextMonth    = str_pad($nextMonthInt > 12 ? 1 : $nextMonthInt, 2, '0', STR_PAD_LEFT);

    $predBookings = Booking::select(
            'id', 'user_id', 'booking_code', 'invoice_code_origin',
            'travel_date_start', 'grand_total', 'agent_id', 'booking_category_id',
            'expense_internal_total', 'total_expense_crew'
        )
        ->with(['user:id,name', 'bookingDetail.package:id,name'])
        ->where('status', 'booked')
        ->where('travel_date_start', 'like', "$nextYear-$nextMonth%")
        ->orderBy('travel_date_start')
        ->get();

    $predRevenue = (int) $predBookings->sum('grand_total');
    $predExpense = (int) $predBookings->sum('expense_internal_total');

    $prediction = [
        'bookings' => $predBookings->map(function ($b) {
            $ch = match(true) {
                $b->agent_id == 1            => 'TWT',
                $b->booking_category_id == 3 => 'KLOOK',
                default                      => 'JVTO',
            };
            $code = in_array($ch, ['TWT', 'KLOOK'])
                ? ($b->invoice_code_origin ?? $b->booking_code)
                : ($b->booking_code ?? $b->invoice_code_origin);
            $exp = (float) ($b->expense_internal_total ?? 0);
            return [
                'id'                => $b->id,
                'booking_code'      => $code,
                'customer'          => $b->user?->name ?? '-',
                'package'           => $b->bookingDetail->first()?->package?->name ?? 'Package',
                'travel_date_start' => $b->travel_date_start,
                'grand_total'       => (int) ($b->grand_total ?? 0),
                'expense'           => (int) $exp,
                'has_expense'       => $exp > 0,
                'channel'           => $ch,
            ];
        })->values()->toArray(),
        'expected_revenue'  => $predRevenue,
        'expected_expense'  => $predExpense,
        'expected_profit'   => $predRevenue - $predExpense,
        'dana_siapkan'      => (int) $predBookings->sum('total_expense_crew'),
        'expense_complete'  => $predBookings->count() > 0
                                && $predBookings->every(fn($b) => (float)($b->expense_internal_total ?? 0) > 0),
    ];

    $months = [
        ['value'=>'01','label'=>'Januari'],  ['value'=>'02','label'=>'Februari'],
        ['value'=>'03','label'=>'Maret'],    ['value'=>'04','label'=>'April'],
        ['value'=>'05','label'=>'Mei'],      ['value'=>'06','label'=>'Juni'],
        ['value'=>'07','label'=>'Juli'],     ['value'=>'08','label'=>'Agustus'],
        ['value'=>'09','label'=>'September'],['value'=>'10','label'=>'Oktober'],
        ['value'=>'11','label'=>'November'], ['value'=>'12','label'=>'Desember'],
    ];

    return Inertia::render('Finance/FinanceHub', [
        'bookings'       => $bookings,
        'kpi'            => $kpi,
        'kebutuhan_dana' => $kebutuhanDana,
        'crew_summary'   => $crewSummary,
        'prediction'     => $prediction,
        'filters'        => compact('month', 'year', 'tab', 'status'),
        'months'         => $months,
        'years'          => [(int)date('Y')-1, (int)date('Y'), (int)date('Y')+1],
    ]);
}
```

- [ ] **Step 2: Verify app boots (no syntax errors)**

```bash
php artisan route:list --path=finance/hub 2>&1 | head -5
```

Expected: route listed, no PHP errors.

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/FinanceController.php
git commit -m "feat: extend financeHub() with revenue, profit, kebutuhan dana, and prediction data"
```

---

## Task 3: Redesign FinanceHub.tsx

**Files:**
- Modify: `resources/js/Pages/Finance/FinanceHub.tsx` (complete rewrite)

This is a full replacement of the file. The `DebtPaymentModal` import and `payTarget` state are kept.

- [ ] **Step 1: Replace the entire file content**

Write the following content to `resources/js/Pages/Finance/FinanceHub.tsx`:

```tsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import {
    AlertTriangle, CheckCircle, DollarSign,
    TrendingDown, TrendingUp, Users, Wallet
} from 'lucide-react';
import DebtPaymentModal from './components/DebtPaymentModal';

// ── Types ──────────────────────────────────────────────────────────

interface BookingRow {
    id: number;
    channel: string;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    travel_date_end: string | null;
    total_pax: number;
    grand_total: number;
    terkumpul: number;
    piutang: number;
    total_expense: number;
    profit: number;
    total_debt: number;
    total_paid: number;
    days_overdue: number;
}

interface Kpi {
    grand_total: number;
    terkumpul: number;
    piutang: number;
    total_expense: number;
    profit: number;
    margin_pct: number;
    hutang_vendor: number;
}

interface KebutuhanDana {
    hutang_vendor: number;
    crew_pending: number;
    total: number;
}

interface CrewSummary {
    total_crew_expense: number;
    bookings_pending: number;
    bookings_transferred: number;
}

interface PredictionBooking {
    id: number;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    grand_total: number;
    expense: number;
    has_expense: boolean;
    channel: string;
}

interface Prediction {
    bookings: PredictionBooking[];
    expected_revenue: number;
    expected_expense: number;
    expected_profit: number;
    dana_siapkan: number;
    expense_complete: boolean;
}

interface Props {
    bookings: BookingRow[];
    kpi: Kpi;
    kebutuhan_dana: KebutuhanDana;
    crew_summary: CrewSummary;
    prediction: Prediction;
    filters: { month: string; year: string; tab: string; status: string };
    months: { value: string; label: string }[];
    years: number[];
}

// ── Helpers ────────────────────────────────────────────────────────

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-blue-100 text-blue-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

function AgingBadge({ days }: { days: number }) {
    if (!days || days <= 0) return null;
    const cls = days > 30
        ? 'bg-red-100 text-red-700'
        : days > 14
        ? 'bg-orange-100 text-orange-700'
        : 'bg-yellow-100 text-yellow-700';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            <AlertTriangle size={11} />
            {days}d overdue
        </span>
    );
}

// ── Page ───────────────────────────────────────────────────────────

export default function FinanceHub({
    bookings, kpi, kebutuhan_dana, crew_summary, prediction, filters, months, years
}: Props) {
    const [f, setF] = useState(filters);
    const [payTarget, setPayTarget] = useState<BookingRow | null>(null);

    const applyFilter = (key: string, value: string) => {
        const next = { ...f, [key]: value };
        setF(next);
        router.get('/finance/hub', next, { preserveState: true, replace: true });
    };

    const isCurrentTab = f.tab !== 'prediction';

    // Margin card color
    const marginColor = kpi.margin_pct >= 30
        ? { border: 'border-green-500', text: 'text-green-700' }
        : kpi.margin_pct >= 15
        ? { border: 'border-yellow-500', text: 'text-yellow-700' }
        : { border: 'border-red-500', text: 'text-red-700' };

    return (
        <Main>
            <Head title="Finance Hub" />
            <div className="p-6 space-y-5">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <h1 className="text-2xl font-bold">Finance Hub</h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        One-stop financial dashboard — profitabilitas, cash flow, dan kebutuhan dana
                    </p>
                </div>

                {/* ── Filters + Tabs ── */}
                <div className="bg-white rounded-xl shadow px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Period filters */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Bulan</label>
                            <select value={f.month} onChange={e => applyFilter('month', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                            <select value={f.year} onChange={e => applyFilter('year', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                            </select>
                        </div>
                        {/* Status filter — only for current tab */}
                        {isCurrentTab && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status Hutang</label>
                                <select value={f.status} onChange={e => applyFilter('status', e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                    <option value="all">Semua</option>
                                    <option value="has_debt">Ada Hutang</option>
                                    <option value="fully_paid">Lunas</option>
                                </select>
                            </div>
                        )}
                        {/* Tab switcher */}
                        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => applyFilter('tab', 'current')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    isCurrentTab ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Bulan Ini
                            </button>
                            <button
                                onClick={() => applyFilter('tab', 'prediction')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    !isCurrentTab ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Prediksi Bulan Depan
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    TAB 1: BULAN INI
                ════════════════════════════════════════════════════ */}
                {isCurrentTab && (
                    <>
                        {/* ── 6 KPI Cards (2 rows) ── */}
                        {/* Row 1: Revenue side */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    label: 'Grand Total',
                                    sub: `${bookings.length} booking`,
                                    value: kpi.grand_total,
                                    Icon: DollarSign,
                                    border: 'border-blue-500',
                                    text: 'text-blue-700',
                                },
                                {
                                    label: 'Terkumpul',
                                    sub: kpi.grand_total > 0
                                        ? `${Math.round(kpi.terkumpul / kpi.grand_total * 100)}% terbayar`
                                        : '0%',
                                    value: kpi.terkumpul,
                                    Icon: CheckCircle,
                                    border: 'border-green-500',
                                    text: 'text-green-700',
                                },
                                {
                                    label: 'Piutang Customer',
                                    sub: 'belum masuk',
                                    value: kpi.piutang,
                                    Icon: TrendingDown,
                                    border: 'border-orange-500',
                                    text: 'text-orange-700',
                                },
                            ].map(card => (
                                <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <card.Icon size={15} className={card.text} />
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                    </div>
                                    <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: Expense/P&L side */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown size={15} className="text-red-700" />
                                    <p className="text-xs text-gray-500">Total Expense</p>
                                </div>
                                <p className="text-xl font-bold text-red-700">{rp(kpi.total_expense)}</p>
                            </div>
                            <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${marginColor.border}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={15} className={marginColor.text} />
                                    <p className="text-xs text-gray-500">Profit Kotor</p>
                                </div>
                                <p className={`text-xl font-bold ${marginColor.text}`}>{rp(kpi.profit)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{kpi.margin_pct}% margin</p>
                            </div>
                            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-amber-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={15} className="text-amber-700" />
                                    <p className="text-xs text-gray-500">Hutang Vendor</p>
                                </div>
                                <p className="text-xl font-bold text-amber-700">{rp(kpi.hutang_vendor)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">outstanding</p>
                            </div>
                        </div>

                        {/* ── Kebutuhan Dana ── */}
                        <div className="bg-white rounded-xl shadow px-6 py-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet size={16} className="text-indigo-600" />
                                <h2 className="font-semibold text-sm text-gray-700">Kebutuhan Dana Mendesak</h2>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">Hutang Vendor (outstanding)</span>
                                        <a
                                            href={`/finance/rekap-hutang?month=${f.month}&year=${f.year}`}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            lihat →
                                        </a>
                                    </div>
                                    <span className="font-semibold text-red-600">{rp(kebutuhan_dana.hutang_vendor)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Crew Transfer Pending</span>
                                    <span className="font-semibold text-orange-600">{rp(kebutuhan_dana.crew_pending)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 bg-indigo-50 rounded-lg px-3 mt-1">
                                    <span className="text-sm font-medium text-gray-700">Total perlu disiapkan</span>
                                    <span className="text-lg font-bold text-indigo-700">{rp(kebutuhan_dana.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Crew Summary Bar ── */}
                        <div className="bg-white rounded-xl shadow px-5 py-3 flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users size={15} className="text-indigo-600" />
                                <span className="font-medium text-gray-700">Crew Expense Bulan Ini</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="font-bold text-indigo-700">{rp(crew_summary.total_crew_expense)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Belum Transfer</p>
                                    <p className="font-bold text-red-600">{crew_summary.bookings_pending} booking</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Sudah Transfer</p>
                                    <p className="font-bold text-green-600">{crew_summary.bookings_transferred} booking</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Booking Table (enhanced) ── */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="px-6 py-3 border-b">
                                <h2 className="font-semibold text-gray-700 text-sm">
                                    Booking ({bookings.length} trip)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-indigo-700 text-white text-xs uppercase">
                                        <tr>
                                            {[
                                                'Booking', 'Customer', 'Tgl',
                                                'Grand Total', 'Terkumpul', 'Piutang',
                                                'Expense', 'Profit', 'Hutang', 'Aging', 'Aksi'
                                            ].map(h => (
                                                <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan={11} className="text-center py-10 text-gray-400">
                                                    Tidak ada data untuk periode ini
                                                </td>
                                            </tr>
                                        )}
                                        {bookings.map(row => (
                                            <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-3 py-2.5">
                                                    <p className="font-medium text-xs">{row.booking_code}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {row.channel}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-xs">{row.customer}</td>
                                                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-blue-700">{rp(row.grand_total)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-green-700">{rp(row.terkumpul)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-orange-600">{rp(row.piutang)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs">{rp(row.total_expense)}</td>
                                                <td className={`px-3 py-2.5 text-right text-xs font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    {rp(row.profit)}
                                                </td>
                                                <td className="px-3 py-2.5 text-right text-xs text-red-600 font-semibold">{rp(row.total_debt)}</td>
                                                <td className="px-3 py-2.5">
                                                    <AgingBadge days={row.days_overdue} />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {row.total_debt > 0 && (
                                                            <button
                                                                onClick={() => setPayTarget(row)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                Bayar
                                                            </button>
                                                        )}
                                                        <a
                                                            href={`/finance/cockpit/${row.id}`}
                                                            className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            Detail →
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════════════════════════════════════════════════
                    TAB 2: PREDIKSI BULAN DEPAN
                ════════════════════════════════════════════════════ */}
                {!isCurrentTab && (
                    <>
                        {!prediction.expense_complete && prediction.bookings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 text-sm text-yellow-800 flex items-center gap-2">
                                <AlertTriangle size={15} />
                                Beberapa booking belum diisi expense — angka prediksi mungkin belum akurat.
                            </div>
                        )}

                        {/* 4 Prediction KPI cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'Expected Revenue',
                                    value: prediction.expected_revenue,
                                    sub: `${prediction.bookings.length} booking confirmed`,
                                    Icon: DollarSign,
                                    border: 'border-blue-500',
                                    text: 'text-blue-700',
                                },
                                {
                                    label: 'Expected Expense',
                                    value: prediction.expected_expense,
                                    sub: prediction.expense_complete ? 'data lengkap' : '⚠ belum lengkap',
                                    Icon: TrendingDown,
                                    border: 'border-red-500',
                                    text: 'text-red-700',
                                },
                                {
                                    label: 'Expected Profit',
                                    value: prediction.expected_profit,
                                    sub: prediction.expected_revenue > 0
                                        ? `${Math.round(prediction.expected_profit / prediction.expected_revenue * 100)}% margin`
                                        : '',
                                    Icon: TrendingUp,
                                    border: prediction.expected_profit >= 0 ? 'border-green-500' : 'border-red-500',
                                    text: prediction.expected_profit >= 0 ? 'text-green-700' : 'text-red-700',
                                },
                                {
                                    label: 'Dana Siapkan (Crew)',
                                    value: prediction.dana_siapkan,
                                    sub: 'total_expense_crew bulan depan',
                                    Icon: Wallet,
                                    border: 'border-indigo-500',
                                    text: 'text-indigo-700',
                                },
                            ].map(card => (
                                <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <card.Icon size={15} className={card.text} />
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                    </div>
                                    <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                                    {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Prediction booking table */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="px-6 py-3 border-b">
                                <h2 className="font-semibold text-gray-700 text-sm">
                                    Booking Bulan Depan ({prediction.bookings.length} trip confirmed)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-indigo-700 text-white text-xs uppercase">
                                        <tr>
                                            {['Booking', 'Customer', 'Tanggal Trip', 'Grand Total', 'Expense', 'Status Expense', 'Aksi'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {prediction.bookings.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-10 text-gray-400">
                                                    Belum ada booking untuk bulan depan
                                                </td>
                                            </tr>
                                        )}
                                        {prediction.bookings.map(row => (
                                            <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium text-xs">{row.booking_code}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {row.channel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-xs">{row.customer}</td>
                                                <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                                <td className="px-4 py-2.5 text-right text-xs font-medium text-blue-700">{rp(row.grand_total)}</td>
                                                <td className="px-4 py-2.5 text-right text-xs">{row.expense > 0 ? rp(row.expense) : '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    {row.has_expense ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle size={11} /> Sudah Diisi
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                                            <AlertTriangle size={11} /> Belum Diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <a
                                                        href={`/finance/cockpit/${row.id}`}
                                                        className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Detail →
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* DebtPaymentModal — kept from previous implementation */}
            {payTarget && (
                <DebtPaymentModal
                    booking={payTarget}
                    onClose={() => setPayTarget(null)}
                    onSuccess={() => {
                        setPayTarget(null);
                        router.reload();
                    }}
                />
            )}
        </Main>
    );
}
```

- [ ] **Step 2: Build and fix any TypeScript errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ built in X.XXs` — no TypeScript errors. The chunk size warning is pre-existing and can be ignored.

If errors appear, the most likely cause is a type mismatch between the new `Props` interface and what the controller sends. Fix the types to match.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Finance/FinanceHub.tsx
git commit -m "feat: redesign Finance Hub with tab dashboard, 6 KPI cards, kebutuhan dana, and prediction"
```

---

## Verification

- [ ] `npm run build 2>&1 | tail -5` → no errors
- [ ] Open `/finance/hub` → default tab "Bulan Ini" shows
- [ ] 6 KPI cards visible in 2 rows (Grand Total, Terkumpul, Piutang / Total Expense, Profit, Hutang Vendor)
- [ ] Profit card changes color: green if margin ≥ 30%, yellow 15–29%, red < 15%
- [ ] Kebutuhan Dana section shows Hutang Vendor + Crew Pending with total
- [ ] "lihat →" link on Hutang Vendor navigates to `/finance/rekap-hutang` with correct month/year
- [ ] Booking table has new columns: Grand Total, Terkumpul, Piutang, Profit
- [ ] TWT booking shows `invoice_code_origin` (not `booking_code`) in both Finance Hub and Finance Cockpit
- [ ] Click "Prediksi Bulan Depan" tab → prediction cards and table appear
- [ ] Prediction tab shows `dana_siapkan` = sum(total_expense_crew) of next month bookings
- [ ] Bookings with `expense_internal_total = 0` show "Belum Diisi" yellow badge in prediction tab
- [ ] Switching back to "Bulan Ini" tab restores the original view
- [ ] "Bayar" button still works (opens DebtPaymentModal)
- [ ] "Detail →" link still navigates to Finance Cockpit
