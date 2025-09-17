<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\OrderChannel;
use Illuminate\Http\Request;

class ExportDataOrderChannels extends Controller
{
    function orderChannels(){
        $orderChannels = OrderChannel::orderBy('id', 'asc');
        if (request()->limit) {
            $orderChannels = $orderChannels->limit(request()->limit);
        }
        $orderChannels = $orderChannels
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'short_name' => null,
                    'name' => $data->name,
                    'icon' => null,
                    'username' => null,
                    'password' => null,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'short_name','name','icon','username','password', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('order_channels.csv', $columns, $orderChannels);
    }
}
