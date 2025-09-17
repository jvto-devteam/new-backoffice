<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;

class ExportDataDestinations extends Controller
{
    function destinations(){
        $destinations = Destination::with('destinationDetail')->where('is_publish', '1')->orderBy('id','asc');
        
        if(request()->limit){
            $destinations = $destinations->limit(request()->limit);
        }
        $destinations = $destinations
        ->get()
        ->map(function ($data) {
            return [
                'id' => $data->id,
                'name' => $data->name,
                'thumbnail_url' => '/img/destinations/'.$data->thumbnail,
                'description' => $data->description,
                'weather_by_season' => $data->destinationDetail->weather_by_season ?? null,
                'rainfall_intensity' => $data->destinationDetail->rainfall_intensity ?? null,
                'trail_details' => $data->destinationDetail->trail_details ?? null,
                'required_gear' => $data->destinationDetail->required_gear ?? null,
                'difficulty_level' => $data->destinationDetail->difficulty_level ?? null,
                'environmental_factors' => $data->destinationDetail->environmental_factors ?? null,
                'physical_requirements' => $data->destinationDetail->physical_requirements ?? null,
                'main_attractions' => $data->destinationDetail->main_attractions ?? null,
                'best_time_to_visit' => $data->destinationDetail->best_time_to_visit ?? null,
                'tips_for_visitors' => $data->destinationDetail->tips_for_visitors ?? null,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at' => $data->deleted_at,
            ];
        })->toArray();
        $columns = ['id', 'name', 'thumbnail_url', 'description', 'weather_by_season', 'rainfall_intensity', 'trail_details', 'required_gear', 'difficulty_level', 'environmental_factors', 'physical_requirements', 'main_attractions', 'best_time_to_visit', 'tips_for_visitors', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('destinations.csv', $columns, $destinations);
    }
}
