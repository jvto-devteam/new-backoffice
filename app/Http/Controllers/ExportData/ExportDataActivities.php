<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;

class ExportDataActivities extends Controller
{
    function activities(){
        $activities = Activity::orderBy('id','asc');
        if(request()->limit){
            $activities = $activities->limit(request()->limit);
        }
        $activities = $activities
            ->get()->map(function($data){
                return [
                    'id' => $data->id,
                    'code' => $data->activity_code,
                    'activity_categori_id' => $data->activity_categori_id,
                    'activity_name' => $data->name,
                    'destination_id' => $data->destination_id,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id','code','activity_categori_id','activity_name','destination_id','created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('activities.csv', $columns, $activities);

    }

    function activity_categories(){
        $activity_categories = ActivityCategory::orderBy('id','asc');
        if(request()->limit){
            $activity_categories = $activity_categories->limit(request()->limit);
        }
        $activity_categories = $activity_categories
            ->get()->map(function($data){
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'icon' => $data->icon,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id','name','icon', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('activity_categories.csv', $columns, $activity_categories);

    }
}
