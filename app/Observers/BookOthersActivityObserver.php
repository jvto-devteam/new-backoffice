<?php

namespace App\Observers;

use App\Models\BookOthersActivity;
use App\Services\BookingExpenseService;

class BookOthersActivityObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(BookOthersActivity $model): void
    {
        // Only recalculate if debt-related fields actually changed
        if ($model->wasChanged(['is_debt', 'debt_payment_id'])) {
            $this->service->recalculate($model->booking_id);
        }
    }

    public function deleted(BookOthersActivity $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
