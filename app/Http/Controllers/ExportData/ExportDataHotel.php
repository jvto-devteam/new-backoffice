<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\RoomHotel;

class ExportDataHotel extends Controller
{
    public function roomTypes()
    {
        $roomTypes = RoomHotel::whereHas('hotel', function ($query) {
            $query->where('is_publish', 1);
        })
            ->orderBy('hotel_id')
            ->get()
            ->map(function ($data) {
                return [
                    'id' => $data->id,
                    'hotel_id' => $data->hotel_id,
                    'room_name' => $data->room_name,
                    'bed_type' => $data->room_type,
                    'rate_idr' => (int)$data->rate,
                    'rate_twt_idr' => (int)$data->rate_twt,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })
            ->toArray();

        $columns = ['id', 'hotel_id', 'room_name', 'bed_type', 'rate_idr', 'rate_twt_idr', 'created_at', 'updated_at', 'deleted_at'];

        return ExportCSV::export('room_types.csv', $columns, $roomTypes);
    }
    function hotels(){
        $hotels = Hotel::where('is_publish','1')->get()
        ->map(function($data){
            return [
                'id' => $data->id,
                'name' => $data->name,
                'destination_id' => $data->destination_id,
                'description' => $data->desctiption,
                'facilities' => $data->facilities,
                'address' => $data->address,
                'phone' => $data->phone,
                'banner' => $data->banner,
                'slug' => $data->slug,
                'group_wa_id' => $data->group_wa_id,
                'map_url' => $data->map_url,
                'website_url' => $data->url,
                'lunch_rate' => (int)$data->lunch_rate,
                'dinner_rate' => (int)$data->dinner_rate,
                'is_publish' => true,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at'  => $data->deleted_at,               
            ];
        })->toArray();
        $columns = ['id', 'name', 'destination_id', 'description', 'facilities', 'address', 'phone', 'banner', 'slug', 'group_wa_id', 'map_url', 'website_url', 'lunch_rate', 'dinner_rate', 'is_publish', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('hotels.csv', $columns, $hotels);
    }
}
