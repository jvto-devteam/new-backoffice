<?php

namespace App\Http\Controllers;

use App\Models\BookHotel;
use App\Models\Hotel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;
use Illuminate\Support\Str;

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

        $hotel = Hotel::select('id','name','address','banner','map_url','lunch_rate','dinner_rate')
        ->with(['roomHotel' => function($query) {
            $query->select('hotel_id','room_name','rate');
        }, 'roomHotelConfiguration' => function($query) {
            $query->select('id','hotel_id','room_id','pax','qty')->with(['room' => function($q){
                $q->select('id','room_name');
            }]);
        }])->find($id);
    
        // Menambahkan field photos pada roomHotel
        $hotel->roomHotel->map(function($room) {
            $room->photo = $room->photo ? "https://javavolcano-touroperator.com/assets/img/room-hotel/".$room->photo : 'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg'; 
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
            'document' => [
                [
                    "id" => 1,
                    "filename" => "Hotel_Contract_2025.pdf",
                    "type" => "application/pdf",
                    "size" => "2.4 MB",
                    "uploaded_at" => "2025-01-15"
                ],
                [
                    "id" => 2,
                    "filename" => "Room_Rates_2025.xlsx",
                    "type" => "application/vnd.ms-excel",
                    "size" => "856 KB",
                    "uploaded_at" => "2025-01-20"
                ],
                [
                    "id" => 3,
                    "filename" => "Guest_Policy_Guidelines.docx",
                    "type" => "application/msword",
                    "size" => "1.2 MB",
                    "uploaded_at" => "2025-01-25"
                ],
                [
                    "id" => 4,
                    "filename" => "Facility_Photos_2025.zip",
                    "type" => "application/zip",
                    "size" => "15.7 MB",
                    "uploaded_at" => "2025-02-01"
                ],
                [
                    "id" => 5,
                    "filename" => "Staff_Training_Manual.pdf",
                    "type" => "application/pdf",
                    "size" => "3.8 MB",
                    "uploaded_at" => "2025-02-05"
                ],
                [
                    "id" => 6,
                    "filename" => "Marketing_Brochure_Q1.pdf",
                    "type" => "application/pdf",
                    "size" => "5.2 MB",
                    "uploaded_at" => "2025-02-10"
                ],
                [
                    "id" => 7,
                    "filename" => "Maintenance_Schedule.xlsx",
                    "type" => "application/vnd.ms-excel",
                    "size" => "945 KB",
                    "uploaded_at" => "2025-02-12"
                ],
                [
                    "id" => 8,
                    "filename" => "Emergency_Procedures.pdf",
                    "type" => "application/pdf",
                    "size" => "1.8 MB",
                    "uploaded_at" => "2025-02-14"
                ]
            ],
            'map' => ''
        ];
        // return $accommodation;
        $initialFilters = [
            'start' => $start,
            'end' => $end,
        ];
        if ($request->has('download')) {
            $pdf = PDF::loadView('exports.hotel-schedule', [
                'hotel' => $hotel,
                'schedule' => $bookHotel,
                'start' => date('d F Y', strtotime($start)),
                'end' => date('d F Y', strtotime($end))
            ]);
            $filename = Str::slug($hotel->name) . '-schedule-' . now()->format('Y-m-d-His') . '.pdf';            
            return $pdf->download($filename);
        }        
        return Inertia::render('Vendor/Accommodation', ['initialFilters' => $initialFilters,'hotelData' => $accommodation]);
    }
}
