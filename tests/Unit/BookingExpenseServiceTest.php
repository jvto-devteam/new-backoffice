<?php

use App\Services\BookingExpenseService;
use Illuminate\Database\Eloquent\Collection;

uses(Tests\TestCase::class);

/**
 * Unit tests for BookingExpenseService::recalculate()
 *
 * Uses Mockery alias mocks to intercept static Eloquent calls without
 * requiring a live database connection.
 */
describe('BookingExpenseService', function () {

    afterEach(function () {
        Mockery::close();
    });

    it('sets total_expense_debt from unpaid debt activity (is_debt=1, debt_payment_id=null)', function () {
        $bookingId = 1;
        $subtotal  = 500000;

        // --- Booking ---
        $booking = Mockery::mock('alias:App\Models\Booking');
        $booking->shouldReceive('find')
            ->with($bookingId)
            ->once()
            ->andReturn($booking);
        $booking->shouldReceive('updateQuietly')
            ->once()
            ->withArgs(function ($data) use ($subtotal) {
                return $data['total_expense_debt'] == $subtotal
                    && $data['total_expense_debt_paid'] == 0;
            });

        // --- BookHotel: no records ---
        $bh = Mockery::mock('alias:App\Models\BookHotel');
        $bh->shouldReceive('with->where->where->whereNull->get')
            ->andReturn(new Collection());
        $bh->shouldReceive('with->where->where->whereNotNull->get')
            ->andReturn(new Collection());

        // --- BookDestinationActivity: unpaid=$subtotal, paid=0 ---
        $bda = Mockery::mock('alias:App\Models\BookDestinationActivity');
        $bda->shouldReceive('where->where->whereNull->sum')
            ->with('subtotal')->andReturn($subtotal);
        $bda->shouldReceive('where->where->whereNotNull->sum')
            ->with('subtotal')->andReturn(0);

        // --- BookCarActivity: 0 ---
        $bca = Mockery::mock('alias:App\Models\BookCarActivity');
        $bca->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $bca->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        // --- BookCrewActivity: 0 ---
        $bcrew = Mockery::mock('alias:App\Models\BookCrewActivity');
        $bcrew->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $bcrew->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        // --- BookOthersActivity: 0 ---
        $boa = Mockery::mock('alias:App\Models\BookOthersActivity');
        $boa->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $boa->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        (new BookingExpenseService())->recalculate($bookingId);
    });

    it('sets total_expense_debt_paid when debt activity is paid (is_debt=1, debt_payment_id not null)', function () {
        $bookingId = 2;
        $subtotal  = 750000;

        // --- Booking ---
        $booking = Mockery::mock('alias:App\Models\Booking');
        $booking->shouldReceive('find')
            ->with($bookingId)
            ->once()
            ->andReturn($booking);
        $booking->shouldReceive('updateQuietly')
            ->once()
            ->withArgs(function ($data) use ($subtotal) {
                return $data['total_expense_debt'] == 0
                    && $data['total_expense_debt_paid'] == $subtotal;
            });

        // --- BookHotel: no records ---
        $bh = Mockery::mock('alias:App\Models\BookHotel');
        $bh->shouldReceive('with->where->where->whereNull->get')
            ->andReturn(new Collection());
        $bh->shouldReceive('with->where->where->whereNotNull->get')
            ->andReturn(new Collection());

        // --- BookDestinationActivity: unpaid=0, paid=$subtotal ---
        $bda = Mockery::mock('alias:App\Models\BookDestinationActivity');
        $bda->shouldReceive('where->where->whereNull->sum')
            ->with('subtotal')->andReturn(0);
        $bda->shouldReceive('where->where->whereNotNull->sum')
            ->with('subtotal')->andReturn($subtotal);

        // --- BookCarActivity: 0 ---
        $bca = Mockery::mock('alias:App\Models\BookCarActivity');
        $bca->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $bca->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        // --- BookCrewActivity: 0 ---
        $bcrew = Mockery::mock('alias:App\Models\BookCrewActivity');
        $bcrew->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $bcrew->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        // --- BookOthersActivity: 0 ---
        $boa = Mockery::mock('alias:App\Models\BookOthersActivity');
        $boa->shouldReceive('where->where->whereNull->sum')->with('subtotal')->andReturn(0);
        $boa->shouldReceive('where->where->whereNotNull->sum')->with('subtotal')->andReturn(0);

        (new BookingExpenseService())->recalculate($bookingId);
    });

    it('does nothing when booking is not found', function () {
        $booking = Mockery::mock('alias:App\Models\Booking');
        $booking->shouldReceive('find')
            ->with(9999)
            ->once()
            ->andReturn(null);

        // No further model calls should occur
        (new BookingExpenseService())->recalculate(9999);

        expect(true)->toBeTrue();
    });
});
