<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\PriceCategory;
use Illuminate\Http\Request;

class ExportDataPriceTiers extends Controller
{
    function priceTiers(){
        $priceTiers = PriceCategory::orderBy('id','asc');
        if(request()->limit){
            $priceTiers = $priceTiers->limit(request()->limit);
        }
        $priceTiers = $priceTiers
        ->get()->map(function($data){
            return [
                'id' => $data->id,
                'name' => $data->temp_text,
                'uuid' => $data->uuid,
                'min_pax' => (int)$data->start,
                'max_pax' => $data->end ? (int)$data->end : null,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at' => $data->deleted_at,
            ];
        })->toArray();
        $columns = ['id','name','uuid','min_pax','max_pax','created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('price_tiers.csv', $columns, $priceTiers);
    }
}
