<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class ExportDataCustomer extends Controller
{
    function customers(){
        $customers = Booking::with('user')->where('status','booked')->where('travel_date_start','>=','2024-09-01')->get()->map(function($query){
            return [
                'id' => $query->user->id,
                'name' => $query->user->name,
                'email' => $query->user->email,
                'phone' => $query->user->phone,
                'country_id' => $query->user->country_id,
                'google_id' => $query->user->google_id,
                'created_at' => $query->user->created_at,
                'updated_at' => $query->user->updated_at,
                'deleted_at' => $query->user->deleted_at,
            ];
        })->unique('id')->values()->toArray();
        $columns = ['id', 'name', 'email', 'phone', 'country_id', 'google_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('customers.csv', $columns, $customers);
    }
}
