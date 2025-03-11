<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class TripRegistrationController extends Controller
{
    function getData($url){
        try {
            $booking = Booking::with(['user','bookingDetail'])->where('url',$url)->firstOrFail();
            $day = $booking->package_duration;
            $night = $booking->package_duration - 1;
            return [
                'id' => $booking->id,
                'user_id' => $booking->user_id,
                'package_duration' => $booking->package_duration,
                'trip_date' => date('d',strtotime($booking->travel_date_start))." - ".date('d F Y',strtotime($booking->travel_date_end)),
                'package_name' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->name : $day." Days ".$night." Nights",
                'total_pax' => $booking->total_pax,
                'car_type'  => 'Hiace',
                'cars' => [
                    [
                        'no' => 1,
                        'name' => 'Hiace 1',
                    ],
                    [
                        'no' => 2,
                        'name' => 'Hiace 2',
                    ],
                ],
                'numb_of_seats' => 9,
                'selected_car' => [
                    [
                        'participant_id' => 1,
                        'participant_name' => 'John Doe',
                        'car_no' => 1,
                        'seat_no' => 1,
                    ],
                    [
                        'participant_id' => 2,
                        'participant_name' => 'John Cena',
                        'car_no' => 1,
                        'seat_no' => 5,
                    ],
                    [
                        'participant_id' => 3,
                        'participant_name' => 'The Rock',
                        'car_no' => 2,
                        'seat_no' => 3,
                    ],
                ],
                'numb_of_rooms' => ceil($booking->total_pax),
                'selected_rooms' => [
                    [
                        'room_no' => 1,
                        'status' => 'booked',
                        'participants' => [
                            [
                                'participant_id' => 1,
                                'participant_name' => 'John Doe'
                            ],
                            [
                                'participant_id' => 2,
                                'participant_name' => 'John Cena'
                            ]
                        ]
                    ],
                    [
                        'room_no' => 3,
                        'status' => 'available',
                        'participants' => [
                            [
                                'participant_id' => 3,
                                'participant_name' => 'The Rock'
                            ]
                        ]
                    ]
                ]
            ];

            return response()->json([
                'status' => true,
                'data' => $booking
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Booking not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while retrieving the booking'
            ], 500);
        }
    }
}
