<?php

namespace App\Http\Controllers;

use App\Models\RoomHotel;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HotelController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Manage Hotel Listings';
        $pageTitle = 'Manage Hotel Listings';

        $search = $request->input('search');
        $data['hotels'] = [];
        try {
            $getHotels = Hotel::with('roomHotel')
                ->join('destinations', 'hotels.destination_id', '=', 'destinations.id') // Ensure the correct foreign key
                ->select('hotels.id', 'hotels.code', 'hotels.name', 'hotels.phone', 'hotels.address', 'hotels.banner', 'destinations.name as destination')
                ->where('hotels.is_publish', '1')
                ->whereNull('hotels.deleted_at')
                ->whereNotNull('hotels.code')
                ->orderBy('hotels.code', 'asc');

            if ($search) {
                $getHotels = $getHotels->where('hotels.name', 'like', '%' . $search . '%')
                    ->orWhere('hotels.id', 'like', '%' . $search . '%');
            }

            $data['hotels'] = $getHotels->get();
            $data['search'] = $search;

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
//        return $data;
        return Inertia::render('Hotel/HotelList',['data' => $data]);
    }

}
