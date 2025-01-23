<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    function invoice(Request $request){
        $perPage = 10;
        $query = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','payment')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        }])->where('status', 'booked')->where('agent_id', 2)->where('travel_date_start','like','%2025%')->orderBy('travel_date_start','asc');
       
        $booking = $query->paginate($perPage)
            ->through(function($booking) {
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'name' => $booking->user->name,
                    'package_code' => $booking->bookingDetail[0]->package->package_code,
                    'package' => $booking->bookingDetail[0]->package->name ?? '-',
                    'numb_of_pax' => $booking->total_pax ?? 0,
                    'trip_date' => $booking->travel_date_start ?? '-',
                    'total_per_pax' => $booking->grand_total/$booking->total_pax,
                    'total' => $booking->grand_total,
                    'total_add_on' => $booking->book_add_on_total,
                    'grand_total' => $booking->grand_total+$booking->book_add_on_total,
                    'payment' => $booking->payment,
                    'balance' => ($booking->grand_total+$booking->book_add_on_total)-$booking->payment,
                    'payment_status' => ($booking->grand_total+$booking->book_add_on_total)-$booking->payment == 0 ? 'Paid' : 'Unpaid',
                ];
            });

        return Inertia::render('Finance/InvoiceManager', [
            'booking' => $booking,
        ]);
        
    }
}
