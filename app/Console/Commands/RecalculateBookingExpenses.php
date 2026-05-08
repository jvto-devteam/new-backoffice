<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\BookingExpenseService;
use Illuminate\Console\Command;

class RecalculateBookingExpenses extends Command
{
    protected $signature   = 'finance:recalculate-expenses {--booking-id= : Recalculate a single booking only}';
    protected $description = 'Backfill total_expense_debt and total_expense_debt_paid on all active bookings';

    public function handle(BookingExpenseService $service): int
    {
        $bookingId = $this->option('booking-id');

        if ($bookingId) {
            $service->recalculate((int) $bookingId);
            $this->info("Recalculated booking #{$bookingId}");
            return self::SUCCESS;
        }

        $query = Booking::where('status', 'booked');
        $count = $query->count();
        $this->info("Recalculating {$count} bookings...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $query->chunkById(100, function ($bookings) use ($service, $bar) {
            foreach ($bookings as $booking) {
                $service->recalculate($booking->id);
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Done.');

        return self::SUCCESS;
    }
}
