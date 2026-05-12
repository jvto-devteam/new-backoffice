<?php

namespace App\Observers;

use App\Models\BookDestinationActivity;
use App\Services\BookingExpenseService;

class BookDestinationActivityObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(BookDestinationActivity $model): void
    {
        // Only recalculate if debt-related fields actually changed
        if ($model->wasChanged(['is_debt', 'debt_payment_id'])) {
            $this->service->recalculate($model->booking_id);
        }
    }

    public function deleted(BookDestinationActivity $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
