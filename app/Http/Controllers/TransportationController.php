<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportationController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Manage Tour Tranportation';
        $pageTitle = 'Manage Tour Tranportation';

        $search = $request->input('search');
        $data['transportations'] = [];
        try {
            $getTransportation = Car::select('id', 'name','car_code', 'price','start_pax','end_pax')
                ->orderBy('car_code', 'asc')
                ->where('car_code', '!=', '');

            if ($search) {
                $getTransportation = $getTransportation->where('name', 'like', '%' . $search . '%')->orWhere('car_code', 'like', '%' . $search . '%');
            }

            $data['transportations'] = $getTransportation->get()->map(function($query){
                $end = $query->start_pax == $query->end_pax ? " Pax" : ($query->end_pax == 0 ? '+ Pax Above' : ' - '.$query->end_pax." Pax");
                return [
                    'id' => $query->id,
                    'name' => $query->name,
                    'car_code' => $query->car_code,
                    'capacity' => $query->start_pax.$end,
                ];
            });
            $data['search'] = $search;

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        if($request->json){
            return $data['transportations'];
        }

//        return $data;
        return Inertia::render('Transportation/TransportationList',['data' => $data]);
    }

}
