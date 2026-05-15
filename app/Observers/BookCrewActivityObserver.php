<?php

namespace App\Observers;

use App\Models\BookCrewActivity;
use App\Services\BookingExpenseService;

class BookCrewActivityObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(BookCrewActivity $model): void
    {
        // Only recalculate if debt-related fields actually changed
        if ($model->wasChanged(['is_debt', 'debt_payment_id'])) {
            $this->service->recalculate($model->booking_id);
        }
    }

    public function deleted(BookCrewActivity $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
