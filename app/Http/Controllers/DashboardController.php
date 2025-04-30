<?php

namespace App\Http\Controllers;

use App\Models\BookGuideDriver;
use App\Models\Booking;
use App\Models\BookingItinerary;
use App\Models\BookingPayment;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    function index(Request $request){
        $month = $request->month ? $request->month : date('m');
        $firstDayMonth = date('Y-'.$month.'-01');
        $lastDayMonth = date('Y-'.$month.'-t');
        $today = $month != date('m') ? date('Y-'.$month.'-01') : date('Y-m-d');

        $alert = [
            'no_pickup' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->where(function ($query) {
                $query->whereNull('pickup');
            })
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_drop' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->where(function ($query) {
                $query->whereNull('drop');
            })
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_car' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereDoesntHave('bookCar')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_crew' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start','>=',$today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereDoesntHave('guideDriver')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_payment_method' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereNull('outstanding_payment_method')
            ->where('status','booked')
            ->where('agent_id',2)
            ->where('booking_category_id','!=',3)
            ->orderBy('travel_date_start','asc')->get(),
            'no_hotel' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereDoesntHave('bookHotel')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_tshirt' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereHas('bookingDetail', function ($query) {
                $query->whereRaw(
                    'bookings.total_pax != (xss + xxs + xs + s + m + l + xl + xxl + xxxl)'
                );
            })
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
            'no_trip_media' => Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereNull('media_link')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get(),
        ];

        $trips = Booking::select(
            'bookings.id',
            'package_duration',
            'travel_date_start',
            'travel_date_end',
            'users.name',
            'total_pax',
            'bookings.agent_id',
            'bookings.booking_category_id',
            'bookings.outstanding_payment_method',
            'balance',
            'outstanding_payment_link'
        )
        ->with('guideDriver.person')
        ->join('users', 'bookings.user_id', 'users.id')
        ->where(function($query) use($firstDayMonth, $lastDayMonth) {
            $query->where(function($q) use($firstDayMonth, $lastDayMonth) {
                $q->where('travel_date_start', '>=', $firstDayMonth)
                  ->where('travel_date_start', '<=', $lastDayMonth);
            });
            // OR active trips (today is between start and end date)
        })
        ->where('status', 'booked')
        ->orderBy('travel_date_start', 'asc')
        ->get()->map(function($data) use ($today) {
            $night = $data->package_duration - 1;
            
            if($data->agent_id === 1){
                $order_channel = 'TWT';
            }
            else{
                if($data->booking_category_id === 3){
                    $order_channel = 'KLOOK';
                }
                else{
                    $order_channel = 'JVTO';
                }
            }
            
            // Determine if this is an active trip
            $isActive = $data->travel_date_start <= $today && $data->travel_date_end >= $today;
            $dayNow = null;
            $todayItinerary = null;
            $status = "";
            if($isActive) {
                $status = 'active';
                $tanggal1 = new DateTime($data->travel_date_start);
                $tanggal2 = new DateTime($today);
                
                $selisih = $tanggal1->diff($tanggal2); 
                $dayNow = $selisih->days+1;
    
                $todayItinerary = BookingItinerary::where('booking_id',$data->id)->where('day',$dayNow)->first();
                $todayItinerary = $todayItinerary?->itinerary; 
            }

            if($data->travel_date_end < $today){
                $status = 'complete';
            }
            if($data->travel_date_start > $today){
                $status = 'upcoming';
            }
            
            return [
                'id' => $data->id,
                'user' => $data->name,
                'package' => $data->package_duration."D ".$night."N",
                'date' => date('d M', strtotime($data->travel_date_start))." - ".date('d M', strtotime($data->travel_date_end)),
                'date_day' => date('D', strtotime($data->travel_date_start))." - ".date('D', strtotime($data->travel_date_end)),
                'is_active'  => $isActive,
                'start_date' => $data->travel_date_start,
                'end_date' => $data->travel_date_end,
                'total_pax' => $data->total_pax,
                'order_channel' => $order_channel,
                'balance' => $data->agent_id == 2 && $data->booking_category_id != 3 ? $data->balance : '-',
                'payment_method' => $data->agent_id == 2 && $data->booking_category_id != 3 ? $data->outstanding_payment_method : '-',
                'outstanding_payment_link' => $data->agent_id == 2 && $data->booking_category_id != 3 ? $data->outstanding_payment_link : '-',
                'is_active' => $isActive,
                'day_now' => $dayNow,
                'status' => $status,
                'todayItinerary'=> $todayItinerary,
                'crews' => $data->guideDriver->map(function($crew){
                    return [
                        'id' => $crew->person->id,
                        'name' => $crew->person->name,
                        'type' => $crew->type,
                        'tags' => $crew->person->tags,
                        'photo' => $crew->person->photo ? 'https://javavolcano-touroperator.com/assets/img/guide/'.$crew->person->photo : 'https://javavolcano-touroperator.com/assets/img/guide/default.jpg',
                        'is_ijen' => $crew->guide_ijen,
                        'recap_this_month_escort' => BookGuideDriver::where('guide_id',$crew->person->id)->where('start_date','like','%'.date('Y-m').'%')->where('guide_ijen','0')->count(), // for driver & guide
                        'recap_this_month_ijen' => BookGuideDriver::where('guide_id',$crew->person->id)->where('start_date','like','%'.date('Y-m').'%')->where('guide_ijen','1')->count(), // for guide only
                    ];
                })
            ];
        });   
        $summary = [
            'total_booking' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->count(),
            'total_booking_pax' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->sum('total_pax'),
            'active_booking' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('travel_date_start','<=',date('Y-m-d'))->where('travel_date_end','>=',$today)->where('status','booked')->count(),
            'complete_booking' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('travel_date_end','<',$today)->where('status','booked')->count(),
            'upcoming_booking' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('travel_date_start','>',$today)->where('status','booked')->count(),
        ];

        $summaryOrderChannel = [
            'jvto' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',2)->where('booking_category_id','!=',3)->count(),
            'jvto_pax' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',2)->where('booking_category_id','!=',3)->sum('total_pax'),
            'klook' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',2)->where('booking_category_id',3)->count(),
            'klook_pax' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',2)->where('booking_category_id',3)->sum('total_pax'),
            'twt' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',1)->count(),
            'twt_pax' => Booking::where('travel_date_start','like','%'.date('Y-'.$month).'%')->where('status','booked')->where('agent_id',1)->sum('total_pax'),
        ];

        $paymentHistory = BookingPayment::with(['booking.user','booking.bookingDetail.package','paymentMethod'])->where('created_at','>=',$firstDayMonth)->where('created_at','<=',$lastDayMonth)->orderBy('created_at','desc')->get()->map(function($data){
            $countBefore = BookingPayment::where('booking_id',$data->booking_id)->where('id','<=',$data->id)->count();
            return [
                'id' => $data->id,
                'booking_id' => $data->booking_id,
                'user' => $data->booking->user->name,
                'trip_date'  => $data->booking->travel_date_start,
                'grand_total'  => $data->booking->grand_total,
                'pax' => $data->booking->total_pax,
                'package' => $data->booking->bookingDetail[0]->package ? $data->booking->bookingDetail[0]->package->name : ($data->booking->package_duration > 1 ? $data->booking->package_duration."D ".($data->booking->package_duration - 1)."N" : $data->booking->package_duration."D ".($data->booking->package_duration)."N Package"),
                'package_url' => $data->booking->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/packages/details/".$data->booking->bookingDetail[0]->package->url : null,
                'booking_code' => $data->booking->booking_code,
                'nominal' => $data->nominal,
                'is_add_on' => $data->booking->book_add_on_total > 0 ? true : false,
                'payment_method_id' => $data->paymentMethod->id,
                'payment_method' => $data->paymentMethod->name,
                'reference' => $data->reference,
                'description' => $data->description,
                'receipt' => str_replace('JVR','RCP', $data->booking->booking_code)."/".$countBefore,
                'created_at' => date('d M Y H:i:s',strtotime($data->created_at)),
            ];
        });

        $dashboardData = [
            'summaryOrderChannel' => $summaryOrderChannel,
            'summary' => $summary,
            'paymentHistory' => $paymentHistory,
            'trips' => $trips,
            'alert' => $alert,
            'month' => $month,
            'orderChannelLinks' => [
                'jvto' => '/booking-overview?channel=JVTO&filter_type=month&month='.date('Y-'.$month),
                'klook' => '/booking-overview?channel=KLOOK&filter_type=month&month='.date('Y-'.$month),
                'twt' => '/booking-overview?channel=TWT&filter_type=month&month='.date('Y-'.$month),
            ],
        ];

        return Inertia::render('Dashboard',['dashboardData' => $dashboardData]);
    }
    function screeningSuccess(){
        return Inertia::render('ScreeningSuccess');
    }
    function portalVendor(){
        return Inertia::render('PortalVendor');
    }
    function screening(){
        return Inertia::render('Screening');
    }
    function screeningStaff(){
        return Inertia::render('ScreeningStaff');
    }
    function generateInv(){
        // $new = new BookingPayment;
        // $new->booking_id = 981;
        // $new->nominal = 1500000;
        // $new->payment_method_id = 7;    
        // $new->description = 'Down Payment';
        // $new->is_paid = '0';
        // $new->save();
        
        $booking = Booking::with(['user','bookingPayment' => function ($query) {
            $query->withoutGlobalScope('paid');
        }])->where('agent_id',2)->where('booking_category_id','!=',3)->where('travel_date_start','>=',date('Y-m-01'))->orderBy('travel_date_start','asc')->get()->map(function($booking){
            if(count($booking->bookingPayment) == 0){
                $new = new BookingPayment;
                $new->booking_id = $booking->id;
                $new->nominal = $booking->dp;
                if($booking->payment_method == 'cc'){
                    $new->payment_method_id = 3;    
                }
                else if($booking->payment_method == 'wise'){
                    $new->payment_method_id = 5;    
                }
                else if($booking->payment_method == 'pay later'){
                    $new->payment_method_id = 7;    
                }
                $new->description = 'Down Payment';
                $new->reference = $booking->payment_link;
                $new->is_paid = '0';
                $new->save();
            }
            return [
                'id' => $booking->id,
                'user' => $booking->user->name,
                'travel_date_start' => $booking->travel_date_start,
                'status' => $booking->status,
                'dp' => $booking->dp,
                'payment_method' => $booking->payment_method,
                'payment_link' => $booking->payment_link,
                'payment' => $booking->bookingPayment,
            ];
        });

        \DB::table('booking_payments')->where('is_paid','1')->update([
            'paid_at' => \DB::raw('created_at')
        ]);

        return $booking;
    }
}
