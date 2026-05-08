<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookHotel;
use App\Models\BookOthersActivity;

class BookingExpenseService
{
    /**
     * Recalculate total_expense_debt and total_expense_debt_paid
     * from live data across all 5 activity tables.
     * Uses updateQuietly to avoid triggering Booking's own observers.
     */
    public function recalculate(int $bookingId): void
    {
        $booking = Booking::find($bookingId);
        if (!$booking) {
            return;
        }

        // Hotels: rooms + meals both belong to the BookHotel record
        // Fetch all debt-flagged hotels once to avoid race condition
        $allDebtHotels = BookHotel::with(['bookRoom', 'bookHotelMeal'])
            ->where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->get();

        $hotelDebt = $allDebtHotels->filter(fn($bh) => is_null($bh->debt_payment_id))
            ->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));

        $activityDebt = BookDestinationActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNull('debt_payment_id')
            ->sum('subtotal');

        $carDebt = BookCarActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNull('debt_payment_id')
            ->sum('subtotal');

        $crewDebt = BookCrewActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNull('debt_payment_id')
            ->sum('subtotal');

        $othersDebt = BookOthersActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNull('debt_payment_id')
            ->sum('subtotal');

        $totalDebt = $hotelDebt + $activityDebt + $carDebt + $crewDebt + $othersDebt;

        // Paid portion: is_debt='1' AND debt_payment_id IS NOT NULL
        $hotelPaid = $allDebtHotels->filter(fn($bh) => !is_null($bh->debt_payment_id))
            ->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));

        $activityPaid = BookDestinationActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')->whereNotNull('debt_payment_id')->sum('subtotal');

        $carPaid = BookCarActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')->whereNotNull('debt_payment_id')->sum('subtotal');

        $crewPaid = BookCrewActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')->whereNotNull('debt_payment_id')->sum('subtotal');

        $othersPaid = BookOthersActivity::where('booking_id', $bookingId)
            ->where('is_debt', '1')->whereNotNull('debt_payment_id')->sum('subtotal');

        $totalPaid = $hotelPaid + $activityPaid + $carPaid + $crewPaid + $othersPaid;

        $booking->updateQuietly([
            'total_expense_debt'      => $totalDebt,
            'total_expense_debt_paid' => $totalPaid,
        ]);
    }
}
