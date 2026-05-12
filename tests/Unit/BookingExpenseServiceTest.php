<?php

namespace Tests\Unit;

use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookHotel;
use App\Models\BookOthersActivity;
use App\Services\BookingExpenseService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Unit tests for BookingExpenseService::recalculate()
 *
 * Uses a test-double subclass to override the protected seam methods,
 * eliminating the need for alias mocks and avoiding process-isolation issues.
 */
class BookingExpenseServiceTest extends TestCase
{
    // -------------------------------------------------------------------------
    // Helper: build a minimal Booking-like stub without hitting the DB
    // -------------------------------------------------------------------------
    private function makeBookingStub(int $id): Model
    {
        /** @var Model $stub */
        $stub = $this->getMockBuilder(Model::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['saveQuietly'])
            ->getMock();

        $stub->expects($this->once())->method('saveQuietly');

        return $stub;
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    #[Test]
    public function it_sets_total_expense_debt_from_unpaid_debt_activity(): void
    {
        $bookingId = 1;
        $subtotal  = 500000;
        $booking   = $this->makeBookingStub($bookingId);

        $svc = new class($booking, $subtotal, 0) extends BookingExpenseService {
            public function __construct(
                private Model $booking,
                private int|float $unpaid,
                private int|float $paid,
            ) {}

            protected function findBooking(int $bookingId) { return $this->booking; }

            protected function fetchDebtHotels(int $bookingId): Collection
            {
                return new Collection();
            }

            protected function sumActivityDebt(string $modelClass, int $bookingId): int|float
            {
                return $modelClass === BookDestinationActivity::class ? $this->unpaid : 0;
            }

            protected function sumActivityPaid(string $modelClass, int $bookingId): int|float
            {
                return $modelClass === BookDestinationActivity::class ? $this->paid : 0;
            }
        };

        $svc->recalculate($bookingId);

        $this->assertSame($subtotal, $booking->total_expense_debt);
        $this->assertSame(0, $booking->total_expense_debt_paid);
    }

    #[Test]
    public function it_sets_total_expense_debt_paid_when_debt_activity_is_paid(): void
    {
        $bookingId = 2;
        $subtotal  = 750000;
        $booking   = $this->makeBookingStub($bookingId);

        $svc = new class($booking, 0, $subtotal) extends BookingExpenseService {
            public function __construct(
                private Model $booking,
                private int|float $unpaid,
                private int|float $paid,
            ) {}

            protected function findBooking(int $bookingId) { return $this->booking; }

            protected function fetchDebtHotels(int $bookingId): Collection
            {
                return new Collection();
            }

            protected function sumActivityDebt(string $modelClass, int $bookingId): int|float
            {
                return $modelClass === BookDestinationActivity::class ? $this->unpaid : 0;
            }

            protected function sumActivityPaid(string $modelClass, int $bookingId): int|float
            {
                return $modelClass === BookDestinationActivity::class ? $this->paid : 0;
            }
        };

        $svc->recalculate($bookingId);

        $this->assertSame(0, $booking->total_expense_debt);
        $this->assertSame($subtotal, $booking->total_expense_debt_paid);
    }

    #[Test]
    public function it_does_nothing_when_booking_is_not_found(): void
    {
        $svc = new class extends BookingExpenseService {
            protected function findBooking(int $bookingId) { return null; }
        };

        // Should return early without calling any query or save methods
        $svc->recalculate(9999);

        $this->assertTrue(true);
    }
}
