<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\AddOn;
use Illuminate\Http\Request;

class ExportDataAddons extends Controller
{
    function addons(){
        $addons = AddOn::orderBy('id','asc');
        if(request()->limit){
            $addons = $addons->limit(request()->limit);
        }
        $addons = $addons
        ->get()->map(function($data){
            return [
                'id' => $data->id,
                'name' => $data->add_on,
                'is_transport' => $data->is_transport,
                'transport_type' => $data->type_transport,
                'image' => $data->img ? '/img/addons/'.$data->img : null,
                'price' => (int)$data->price,
                'is_per_person' => $data->is_transport == '1' ? false : true,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at' => $data->deleted_at,
            ];
        })->toArray();
        $columns = ['id','name','is_transport','transport_type','image','price','is_per_person','created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('addons.csv', $columns, $addons);
    }
}
