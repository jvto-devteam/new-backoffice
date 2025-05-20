<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TripRegistrationController extends Controller
{
    function getData($url){
        try {
            $booking = Booking::with(['user', 'bookingDetail', 'participant'])->where('url', $url)->firstOrFail();
            $day = $booking->package_duration;
            $night = $booking->package_duration - 1;
            
            // Hitung jumlah kamar berdasarkan total_pax
            $totalRooms = ceil($booking->total_pax / 2);
            
            // Inisialisasi kamar-kamar
            $rooms = [];
            for ($i = 1; $i <= $totalRooms; $i++) {
                $rooms[] = [
                    "id" => $i,
                    "capacity" => 2,
                    "isReserved" => false,
                    "occupants" => []
                ];
            }
            
            // Inisialisasi kendaraan berdasarkan car_type dan numb_of_car
            $vehicles = [];
            
            // Tentukan kapasitas dan nama berdasarkan tipe kendaraan
            $capacity = $booking->car_type == 'hiace' ? 9 : 25;
            $typeName = $booking->car_type == 'hiace' ? 'Toyota Hiace' : 'Medium Bus';
            
            // Buat kendaraan sebanyak numb_of_car
            for ($i = 1; $i <= $booking->numb_of_car; $i++) {
                $seats = [];
                // Buat kursi sesuai kapasitas kendaraan
                if ($booking->car_type == 'hiace') {
                    // Kode untuk Hiace tetap sama
                    $capacity = 9;
                    for ($j = 1; $j <= $capacity; $j++) {
                        $seatNumber = str_pad($j, 2, '0', STR_PAD_LEFT);
                        $seats[] = [
                            "number" => $seatNumber, 
                            "status" => "available"
                        ];
                    }
                } else { // bus
                    // Kursi bus (35 kursi)
                    $capacity = 35;
                    for ($j = 1; $j <= $capacity; $j++) {
                        $seatNumber = str_pad($j, 2, '0', STR_PAD_LEFT);
                        $seats[] = [
                            "number" => $seatNumber, 
                            "status" => "available"
                        ];
                    }
                    
                    // Tambahkan kursi driver dan guide khusus bus
                    array_unshift($seats, 
                        ["number" => "KN", "status" => "driver"],
                        ["number" => "SP", "status" => "guide"]
                    );
                }                
                $vehicles[] = [
                    "id" => $i,  // ID lengkap untuk frontend (hiace1, bus1, dll)
                    "name" => "{$typeName} {$i}",
                    "type" => $booking->car_type,
                    "capacity" => $capacity,
                    "seats" => $seats
                ];
            }
            
            // Dapatkan data participant dari database
            if ($booking->participant->isNotEmpty()) {
                foreach ($booking->participant as $participant) {
                    // Isi data rooms berdasarkan participant
                    if ($participant->room_number) {
                        $roomIndex = $participant->room_number - 1;
                        if (isset($rooms[$roomIndex])) {
                            $rooms[$roomIndex]['occupants'][] = $participant->full_name;
                        }
                    }
            
                    // Isi data vehicles berdasarkan participant
                    if ($participant->car_number && $participant->seat_number) {
                        // Cari indeks kendaraan yang cocok
                        $carNumber = (int)$participant->car_number;
                        $vehicleIndex = $carNumber - 1; // Konversi dari 1-based ke 0-based
                        
                        if (isset($vehicles[$vehicleIndex])) {
                            // Cari indeks kursi yang cocok
                            foreach ($vehicles[$vehicleIndex]['seats'] as $seatIndex => $seat) {
                                if ($seat['number'] == $participant->seat_number) {
                                    // Update status kursi menjadi booked
                                    $vehicles[$vehicleIndex]['seats'][$seatIndex]['status'] = 'booked';
                                    $vehicles[$vehicleIndex]['seats'][$seatIndex]['occupant'] = $participant->full_name;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            return [
                'id' => $booking->id,
                'user_id' => $booking->user_id,
                'package_duration' => $booking->package_duration,
                'trip_date' => date('d', strtotime($booking->travel_date_start)) . " - " . date('d F Y', strtotime($booking->travel_date_end)),
                'package_name' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->name : $day . " Days " . $night . " Nights",
                'total_pax' => $booking->total_pax,
                'rooms' => $rooms,
                'vehicles' => $vehicles,
                'user' => $booking->user->name
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
    public function submitParticipant(Request $request)
    {
        try {
            // Validasi request
            $validator = Validator::make($request->all(), [
                'booking_url' => 'required|string',
                'participant' => 'required|array',
                'participant.title' => 'required|string',
                'participant.full_name' => 'required|string',
                'participant.gender' => 'required|string',
                'participant.passport_number' => 'required|string',
                'participant.tshirt_size' => 'required|string',
                'participant.car_number' => 'required|string',
                'participant.seat_number' => 'required|string',
                'participant.room_number' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Ambil booking berdasarkan URL
            $booking = Booking::where('url', $request->booking_url)->first();
            
            if (!$booking) {
                return response()->json([
                    'status' => false,
                    'message' => 'Booking not found'
                ], 404);
            }

            // Pastikan kursi dan kamar tidak sudah dipesan
            $existingSeat = Participant::where('booking_id', $booking->id)
                ->where('car_number', $request->participant['car_number'])
                ->where('seat_number', $request->participant['seat_number'])
                ->exists();

            if ($existingSeat) {
                return response()->json([
                    'status' => false,
                    'message' => 'This seat has already been reserved by another participant'
                ], 400);
            }

            // Buat participant baru
            DB::beginTransaction();
            
            $participant = new Participant();
            $participant->booking_id = $booking->id;
            $participant->title = ucfirst($request->participant['title']);
            $participant->full_name = ucwords($request->participant['full_name']);
            $participant->gender = ucwords($request->participant['gender']);
            $participant->flight_number = $request->participant['flight_number'];
            $participant->passport_number = $request->participant['passport_number'];
            $participant->tshirt_size = strtoupper($request->participant['tshirt_size']);
            $participant->dietary_restriction = $request->participant['dietary_restriction'];
            $participant->car_number = $request->participant['car_number'];
            $participant->seat_number = $request->participant['seat_number'];
            $participant->room_number = $request->participant['room_number'];
            $participant->save();

            // Update booking status jika perlu
            $booking->is_trip_participants = '1'; // Menandakan bahwa booking ini sudah memiliki participant
            $booking->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Participant registration submitted successfully',
                'data' => $participant
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to submit participant data',
                'error' => $e->getMessage()
            ], 500);
        }
    }   
    public function getDashboardData($url)
    {
        try {
            // Obtener datos del paquete
            $booking = Booking::with(['bookingDetail.package','user'])
                        ->where('url', $url)
                        ->first();
            
            $packageName = "Tour Registration";
            $packageDate = "";
            
            if ($booking) {
                $day = $booking->package_duration;
                $night = $booking->package_duration - 1;
                
                $packageName = $booking->bookingDetail[0]->package 
                    ? $booking->bookingDetail[0]->package->name 
                    : $day . " Days " . $night . " Nights";
                
                $packageDate = date('d', strtotime($booking->travel_date_start)) . " - " . 
                               date('d F Y', strtotime($booking->travel_date_end));
            }
            
            // Obtener todos los participantes
            $participants = Participant::select(
                'participants.id',
                'participants.title',
                'participants.full_name',
                'participants.gender',
                'participants.flight_number',
                'participants.passport_number',
                'participants.tshirt_size',
                'participants.dietary_restriction',
                'participants.car_number',
                'participants.seat_number',
                'participants.room_number',
                'participants.created_at',
                'bookings.status',
            )
            ->join('bookings', 'participants.booking_id', '=', 'bookings.id')
            ->where('booking_id',$booking->id)
            ->orderBy('participants.created_at', 'desc')
            ->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'user' => $booking->user->name,
                    'package_name' => $packageName,
                    'package_date' => $packageDate,
                    'participants' => $participants
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }     
}
