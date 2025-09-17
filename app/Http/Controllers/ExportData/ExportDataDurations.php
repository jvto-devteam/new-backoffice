<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Duration;
use Illuminate\Http\Request;

class ExportDataDurations extends Controller
{
    function durations(){
        $durations = Duration::orderBy('id','asc');
        if(request()->limit){
            $durations = $durations->limit(request()->limit);
        }
        $durations = $durations
            ->get()->map(function($data){
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'day' => $data->day,
                    'night' => $data->night,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id','name','day','night', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('durations.csv', $columns, $durations);
    }
}
