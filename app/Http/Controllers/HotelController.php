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
                ->select('hotels.id', 'hotels.name', 'hotels.phone', 'hotels.address', 'hotels.banner')
                ->where('is_publish', '1')
                ->whereNull('deleted_at')
                ->orderBy('id', 'asc');

            if ($search) {
                $getHotels = $getHotels->where('name', 'like', '%' . $search . '%')->orWhere('id', 'like', '%' . $search . '%');
            }
            $data['hotels'] = $getHotels->get();
            $data['search'] = $search;
//            return $getHotels->get();

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        return Inertia::render('Hotel/HotelList',['data' => $data]);
    }

}
