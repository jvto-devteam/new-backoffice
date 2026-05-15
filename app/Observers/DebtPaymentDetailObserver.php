<?php

namespace App\Observers;

use App\Models\DebtPaymentDetail;
use App\Services\BookingExpenseService;

class DebtPaymentDetailObserver
{
    public function __construct(private BookingExpenseService $service) {}

    public function saved(DebtPaymentDetail $model): void
    {
        $this->service->recalculate($model->booking_id);
    }

    public function deleted(DebtPaymentDetail $model): void
    {
        $this->service->recalculate($model->booking_id);
    }
}
