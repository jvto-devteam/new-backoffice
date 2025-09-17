<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class ExportDataPaymentMethods extends Controller
{
    function paymentMethods(){
        $paymentMethods = PaymentMethod::orderBy('id','asc');
        if(request()->limit){
            $paymentMethods = $paymentMethods->limit(request()->limit);
        }
        $paymentMethods = $paymentMethods
            ->get()->map(function($data){
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'account_number' => $data->number,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id','name','account_number', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('payment_methods.csv', $columns, $paymentMethods);
    }
}
