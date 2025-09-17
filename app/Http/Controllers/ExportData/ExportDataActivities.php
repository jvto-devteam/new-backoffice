<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityEnd;
use App\Models\ActivityStart;
use App\Models\DestinationActivity;
use App\Models\OthersActivity;
use Illuminate\Http\Request;

class ExportDataActivities extends Controller
{
    function activities()
    {
        $activities = Activity::orderBy('id', 'asc');
        if (request()->limit) {
            $activities = $activities->limit(request()->limit);
        }
        $activities = $activities
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'code' => $data->activity_code,
                    'activity_category_id' => $data->activity_category_id,
                    'activity_name' => $data->name,
                    'destination_id' => $data->destination_id,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'code', 'activity_category_id', 'activity_name', 'destination_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('activities.csv', $columns, $activities);
    }

    function activity_categories()
    {
        $activity_categories = ActivityCategory::orderBy('id', 'asc');
        if (request()->limit) {
            $activity_categories = $activity_categories->limit(request()->limit);
        }
        $activity_categories = $activity_categories
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'icon' => $data->icon,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'name', 'icon', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('activity_categories.csv', $columns, $activity_categories);
    }

    function otherActivities()
    {
        $otherActivities = OthersActivity::orderBy('id', 'asc');
        if (request()->limit) {
            $otherActivities = $otherActivities->limit(request()->limit);
        }
        $otherActivities = $otherActivities
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'code' => $data->other_activity_code,
                    'vendor_id' => $data->vendor_id,
                    'name' => $data->name,
                    'unit' => $data->unit,
                    'formula' => $data->formula,
                    'price' => (int)$data->price,
                    'is_twt' => $data->is_twt == '1' ? true : false,
                    'is_default_jvto' => $data->is_default == '1' ? true : false,
                    'is_default_klook' => $data->is_default == '1' ? true : false,
                    'is_default_twt' => $data->is_default == '1' ? true : false,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
            $columns = [
                'id',
                'code',
                'vendor_id',
                'name',
                'unit',
                'formula',
                'price',
                'is_twt',
                'is_default_jvto',
                'is_default_klook',
                'is_default_twt',
                'created_at',
                'updated_at',
                'deleted_at'
            ];
        return ExportSQL::export('other_activities.csv', $columns, $otherActivities);
    }

    function destinationActivities()
    {
        $destinationActivities = DestinationActivity::orderBy('id', 'asc');
        if (request()->limit) {
            $destinationActivities = $destinationActivities->limit(request()->limit);
        }
        $destinationActivities = $destinationActivities
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id, 
                    'code' => $data->destination_activity_code, 
                    'destination_id' => $data->destination_id, 
                    'vendor_id' => $data->vendor_id, 
                    'name' => $data->name, 
                    'unit' => $data->unit, 
                    'formula' => $data->formula, 
                    'price' => (int)$data->price, 
                    'is_twt' => $data->is_twt == '1' ? true : false, 
                    'is_default_jvto' => $data->is_default_jvto == '1' ? true : false, 
                    'is_default_klook' => $data->is_default_klook == '1' ? true : false, 
                    'is_default_twt' => $data->is_default_twt == '1' ? true : false, 
                    'created_at' => $data->created_at, 
                    'updated_at' => $data->updated_at, 
                    'deleted_at' => $data->deleted_at, 
                ];
            })->toArray();
            $columns = [
                'id',
                'code',
                'destination_id',
                'vendor_id',
                'name',
                'unit',
                'formula',
                'price',
                'is_twt',
                'is_default_jvto',
                'is_default_klook',
                'is_default_twt',
                'created_at',
                'updated_at',
                'deleted_at',
            ];
        return ExportSQL::export('destination_activities.csv', $columns, $destinationActivities);
    }
    function activityStarts()
    {
        $activityStarts = ActivityStart::orderBy('id', 'asc');
        if (request()->limit) {
            $activityStarts = $activityStarts->limit(request()->limit);
        }
        $activityStarts = $activityStarts
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id, 
                    'name' => $data->name, 
                    'description' => $data->description, 
                    'destination_id' => $data->destination_id, 
                    'breakfast' => $data->b, 
                    'lunch' => $data->l, 
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'name', 'description','destination_id','breakfast','lunch', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('activity_starts.csv', $columns, $activityStarts);
    }
    function activityEnds()
    {
        $activityEnds = ActivityEnd::orderBy('id', 'asc');
        if (request()->limit) {
            $activityEnds = $activityEnds->limit(request()->limit);
        }
        $activityEnds = $activityEnds
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id, 
                    'name' => $data->name, 
                    'description' => $data->description, 
                    'destination_id' => $data->destination_id, 
                    'dinner' => $data->d, 
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'name', 'description','destination_id','dinner','created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('activity_ends.csv', $columns, $activityEnds);
    }

}
