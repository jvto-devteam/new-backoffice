<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportDataDiscount extends Controller
{
    protected string $firstDate;
    protected array $packageIds;
    public function __construct()
    {
        $this->firstDate = Carbon::now()->subMonths(12)->toDateString(); //17-09-2024
        $this->packageIds = [73, 48, 47, 29, 28, 85, 65, 86, 91, 63, 80, 32, 33, 34, 54, 56, 43, 55, 74, 82, 83, 84];
    }

    function discount()
    {
        $discount = Discount::with('booking')
            ->where(function ($query) {
                // ambil yang ada booking dengan kondisi tertentu
                $query->whereHas('booking', function ($q) {
                    $q->where('status', 'booked')
                        ->where('travel_date_start', '>=', $this->firstDate)
                        ->whereHas('bookingDetail', function ($qq) {
                            $qq->whereNull('package_id')
                                ->orWhereIn('package_id', $this->packageIds);
                        });
                })
                    // ATAU booking_id null
                    ->orWhereNull('booking_id');
            })
            ->orderBy('id', 'asc');
        if (request()->limit) {
            $discount = $discount->limit(request()->limit);
        }
        $discount = $discount
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'amount' => $data->disc,
                    'type' => $data->type,
                    'customer_id' => $data->user_id,
                    'booking_id' => $data->booking_id,
                    'valid_until' => $data->valid_until,
                    'verification_code' => $data->verification_code,
                    'is_verified' => $data->is_verif == '1' ? true : false,
                    'is_used' => $data->is_used == '1' ? true : false,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            });
        $columns = ['id', 'name', 'amount', 'type', 'customer_id', 'booking_id', 'valid_until', 'verification_code', 'is_verified', 'is_used', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('discounts.csv', $columns, $discount);
    }
}
