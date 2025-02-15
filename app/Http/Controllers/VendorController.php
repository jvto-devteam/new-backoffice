<?php

namespace App\Http\Controllers;

use App\Models\BookHotel;
use App\Models\Hotel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    function accommodation(Request $request, $id) {
        $start = $request->start ? $request->start : date('Y-m-01');
        $end = $request->end ? $request->end : date('Y-m-t');
        $bookHotel = BookHotel::with(['bookHotelMeal','booking.user', 'bookingItinerary', 'hotel', 'bookRoom.roomHotel'])
        ->where('hotel_id', $id)
        ->whereHas('bookingItinerary', function ($query) use ($start, $end) {
            $query->whereHas('booking', function ($subQuery) use ($start, $end) {
                $subQuery->whereRaw("
                    DATE_ADD(travel_date_start, INTERVAL (booking_itineraries.day - 1) DAY) 
                    BETWEEN ? AND ?", [$start, $end]);
            });
        })
        ->get()
        ->map(function ($query) {
            $night = $query->bookingItinerary->day - 1;
            $checkIn = date('Y-m-d', strtotime($query->booking->travel_date_start . " +$night days"));
            
            return [
                'customer' => $query->booking->user->name,
                'participants' => $query->booking->total_pax,
                'day' => $query->bookingItinerary->day,
                'check_in' => date('d F Y', strtotime($checkIn)),
                'rooms' => $query->bookRoom->map(function ($q) {
                    return [
                        'room_name' => $q->roomHotel->room_name,
                        'quantity' => $q->quantity,
                        'price' => $q->subtotal/$q->quantity,
                        'subtotal' => $q->subtotal,
                    ];
                }),
                'meals' => $query->bookHotelMeal->map(function($q){
                    return [
                        'meals' => $q->meals,
                        'quantity' => $q->qty,
                        'price' => $q->price,
                        'subtotal' => $q->subtotal,
                    ];
                })
            ];
        });

        $hotel = Hotel::select('id','name','banner','map_url','lunch_rate','dinner_rate')
        ->with(['roomHotel' => function($query) {
            $query->select('hotel_id','room_name','rate');
        }, 'roomHotelConfiguration' => function($query) {
            $query->select('id','hotel_id','room_id','pax','qty')->with(['room' => function($q){
                $q->select('id','room_name');
            }]);
        }])->find($id);
    
    // Menambahkan field photos pada roomHotel
    $hotel->roomHotel->map(function($room) {
        $room->photos = []; 
        return $room;
    });
    
    // Mengelompokkan roomHotelConfiguration berdasarkan pax dan menggabungkan rooms
    $hotel->room_hotel_configuration = $hotel->roomHotelConfiguration
        ->groupBy('pax')
        ->map(function ($group, $pax) {
            return [
                'pax' => (int) $pax,
                'rooms' => $group->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'room_id' => $item->room_id,
                        'qty' => $item->qty,
                        'room_name' => $item->room->room_name
                    ];
                })->values()
            ];
        })
        ->values(); // Reset indeks agar lebih rapi dalam JSON
    
    // Menghapus properti roomHotelConfiguration yang lama
    unset($hotel->roomHotelConfiguration);
                

        $accommodation = [
            'hotel' => $hotel,
            'schedule' => $bookHotel,
            'document' => [],
            'map' => ''
        ];
        // return $accommodation;
        return Inertia::render('Vendor/Accommodation', ['hotelData' => $accommodation]);
    }
}
