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

        $revenue      = (int) ($booking->grand_total ?? 0);
        $totalExpense = (int) ($booking->expense_internal_total ?? 0);
        $margin       = $revenue - $totalExpense;
        $marginPct    = $revenue > 0 ? round($margin / $revenue * 100, 1) : 0;

        $expenseRows = [];

        // 1. Hotels
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

        // 4. Crew (CrewRole has field 'role', no vendor_id)
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

        // Customer payments (global scope is_paid='1' already applied; amount field = 'nominal')
        $customerPayments = $booking->bookingPayment->map(fn($p) => [
            'date'   => $p->created_at?->format('d M Y') ?? '-',
            'method' => $p->paymentMethod?->name ?? '-',
            'amount' => (int) ($p->nominal ?? 0),
        ])->values()->toArray();
        $customerPaymentTotal = (int) $booking->bookingPayment->sum('nominal');

        // Vendor payment history
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

        $totalCrewExpense = (int) BookCrewActivity::where('booking_id', $bookingId)->sum('subtotal');

        return Inertia::render('Finance/FinanceCockpit', [
            'booking' => [
                'id'                   => $booking->id,
                'booking_code'         => in_array($channel, ['TWT', 'KLOOK'])
                                           ? ($booking->invoice_code_origin ?? $booking->booking_code)
                                           : ($booking->booking_code ?? $booking->invoice_code_origin),
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

        // Direct assignment — Booking is fully guarded, cannot use update([])
        $booking->crew_transfer_status = 'transferred';
        $booking->crew_transfer_date   = $request->transfer_date;
        $booking->crew_transfer_proof  = $proofPath;
        $booking->save();

        return redirect()->route('finance.cockpit', $bookingId)
            ->with('success', 'Crew transfer berhasil dicatat.');
    }
}
