<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class ExportDataVehicles extends Controller
{
    function vehicleTypes()
    {
        $vehicle = Car::whereIn('id', [1, 2, 5, 14, 24, 25])->orderBy('id','asc');
        
        if(request()->limit){
            $vehicle = $vehicle->limit(request()->limit);
        }
        $vehicle = $vehicle
        ->get(['id', 'car_name as name', 'start_pax as capacity_min_pax', 'end_pax as capacity_max_pax', 'price as price_per_day', 'price_twt as twt_price_per_day', 'created_at', 'updated_at', 'deleted_at'])
            ->values() // reset index
            ->map(function ($item, $index) {
                $item->id = $index + 1; // ganti id mulai dari 1
                return $item;
            });
        $columns = ['id', 'name', 'capacity_min_pax', 'capacity_max_pax', 'price_per_day', 'twt_price_per_day', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('vehicle_types.csv', $columns, $vehicle);
    }
    function vehicleUnits()
    {
        $vehicleTypes = [
            'MPV' => 1,
            'Innova' => 2,
            'Hiace' => 3,
            'Hiace Premio' => 4,
            'Medium Bus' => 5,
            'Mini Bus (Elf)' => 6,
        ];

        $vehicleUnits = Car::where('is_publish', '1')->orderBy('id','asc');
        
        if(request()->limit){
            $vehicleUnits = $vehicleUnits->limit(request()->limit);
        }
        $vehicleUnits = $vehicleUnits
        ->get()->map(function ($data) use ($vehicleTypes) {
            return [
                'id' => $data->id,
                'vehicle_type_id' => $vehicleTypes[$data->car_name] ?? $data->car_name,
                'plat_no' => '',
                'nickname' => $data->name,
                'is_active' => true,
                'vendor_id' => $data->vendor_id,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at' => $data->deleted_at,
            ];
        })->toArray();
        $columns = ['id', 'vehicle_type_id', 'plat_no', 'nickname', 'is_active', 'vendor_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('vehicle_units.csv', $columns, $vehicleUnits);
    }
}
