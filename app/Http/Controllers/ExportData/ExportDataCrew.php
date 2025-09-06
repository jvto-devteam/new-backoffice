<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\CrewRole;
use App\Models\GuideDriver;
use Illuminate\Http\Request;

class ExportDataCrew extends Controller
{
    function crewRoles(){
        $role = CrewRole::with('orderChannel')->orderBy('role', 'asc')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'name' => $query->role,
                'rate_per_day' => (int)$query->rate,
                'rate_twt_per_day' => (int)$query->rate_twt,
                'order_channel_id' => $query->order_channel_id,
                'created_at' => $query->created_at,
                'updated_at' => $query->updated_at,
                'deleted_at' => $query->deleted_at,
            ];
        });
        $columns = ['id', 'name', 'rate_per_day', 'rate_twt_per_day', 'order_channel_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('crew_roles.csv', $columns, $role);
    }
    function crewMember(){
        $crew = GuideDriver::orderBy('name', 'asc')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'name' => $query->name,
                'email' => $query->email,
                'type' => $query->is_driver == '1' ? 'driver' : 'guide',
                'tags' => $query->tags,
                'phone' => $query->phone,
                'photo_url' => $query->photo ? '/img/guide/'.$query->photo : '/img/guide/default.jpg',
                'created_at' => $query->created_at,
                'updated_at' => $query->updated_at,
                'deleted_at' => $query->deleted_at,
            ];
        });
        $columns = ['id', 'name', 'email', 'type', 'phone', 'photo_url', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('crew_members.csv', $columns, $crew);
    }
}
