# Finance Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/finance/cockpit/{bookingId}` — a per-booking financial overview page with P&L summary, all expense items, customer/vendor payment history, and crew transfer tracking; plus a crew summary bar in Finance Hub.

**Architecture:** New `FinanceCockpitController` (namespace `App\Http\Controllers\Finance`) with `show()` and `markCrewTransfer()`. All data queries follow the existing FinanceController pattern (direct model queries, not Booking relationships). One migration adds 3 crew transfer columns to `bookings`. `FinanceCockpit.tsx` is a read-only page with one mutation (crew transfer via `router.post()`). Finance Hub gains a crew summary bar and a "Detail →" link per booking row.

**Tech Stack:** Laravel 11, PHP 8.2, React 18 + TypeScript, Inertia.js, Tailwind CSS, Lucide icons, `@/Layouts/Main`

---

## Context

Sub-Plan 1 (Finance Hub at `/finance/hub`) is already complete on branch `dev-finance`. This plan builds on top of it.

**Key existing facts:**
- `Booking` model: `bookHotel()` and `bookingPayment()` relationships exist. Activity tables (`BookDestinationActivity`, `BookCarActivity`, `BookCrewActivity`, `BookOthersActivity`) must be queried directly — no Booking relationship methods exist for them.
- `BookingPayment` model has a global scope `is_paid='1'` — always filters to paid-only records. Amount field is `nominal` (not `amount`).
- `BookCrewActivity.crewRole()` → `CrewRole`. `CrewRole` has field `role` (not `name`), no `vendor_id`.
- `Booking` model is fully guarded — use direct property assignment + `save()`, NOT `update([...])`.
- `Storage` and `Inertia` already imported in `FinanceController` — use same imports in new controller.
- `app/Http/Controllers/Finance/` directory does NOT yet exist — must be created.
- `BookingExpenseService` exists at `app/Services/BookingExpenseService.php` (Sub-Plan 1).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| CREATE | `database/migrations/2026_05_08_XXXXXX_add_crew_transfer_fields_to_bookings.php` | 3 new columns on bookings |
| CREATE | `app/Http/Controllers/Finance/FinanceCockpitController.php` | `show()` + `markCrewTransfer()` |
| CREATE | `resources/js/Pages/Finance/FinanceCockpit.tsx` | Full page UI |
| CREATE | `resources/js/Pages/Finance/components/CrewTransferModal.tsx` | Crew transfer modal |
| MODIFY | `routes/web.php` | +2 routes (GET cockpit, POST crew-transfer) |
| MODIFY | `resources/js/Pages/Finance/FinanceHub.tsx` | +Detail link per row + crew summary bar |
| MODIFY | `app/Http/Controllers/FinanceController.php` | Add `crew_summary` to `financeHub()` |
| MODIFY | `resources/js/Pages/Finance/EditExpenseManager.tsx` | +Cockpit link in header |

---

## Task 1: Migration — Crew Transfer Columns

**Files:**
- Create: `database/migrations/2026_05_08_XXXXXX_add_crew_transfer_fields_to_bookings.php`

- [ ] **Step 1: Generate the migration**

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/new-backoffice
php artisan make:migration add_crew_transfer_fields_to_bookings --table=bookings
```

- [ ] **Step 2: Fill in the generated migration file**

Open the generated file (in `database/migrations/`) and replace the `up()` and `down()` methods:

```php
public function up(): void
{
    Schema::table('bookings', function (Blueprint $table) {
        $table->enum('crew_transfer_status', ['pending', 'transferred'])
              ->default('pending')
              ->after('total_expense_debt_paid');
        $table->date('crew_transfer_date')->nullable()->after('crew_transfer_status');
        $table->string('crew_transfer_proof')->nullable()->after('crew_transfer_date');
    });
}

public function down(): void
{
    Schema::table('bookings', function (Blueprint $table) {
        $table->dropColumn(['crew_transfer_status', 'crew_transfer_date', 'crew_transfer_proof']);
    });
}
```

- [ ] **Step 3: Run the migration**

```bash
php artisan migrate
```

Expected output:
```
Running migrations.
  2026_05_08_XXXXXX_add_crew_transfer_fields_to_bookings ........ DONE
```

- [ ] **Step 4: Verify columns exist**

```bash
php artisan tinker --execute="
\$cols = \Illuminate\Support\Facades\Schema::getColumnListing('bookings');
echo in_array('crew_transfer_status', \$cols) ? 'OK: crew_transfer_status' : 'MISSING: crew_transfer_status';
echo PHP_EOL;
echo in_array('crew_transfer_proof', \$cols) ? 'OK: crew_transfer_proof' : 'MISSING: crew_transfer_proof';
"
```

Expected:
```
OK: crew_transfer_status
OK: crew_transfer_proof
```

- [ ] **Step 5: Commit**

```bash
git add database/migrations/
git commit -m "feat: add crew_transfer_status, crew_transfer_date, crew_transfer_proof to bookings"
```

---

## Task 2: FinanceCockpitController + Routes

**Files:**
- Create: `app/Http/Controllers/Finance/FinanceCockpitController.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Create the controller directory and file**

```bash
mkdir -p app/Http/Controllers/Finance
```

Create `app/Http/Controllers/Finance/FinanceCockpitController.php`:

```php
<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookHotel;
use App\Models\BookingPayment;
use App\Models\BookOthersActivity;
use App\Models\DebtPaymentDetail;
use App\Models\ExpenseAdditional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FinanceCockpitController extends Controller
{
    public function show(int $bookingId): Response
    {
        $booking = Booking::with([
            'user:id,name',
            'bookingDetail.package:id,name',
            'bookHotel.bookRoom',
            'bookHotel.bookHotelMeal',
            'bookHotel.hotel:id,name',
            'bookingPayment.paymentMethod:id,name',
        ])->findOrFail($bookingId);

        $channel = match(true) {
            $booking->agent_id == 1            => 'TWT',
            $booking->booking_category_id == 3 => 'KLOOK',
            default                            => 'JVTO',
        };

        // ── Summary ───────────────────────────────────────────────
        $revenue      = (int) ($booking->grand_total ?? 0);
        $totalExpense = (int) ($booking->expense_internal_total ?? 0);
        $margin       = $revenue - $totalExpense;
        $marginPct    = $revenue > 0 ? round($margin / $revenue * 100, 1) : 0;

        // ── Expense rows from 6 sources ───────────────────────────
        $expenseRows = [];

        // 1. Hotels (rooms + meals via $bh->total accessor)
        foreach ($booking->bookHotel as $bh) {
            $amount = (int) ($bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));
            $expenseRows[] = [
                'type'        => 'hotel',
                'description' => $bh->hotel?->name ?? 'Hotel',
                'amount'      => $amount,
                'is_debt'     => $bh->is_debt === '1',
                'is_paid'     => !is_null($bh->debt_payment_id),
            ];
        }

        // 2. Destination activities
        $activities = BookDestinationActivity::with(['destinationActivity:id,name'])
            ->where('booking_id', $bookingId)->get();
        foreach ($activities as $a) {
            $expenseRows[] = [
                'type'        => 'activity',
                'description' => $a->destinationActivity?->name ?? 'Aktivitas',
                'amount'      => (int) $a->subtotal,
                'is_debt'     => $a->is_debt === '1',
                'is_paid'     => !is_null($a->debt_payment_id),
            ];
        }

        // 3. Cars
        $cars = BookCarActivity::with(['car:id,name'])
            ->where('booking_id', $bookingId)->get();
        foreach ($cars as $c) {
            $expenseRows[] = [
                'type'        => 'car',
                'description' => $c->car?->name ?? 'Mobil',
                'amount'      => (int) $c->subtotal,
                'is_debt'     => $c->is_debt === '1',
                'is_paid'     => !is_null($c->debt_payment_id),
            ];
        }

        // 4. Crew
        $crews = BookCrewActivity::with(['crewRole:id,role'])
            ->where('booking_id', $bookingId)->get();
        foreach ($crews as $cr) {
            $expenseRows[] = [
                'type'        => 'crew',
                'description' => $cr->crewRole?->role ?? 'Crew',
                'amount'      => (int) $cr->subtotal,
                'is_debt'     => $cr->is_debt === '1',
                'is_paid'     => !is_null($cr->debt_payment_id),
            ];
        }

        // 5. Others
        $others = BookOthersActivity::with(['othersActivity:id,name'])
            ->where('booking_id', $bookingId)->get();
        foreach ($others as $o) {
            $expenseRows[] = [
                'type'        => 'others',
                'description' => $o->othersActivity?->name ?? 'Lainnya',
                'amount'      => (int) $o->subtotal,
                'is_debt'     => $o->is_debt === '1',
                'is_paid'     => !is_null($o->debt_payment_id),
            ];
        }

        // 6. Expense additionals (always is_debt=false)
        $additionals = ExpenseAdditional::where('booking_id', $bookingId)->get();
        foreach ($additionals as $ea) {
            $expenseRows[] = [
                'type'        => 'additional',
                'description' => $ea->item ?? 'Tambahan',
                'amount'      => (int) ($ea->subtotal ?? 0),
                'is_debt'     => false,
                'is_paid'     => false,
            ];
        }

        // ── Customer payments ─────────────────────────────────────
        $customerPayments = $booking->bookingPayment->map(fn($p) => [
            'date'   => $p->created_at?->format('d M Y') ?? '-',
            'method' => $p->paymentMethod?->name ?? '-',
            'amount' => (int) ($p->nominal ?? 0),
        ])->values()->toArray();
        $customerPaymentTotal = (int) $booking->bookingPayment->sum('nominal');

        // ── Vendor payment history ────────────────────────────────
        $vendorPayments = DebtPaymentDetail::with(['payment.paymentMethod', 'payment.vendor:id,name'])
            ->where('booking_id', $bookingId)
            ->get()
            ->map(fn($d) => [
                'payment_number' => $d->payment?->payment_number ?? '-',
                'vendor_name'    => $d->payment?->vendor?->name ?? '-',
                'amount'         => (int) $d->amount,
                'payment_date'   => $d->payment?->payment_date?->format('d M Y') ?? '-',
                'method'         => $d->payment?->paymentMethod?->name ?? '-',
                'proof_url'      => $d->payment?->payment_proof
                                    ? Storage::url($d->payment->payment_proof)
                                    : null,
            ])->values()->toArray();

        // ── Crew transfer ─────────────────────────────────────────
        $totalCrewExpense = (int) BookCrewActivity::where('booking_id', $bookingId)->sum('subtotal');

        return Inertia::render('Finance/FinanceCockpit', [
            'booking' => [
                'id'                   => $booking->id,
                'booking_code'         => $booking->booking_code ?? $booking->invoice_code_origin,
                'customer'             => $booking->user?->name ?? '-',
                'package'              => $booking->bookingDetail->first()?->package?->name ?? 'Package',
                'travel_date_start'    => $booking->travel_date_start,
                'travel_date_end'      => $booking->travel_date_end,
                'total_pax'            => $booking->total_pax,
                'channel'              => $channel,
                'crew_transfer_status' => $booking->crew_transfer_status ?? 'pending',
                'crew_transfer_date'   => $booking->crew_transfer_date,
                'crew_transfer_proof'  => $booking->crew_transfer_proof
                                         ? Storage::url($booking->crew_transfer_proof)
                                         : null,
            ],
            'summary' => [
                'revenue'          => $revenue,
                'total_expense'    => $totalExpense,
                'margin'           => $margin,
                'margin_pct'       => $marginPct,
                'outstanding_debt' => (int) ($booking->total_expense_debt ?? 0),
            ],
            'expense_rows'           => $expenseRows,
            'customer_payments'      => $customerPayments,
            'customer_payment_total' => $customerPaymentTotal,
            'vendor_payments'        => $vendorPayments,
            'total_crew_expense'     => $totalCrewExpense,
        ]);
    }

    public function markCrewTransfer(Request $request, int $bookingId): RedirectResponse
    {
        $request->validate([
            'transfer_date' => 'required|date',
            'proof_file'    => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $booking = Booking::findOrFail($bookingId);

        if ($booking->crew_transfer_status === 'transferred') {
            return redirect()->route('finance.cockpit', $bookingId)
                ->with('error', 'Crew transfer sudah dicatat sebelumnya.');
        }

        $proofPath = $request->file('proof_file')->store('crew_transfer_proofs', 'public');

        // Direct property assignment — Booking is fully guarded, cannot use update([])
        $booking->crew_transfer_status = 'transferred';
        $booking->crew_transfer_date   = $request->transfer_date;
        $booking->crew_transfer_proof  = $proofPath;
        $booking->save();

        return redirect()->route('finance.cockpit', $bookingId)
            ->with('success', 'Crew transfer berhasil dicatat.');
    }
}
```

- [ ] **Step 2: Add routes to routes/web.php**

Find the existing finance prefix group (search for `Route::get('/hub'`). Add immediately after the hub routes:

```php
Route::get('/cockpit/{bookingId}', [\App\Http\Controllers\Finance\FinanceCockpitController::class, 'show'])->name('finance.cockpit');
Route::post('/cockpit/{bookingId}/crew-transfer', [\App\Http\Controllers\Finance\FinanceCockpitController::class, 'markCrewTransfer'])->name('finance.cockpit.crew-transfer');
```

- [ ] **Step 3: Verify routes**

```bash
php artisan route:list | grep cockpit
```

Expected:
```
GET|HEAD  finance/cockpit/{bookingId}                   finance.cockpit › Finance\FinanceCockpitController@show
POST      finance/cockpit/{bookingId}/crew-transfer     finance.cockpit.crew-transfer › Finance\FinanceCockpitController@markCrewTransfer
```

- [ ] **Step 4: Verify app boots (no syntax errors)**

```bash
php artisan route:list --path=finance 2>&1 | head -5
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Finance/ routes/web.php
git commit -m "feat: add FinanceCockpitController with show() and markCrewTransfer()"
```

---

## Task 3: CrewTransferModal Component

**Files:**
- Create: `resources/js/Pages/Finance/components/CrewTransferModal.tsx`

> **Note:** Created before FinanceCockpit.tsx (Task 4) so the import resolves cleanly on first build.

- [ ] **Step 1: Create the modal**

```tsx
import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';

interface Props {
    bookingId: number;
    totalCrewExpense: number;
    onClose: () => void;
}

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function CrewTransferModal({ bookingId, totalCrewExpense, onClose }: Props) {
    const [transferDate, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [proofFile, setFile]    = useState<File | null>(null);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!transferDate || !proofFile) {
            setError('Tanggal dan bukti transfer wajib diisi.');
            return;
        }

        const fd = new FormData();
        fd.append('transfer_date', transferDate);
        fd.append('proof_file', proofFile);

        setLoading(true);
        router.post(
            `/finance/cockpit/${bookingId}/crew-transfer`,
            fd,
            {
                forceFormData: true,
                onSuccess: () => { onClose(); },
                onError: (errors) => {
                    setError(Object.values(errors).join(' '));
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-base font-semibold">Tandai Crew Transfer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Tanggal Transfer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={transferDate}
                            onChange={e => setDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Bukti Transfer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF · max 5MB</p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Crew Expense</span>
                        <span className="font-bold text-indigo-700">{rp(totalCrewExpense)}</span>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify file saved correctly**

```bash
php artisan route:list --path=finance/cockpit 2>&1 | head -3
# Just confirms app still boots — no TS check needed until full build
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Finance/components/CrewTransferModal.tsx
git commit -m "feat: add CrewTransferModal for marking crew expense transfer with proof upload"
```

---

## Task 4: FinanceCockpit.tsx — Main Page

**Files:**
- Create: `resources/js/Pages/Finance/FinanceCockpit.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import {
    AlertTriangle, CheckCircle, DollarSign,
    TrendingDown, TrendingUp, Users
} from 'lucide-react';
import CrewTransferModal from './components/CrewTransferModal';

// ── Types ──────────────────────────────────────────────────────────

interface BookingInfo {
    id: number;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    travel_date_end: string | null;
    total_pax: number;
    channel: string;
    crew_transfer_status: 'pending' | 'transferred';
    crew_transfer_date: string | null;
    crew_transfer_proof: string | null;
}

interface Summary {
    revenue: number;
    total_expense: number;
    margin: number;
    margin_pct: number;
    outstanding_debt: number;
}

interface ExpenseRow {
    type: 'hotel' | 'activity' | 'car' | 'crew' | 'others' | 'additional';
    description: string;
    amount: number;
    is_debt: boolean;
    is_paid: boolean;
}

interface CustomerPayment {
    date: string;
    method: string;
    amount: number;
}

interface VendorPayment {
    payment_number: string;
    vendor_name: string;
    amount: number;
    payment_date: string;
    method: string;
    proof_url: string | null;
}

interface Props {
    booking: BookingInfo;
    summary: Summary;
    expense_rows: ExpenseRow[];
    customer_payments: CustomerPayment[];
    customer_payment_total: number;
    vendor_payments: VendorPayment[];
    total_crew_expense: number;
}

// ── Helpers ────────────────────────────────────────────────────────

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-blue-100 text-blue-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

const TYPE_ICONS: Record<string, string> = {
    hotel: '🏨',
    activity: '📍',
    car: '🚗',
    crew: '👤',
    others: '📦',
    additional: '➕',
};

function StatusBadge({ isDebt, isPaid }: { isDebt: boolean; isPaid: boolean }) {
    if (!isDebt) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                INTERNAL
            </span>
        );
    }
    if (isPaid) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle size={11} /> LUNAS
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle size={11} /> HUTANG
        </span>
    );
}

// ── Page ───────────────────────────────────────────────────────────

export default function FinanceCockpit({
    booking,
    summary,
    expense_rows,
    customer_payments,
    customer_payment_total,
    vendor_payments,
    total_crew_expense,
}: Props) {
    const [showCrewModal, setShowCrewModal] = useState(false);

    const travelMonth = booking.travel_date_start?.slice(0, 7).replace('-', '/') ?? '';
    const hubUrl = `/finance/hub?month=${booking.travel_date_start?.slice(5, 7) ?? ''}&year=${booking.travel_date_start?.slice(0, 4) ?? ''}`;

    return (
        <Main>
            <Head title={`Finance Cockpit — ${booking.booking_code}`} />
            <div className="p-6 space-y-5">

                {/* ── Nav bar ── */}
                <div className="flex items-center justify-between bg-white rounded-xl shadow px-5 py-3">
                    <a href={hubUrl} className="text-sm text-indigo-600 hover:underline">
                        ← Finance Hub
                    </a>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/finance/expense-manager/${booking.id}/edit`}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            Edit Expense
                        </a>
                        <a
                            href={`/bookings/details/${booking.id}`}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            Lihat Booking
                        </a>
                    </div>
                </div>

                {/* ── Booking header ── */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold">{booking.booking_code}</h1>
                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${CHANNEL_COLORS[booking.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {booking.channel}
                                </span>
                            </div>
                            <p className="text-indigo-100 text-sm">{booking.customer} · {booking.package}</p>
                            <p className="text-indigo-200 text-xs mt-1">
                                {booking.travel_date_start}
                                {booking.travel_date_end ? ` – ${booking.travel_date_end}` : ''}
                                {' · '}{booking.total_pax} pax
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Summary cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Revenue', value: rp(summary.revenue), Icon: DollarSign, border: 'border-blue-500', text: 'text-blue-700' },
                        { label: 'Total Expense', value: rp(summary.total_expense), Icon: TrendingDown, border: 'border-orange-500', text: 'text-orange-700' },
                        {
                            label: 'Margin',
                            value: `${rp(summary.margin)} (${summary.margin_pct}%)`,
                            Icon: TrendingUp,
                            border: summary.margin >= 0 ? 'border-green-500' : 'border-red-500',
                            text: summary.margin >= 0 ? 'text-green-700' : 'text-red-700',
                        },
                        { label: 'Hutang Outstanding', value: rp(summary.outstanding_debt), Icon: AlertTriangle, border: 'border-red-500', text: 'text-red-700' },
                    ].map(card => (
                        <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <card.Icon size={15} className={card.text} />
                                <p className="text-xs text-gray-500">{card.label}</p>
                            </div>
                            <p className={`text-lg font-bold ${card.text}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Expense items table ── */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-5 py-3 border-b">
                        <h2 className="font-semibold text-sm text-gray-700">
                            Expense Items ({expense_rows.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase">
                                <tr>
                                    {['Tipe', 'Deskripsi', 'Jumlah', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {expense_rows.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada expense</td></tr>
                                )}
                                {expense_rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="mr-1">{TYPE_ICONS[row.type]}</span>
                                            <span className="text-gray-500 text-xs capitalize">{row.type}</span>
                                        </td>
                                        <td className="px-4 py-3">{row.description}</td>
                                        <td className="px-4 py-3 text-right font-medium">{rp(row.amount)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge isDebt={row.is_debt} isPaid={row.is_paid} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Crew transfer section ── */}
                <div className="bg-white rounded-xl shadow px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-indigo-600" />
                            <h2 className="font-semibold text-sm text-gray-700">Crew Transfer</h2>
                        </div>
                        {booking.crew_transfer_status === 'pending' && (
                            <button
                                onClick={() => setShowCrewModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                                Tandai Transfer
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-0.5">Total Crew Expense</p>
                            <p className="text-lg font-bold text-gray-800">{rp(total_crew_expense)}</p>
                        </div>
                        <div className="border-l pl-4">
                            <p className="text-xs text-gray-500 mb-0.5">Status</p>
                            {booking.crew_transfer_status === 'transferred' ? (
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                        <CheckCircle size={11} /> Sudah Transfer
                                    </span>
                                    {booking.crew_transfer_date && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {booking.crew_transfer_date}
                                            {booking.crew_transfer_proof && (
                                                <> ·{' '}
                                                    <a
                                                        href={booking.crew_transfer_proof}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        lihat bukti
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    <AlertTriangle size={11} /> Belum Transfer
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── History tables (2 columns) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Customer payments */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-5 py-3 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-sm text-gray-700">Pembayaran Customer</h2>
                            <span className="text-xs text-gray-500">Total: {rp(customer_payment_total)}</span>
                        </div>
                        {customer_payments.length === 0 ? (
                            <p className="text-center py-6 text-gray-400 text-sm">Belum ada pembayaran</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        {['Tanggal', 'Metode', 'Jumlah'].map(h => (
                                            <th key={h} className="px-4 py-2 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customer_payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-500">{p.date}</td>
                                            <td className="px-4 py-2">{p.method}</td>
                                            <td className="px-4 py-2 text-right font-medium text-green-700">{rp(p.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Vendor payments */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-5 py-3 border-b">
                            <h2 className="font-semibold text-sm text-gray-700">Pembayaran Vendor</h2>
                        </div>
                        {vendor_payments.length === 0 ? (
                            <p className="text-center py-6 text-gray-400 text-sm">Belum ada pembayaran vendor</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        {['No. Bayar', 'Vendor', 'Tgl', 'Jumlah', ''].map((h, i) => (
                                            <th key={i} className="px-4 py-2 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {vendor_payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-xs font-mono">{p.payment_number}</td>
                                            <td className="px-4 py-2">{p.vendor_name}</td>
                                            <td className="px-4 py-2 text-gray-500 text-xs">{p.payment_date}</td>
                                            <td className="px-4 py-2 text-right font-medium">{rp(p.amount)}</td>
                                            <td className="px-4 py-2">
                                                {p.proof_url && (
                                                    <a href={p.proof_url} target="_blank" rel="noreferrer"
                                                       className="text-xs text-indigo-600 hover:underline">
                                                        bukti
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Crew transfer modal */}
            {showCrewModal && (
                <CrewTransferModal
                    bookingId={booking.id}
                    totalCrewExpense={total_crew_expense}
                    onClose={() => setShowCrewModal(false)}
                />
            )}
        </Main>
    );
}
```

- [ ] **Step 2: Build and check for TypeScript errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes. If `CrewTransferModal` import fails (file doesn't exist yet), temporarily comment it out and the `showCrewModal` state usage. Uncomment in Task 4.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Finance/FinanceCockpit.tsx
git commit -m "feat: add FinanceCockpit.tsx page with summary cards, expense table, crew section, history"
```

---

## Task 5: Finance Hub Updates (crew summary bar + Detail link)

**Files:**
- Modify: `app/Http/Controllers/FinanceController.php` (the `financeHub()` method, around line 3006)
- Modify: `resources/js/Pages/Finance/FinanceHub.tsx`

- [ ] **Step 1: Add crew_summary to financeHub() controller**

Find the `financeHub()` method. Locate where `$summary` is assembled (after the bookings query). Add the crew summary calculation before the `return Inertia::render(...)` call:

```php
// Add these use statements at the top of FinanceController if not already present:
// use App\Models\BookCrewActivity; — check if already imported, it is (line 10)

$crewSummary = [
    'total_crew_expense'   => (int) BookCrewActivity::whereHas('booking', function ($q) use ($year, $month) {
                                  $q->where('status', 'booked')
                                    ->where('travel_date_start', 'like', "$year-$month%");
                              })->sum('subtotal'),
    'bookings_pending'     => Booking::where('status', 'booked')
                                  ->where('travel_date_start', 'like', "$year-$month%")
                                  ->where('crew_transfer_status', 'pending')
                                  ->count(),
    'bookings_transferred' => Booking::where('status', 'booked')
                                  ->where('travel_date_start', 'like', "$year-$month%")
                                  ->where('crew_transfer_status', 'transferred')
                                  ->count(),
];
```

Then add `'crew_summary' => $crewSummary` to the `Inertia::render()` props array in `financeHub()`. The existing return looks like:

```php
return Inertia::render('Finance/FinanceHub', [
    'bookings' => $bookings,
    'summary'  => $summary,
    'filters'  => compact('month', 'year', 'view', 'status'),
    'months'   => $months,
    'years'    => [(int)date('Y')-1, (int)date('Y'), (int)date('Y')+1],
]);
```

Add `'crew_summary' => $crewSummary,` to this array.

- [ ] **Step 2: Update FinanceHub.tsx — add types and crew_summary prop**

Open `resources/js/Pages/Finance/FinanceHub.tsx`. Add the `CrewSummary` interface and add it to the `Props` interface:

```tsx
interface CrewSummary {
    total_crew_expense: number;
    bookings_pending: number;
    bookings_transferred: number;
}

// Add to existing Props interface:
// crew_summary: CrewSummary;
```

Update the `Props` interface to include `crew_summary: CrewSummary`.

Update the function signature destructuring to include `crew_summary`.

- [ ] **Step 3: Add crew summary bar in FinanceHub.tsx — between summary cards and the booking table**

Find the `{/* Table */}` section comment (or the `<div className="bg-white rounded-xl shadow overflow-hidden">` that contains the booking table). Insert the crew summary bar BEFORE it:

```tsx
{/* Crew Summary Bar */}
<div className="bg-white rounded-xl shadow px-5 py-3 flex items-center gap-6 text-sm">
    <div className="flex items-center gap-2 text-gray-500">
        <span className="text-base">👤</span>
        <span className="font-medium text-gray-700">Crew Expense Bulan Ini</span>
    </div>
    <div className="flex items-center gap-6 ml-2">
        <div>
            <span className="text-xs text-gray-400">Total</span>
            <p className="font-bold text-indigo-700">{rp(crew_summary.total_crew_expense)}</p>
        </div>
        <div>
            <span className="text-xs text-gray-400">Belum Transfer</span>
            <p className="font-bold text-red-600">{crew_summary.bookings_pending} booking</p>
        </div>
        <div>
            <span className="text-xs text-gray-400">Sudah Transfer</span>
            <p className="font-bold text-green-600">{crew_summary.bookings_transferred} booking</p>
        </div>
    </div>
</div>
```

- [ ] **Step 4: Add "Detail →" link in the booking table action cell**

In `FinanceHub.tsx`, find the `<td className="px-4 py-3">` that contains the "Bayar" button:

```tsx
<td className="px-4 py-3">
    {row.total_debt > 0 && (
        <button onClick={() => setPayTarget(row)} ...>
            Bayar
        </button>
    )}
</td>
```

Replace with:

```tsx
<td className="px-4 py-3">
    <div className="flex items-center gap-2">
        {row.total_debt > 0 && (
            <button
                onClick={() => setPayTarget(row)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            >
                Bayar
            </button>
        )}
        <a
            href={`/finance/cockpit/${row.id}`}
            className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
        >
            Detail →
        </a>
    </div>
</td>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors.

- [ ] **Step 6: Smoke test the controller update**

```bash
php artisan route:list --path=finance/hub 2>&1 | head -5
```

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/FinanceController.php resources/js/Pages/Finance/FinanceHub.tsx
git commit -m "feat: add crew summary bar and Detail link to Finance Hub"
```

---

## Task 6: EditExpenseManager Link + Final Build

**Files:**
- Modify: `resources/js/Pages/Finance/EditExpenseManager.tsx`

- [ ] **Step 1: Find the header/nav area in EditExpenseManager.tsx**

```bash
grep -n "href\|back\|kembali\|Finance\|header" resources/js/Pages/Finance/EditExpenseManager.tsx | head -20
```

Find where the page title or back-navigation is rendered. It will be near the top of the JSX.

- [ ] **Step 2: Add Finance Cockpit link**

In the header area (next to any existing back button or title), add:

```tsx
<a
    href={`/finance/cockpit/${bookingId}`}
    className="inline-flex items-center gap-1 text-sm text-indigo-600 border border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
>
    Finance Cockpit →
</a>
```

Note: The `bookingId` prop name might differ in EditExpenseManager. Run this first to confirm:
```bash
grep -n "bookingId\|booking_id\|booking\.id\|props\." resources/js/Pages/Finance/EditExpenseManager.tsx | head -10
```
Use the actual variable name from the component.

- [ ] **Step 3: Final build**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs` — no errors.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Finance/EditExpenseManager.tsx
git commit -m "feat: add Finance Cockpit link to EditExpenseManager header"
```

---

## Verification

Run all checks in order:

- [ ] `php artisan route:list | grep cockpit` → 2 routes
- [ ] `php artisan migrate:status | grep crew_transfer` → shows as "Ran" (or verify via tinker)
- [ ] `npm run build 2>&1 | tail -5` → no errors
- [ ] Open `/finance/hub` → crew summary bar visible with correct month data
- [ ] Open `/finance/hub` → each booking row has "Detail →" link
- [ ] Click "Detail →" → `/finance/cockpit/{id}` renders without error
- [ ] Cockpit: 4 summary cards show correct numbers (verify revenue = booking.grand_total)
- [ ] Cockpit: expense table has rows from multiple types (hotel/crew/activity etc.)
- [ ] Cockpit: crew transfer section shows "Belum Transfer" (red badge) for new bookings
- [ ] Click "Tandai Transfer" → modal opens
- [ ] Fill date + upload file → submit → page reloads → badge turns green "Sudah Transfer"
- [ ] Proof link appears and opens the uploaded file
- [ ] Try clicking "Tandai Transfer" again → impossible (button not rendered)
- [ ] Click "← Finance Hub" → returns to `/finance/hub` with correct month filter
- [ ] Click "Edit Expense" in Cockpit → opens EditExpenseManager for same booking
- [ ] In EditExpenseManager → "Finance Cockpit →" link is visible and navigates correctly
