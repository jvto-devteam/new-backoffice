<?php

namespace App\Observers;

use App\Models\BookCarActivity;
use App\Services\BookingExpenseService;

class BookCarActivityObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(BookCarActivity $model): void
    {
        // Only recalculate if debt-related fields actually changed
        if ($model->wasChanged(['is_debt', 'debt_payment_id'])) {
            $this->service->recalculate($model->booking_id);
        }
    }

    public function deleted(BookCarActivity $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
