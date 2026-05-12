<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookHotel;
use App\Models\BookOthersActivity;
use Illuminate\Database\Eloquent\Collection;

class BookingExpenseService
{
    /**
     * Recalculate total_expense_debt and total_expense_debt_paid
     * from live data across all 5 activity tables.
     * Uses direct property assignment + saveQuietly to avoid both
     * MassAssignmentException and Booking's own observers.
     */
    public function recalculate(int $bookingId): void
    {
        $booking = $this->findBooking($bookingId);
        if (!$booking) {
            return;
        }

        // Hotels: rooms + meals both belong to the BookHotel record.
        // Fetch all debt-flagged hotels once to avoid race condition.
        $allDebtHotels = $this->fetchDebtHotels($bookingId);

        $hotelDebt = $allDebtHotels->filter(fn($bh) => is_null($bh->debt_payment_id))
            ->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));

        $totalDebt = $hotelDebt
            + $this->sumActivityDebt(BookDestinationActivity::class, $bookingId)
            + $this->sumActivityDebt(BookCarActivity::class, $bookingId)
            + $this->sumActivityDebt(BookCrewActivity::class, $bookingId)
            + $this->sumActivityDebt(BookOthersActivity::class, $bookingId);

        // Paid portion: is_debt='1' AND debt_payment_id IS NOT NULL
        $hotelPaid = $allDebtHotels->filter(fn($bh) => !is_null($bh->debt_payment_id))
            ->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));

        $totalPaid = $hotelPaid
            + $this->sumActivityPaid(BookDestinationActivity::class, $bookingId)
            + $this->sumActivityPaid(BookCarActivity::class, $bookingId)
            + $this->sumActivityPaid(BookCrewActivity::class, $bookingId)
            + $this->sumActivityPaid(BookOthersActivity::class, $bookingId);

        $booking->total_expense_debt      = $totalDebt;
        $booking->total_expense_debt_paid = $totalPaid;
        $booking->saveQuietly();
    }

    // -------------------------------------------------------------------------
    // Seam methods — override in subclasses or test doubles
    // -------------------------------------------------------------------------

    /** @return Booking|null */
    protected function findBooking(int $bookingId)
    {
        return Booking::find($bookingId);
    }

    /** @return Collection */
    protected function fetchDebtHotels(int $bookingId): Collection
    {
        return BookHotel::with(['bookRoom', 'bookHotelMeal'])
            ->where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->get();
    }

    protected function sumActivityDebt(string $modelClass, int $bookingId): int|float
    {
        return $modelClass::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNull('debt_payment_id')
            ->sum('subtotal');
    }

    protected function sumActivityPaid(string $modelClass, int $bookingId): int|float
    {
        return $modelClass::where('booking_id', $bookingId)
            ->where('is_debt', '1')
            ->whereNotNull('debt_payment_id')
            ->sum('subtotal');
    }
}
