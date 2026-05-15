<?php

namespace App\Observers;

use App\Models\BookHotel;
use App\Services\BookingExpenseService;

class BookHotelObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(BookHotel $model): void
    {
        // Only recalculate if debt-related fields actually changed
        if ($model->wasChanged(['is_debt', 'debt_payment_id'])) {
            $this->service->recalculate($model->booking_id);
        }
    }

    public function deleted(BookHotel $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
