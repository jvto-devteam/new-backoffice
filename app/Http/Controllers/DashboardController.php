<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    function index(){
        $lastMonth = date('Y-m',strtotime(date('Y-m')." -1 month"));
        $data['total_booking'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('status','booked')->count();
        $data['total_booking_last_month'] = Booking::where('travel_date_start','like','%'.$lastMonth.'%')->where('status','booked')->count();
        $data['change_total_boking'] = $data['total_booking'] - $data['total_booking_last_month'];

        $data['total_booking_complete'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_end','<',date('Y-m-d'))->where('status','booked')->count();
        $data['total_booking_on_going'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_start','<=',date('Y-m-d'))->where('travel_date_end','>=',date('Y-m-d'))->where('status','booked')->count();

        $data['booking'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', '>=',date('Y-m-d'))->where('status', 'booked')->orderBy('travel_date_start','asc')->limit(5)->get();

        return Inertia::render('Dashboard2',['data' => $data]);
    }
}
