<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportDataDiscount extends Controller
{
    protected string $firstDate;
    public function __construct()
    {
        $this->firstDate = Carbon::now()->subMonths(12)->toDateString();//16-09-2024
    }

    function discount(){
        $discount = Discount::with('booking')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id','desc');
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
        return ExportCSV::export('discounts.csv', $columns, $discount);
    }
}
