<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\BookingDocument;
use App\Models\CarConfiguration;
use App\Models\Country;
use App\Models\InvoiceHistory;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BookingController extends Controller
{
    function create(){
        return Inertia::render('Bookings/AddBooking');
    }
    // function create($orderChannel){
    //     $data['packages'] = Package::select('id','name','overview','duration_id','category_id','start_destination_id','end_destination_id','id_url','url')->with([
    //         'duration' => function($query){
    //             $query->select('id','name','day','night');
    //         },
    //         'category' => function($query){
    //             $query->select('id','name');
    //         },
    //         'itinerary' => function($query) use($orderChannel){
    //             $query->select('id','package_id','day','title','activity')->with(
    //                 [
    //                     'itineraryDestination' => function($q) use($orderChannel){
    //                         $q->select('id','itinerary_id','destination_id','second_destination_id')->with('destination',function($qq) use($orderChannel){
    //                             $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq){
    //                                 $qqq->select('id','image','caption','alt_text');
    //                             },'activityDestination' => function($qqq){
    //                                 $qqq->select('id','name');
    //                             },'activity' => function($qqq) use($orderChannel){
    //                                 $qqq->select('id','destination_id','name','unit','formula','price');
    //                                 if($orderChannel == 'jvto'){
    //                                     $qqq->where('is_default_jvto','1');
    //                                 }
    //                                 else if($orderChannel == 'klook'){
    //                                     $qqq->where('is_default_klook','1');
    //                                 }
    //                                 else if($orderChannel == 'twt'){
    //                                     $qqq->where('is_default_twt','1');
    //                                 }
    //                             }]);
    //                         })->with('secondDestination',function($qq) use($orderChannel){
    //                             $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq) use($orderChannel){
    //                                 $qqq->select('id','image','caption','alt_text');
    //                             },'activityDestination' => function($qqq){
    //                                 $qqq->select('id','name');
    //                             },'activity' => function($qqq) use($orderChannel){
    //                                 $qqq->select('id','destination_id','name','unit','formula','price');
    //                                 if($orderChannel == 'jvto'){
    //                                     $qqq->where('is_default_jvto','1');
    //                                 }
    //                                 else if($orderChannel == 'klook'){
    //                                     $qqq->where('is_default_klook','1');
    //                                 }
    //                                 else if($orderChannel == 'twt'){
    //                                     $qqq->where('is_default_twt','1');
    //                                 }
    //                             }]);
    //                         });
    //                     },
    //                     'itineraryMeals' => function($q){
    //                         $q->select('id','itinerary_id','breakfast','lunch','dinner')->where('price_plan_id',2);
    //                     }
    //                 ]
    //             );
    //         },
    //         'startDestination' => function($query){
    //             $query->select('id','name');
    //         },
    //         'endDestination' => function($query){
    //             $query->select('id','name');
    //         },
    //         'packageBanner' => function($query){
    //             $query->select('id','package_id','gallery_id')->with('gallery',function($q){
    //                 $q->select('id','image','caption','alt_text');
    //             });
    //         },
    //         'packageHotel' => function($query){
    //             $query->select('id','hotel_id','package_id','day')->with('hotel',function($q){
    //                 $q->select('id','name','banner','address','url','map_url','lunch_rate','dinner_rate')->with('roomHotelConfiguration',function($qq){
    //                     $qq->select('id','hotel_id','room_id','pax','qty')->with('room',function($qqq){
    //                         $qqq->select('id','room_name','rate');
    //                     });
    //                 });
    //             })->where('price_plan_id',2)->orderBy('day','asc');
    //         },
    //         'packagePrice' => function($query){
    //             $query->select('id','package_id','price_category_id','price','price_before_disc')->with('priceCategory', function($q){
    //                 $q->select('id','temp_text','start','end')->orderBy('start','asc');
    //             })->where('price_plan_id',2);
    //         }
    //     ]);
    //     if($orderChannel == 'jvto'){
    //         $data['packages'] = $data['packages']->where('is_publish', '1');
    //     }
    //     else{
    //         $data['packages'] = $data['packages']->where('package_platform', 'klook');
    //     }

    //     $data['packages'] = $data['packages']->get()
    //     ->sortBy(fn($package) => $package->duration->day);

    //     $data['car_configuration'] = CarConfiguration::select('id','car_id','pax','price','crew_jvto_role_id','crew_twt_role_id','crew_klook_role_id')
    //     ->with(['car' => function($query){
    //         $query->select('id','name');
    //     },'crewJvtoRole' => function($query){
    //         $query->select('id','order_channel_id','role','rate');
    //     },'crewTwtRole' => function($query){
    //         $query->select('id','order_channel_id','role','rate');
    //     },'crewKlookRole' => function($query){
    //         $query->select('id','order_channel_id','role','rate');
    //     }]);
    //     if($orderChannel == 'jvto'){
    //         $data['car_configuration'] = $data['car_configuration']->where('crew_jvto_role_id','!=',null);
    //     }
    //     else{
    //         $data['car_configuration'] = $data['car_configuration']->where('crew_klook_role_id','!=',null);
    //     }
    //     $data['car_configuration'] = $data['car_configuration']->orderBy('pax','asc')->get();
    //     $data['others_activities'] = OthersActivity::select('id','name','unit','formula','price')->get();
    //     $data['order_channel'] = $orderChannel;

    //     // return $data['packages'];

    //     $data['nationality'] = Country::get();
        
    //     return Inertia::render('Bookings/Create',['data' => $data]);
    // }
    function store(Request $request){
        // return dd($request->all());
        $customerInfo = json_decode($request->customer_info);
        $bookingInfo = json_decode($request->booking_info);
        $bookingItems = json_decode($request->booking_items);
        $financialSummary = json_decode($request->financial_summary);
        $user = new User();
        $user->name = $customerInfo->name;
        $user->phone = $customerInfo->phone;
        $user->email = $customerInfo->email;
        $user->country_id = $customerInfo->nationality_id;
        $user->avatar = 'default.jpg';
        $user->password  = Hash::make('password');
        $user->save();

        if ($bookingInfo->order_channel == 'twt') {
            $agent_id = 1;
            $booking_category_id = null;
            $package_duration = $request->package_duration;
            $night = $package_duration - 1;
            $packagePrice = str_replace('.', '', $financialSummary->grand_total) / $bookingInfo->number_of_pax;
            $attachment_id = 6;
        } else if ($bookingInfo->order_channel == 'jvto') {
            $agent_id = 2;
            $getPackage = Package::with('duration')->where('id', $bookingInfo->package_id)->first();
            $booking_category_id = $getPackage->category_id;
            $package_duration = $getPackage->duration->day;
            $night = $getPackage->duration->night;
            $packagePrice = str_replace('.', '', $financialSummary->package_price);
        } else if ($bookingInfo->order_channel == 'klook') {
            $agent_id = 2;
            $booking_category_id = 3;
            $getPackage = Package::with('duration')->where('id', $bookingInfo->package_id)->first();
            $package_duration = $getPackage->duration->day;
            $night = $getPackage->duration->night;
            $packagePrice = str_replace('.', '', $financialSummary->package_price);
            $attachment_id = 7;
        }

        $ym = date('Y-m', strtotime($bookingInfo->trip_date));
        $booking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
        $booking = $booking->orderBy('booking_numb', 'desc');
        $count = $booking->count();
        if ($count == 0) {
            $code = '001';
        } else {
            $booking = $booking->first();
            $code = (int) $booking->booking_numb + 1;
            $code = sprintf("%03s", $code);
        }

        $data = [
            'year' => date("y", strtotime($bookingInfo->trip_date)),
            'month' => date("m", strtotime($bookingInfo->trip_date)),
            'code' => $code
        ];


        $booking = new Booking();
        $booking->booking_code = "JVR/$data[code]/$data[month]/$data[year]";
        $booking->agent_id = $agent_id;
        $booking->booking_category_id = $booking_category_id;
        $booking->booking_date = date('Y-m-d');
        // $booking->due_date = $request->due_date;
        // $booking->invoice_code_origin = $request->invoice_code_origin;
        $booking->booking_numb = explode('/', $booking->booking_code)[1];
        $booking->user_id = $user->id;
        $booking->travel_date_start = $bookingInfo->trip_date;
        $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$night days"));
        $booking->package_duration = $package_duration;
        $booking->total_pax = $bookingInfo->number_of_pax;
        $booking->pickup = $bookingInfo->pickup_location;
        $booking->pickup_time = $bookingInfo->pickup_time;
        // $booking->ticket_type_number = $request->ticket_type_number;
        $booking->drop = $bookingInfo->drop_location;
        $booking->drop_time = $bookingInfo->drop_time;

        $booking->dp = 0;
        $booking->dp_no_idr = 0;
        $booking->payment = 0;

        $totalPackagePrice = $packagePrice * $bookingInfo->number_of_pax;
        $addOnTotal = 0;
        $discount = 0;
        $booking->grand_total_before_disc = $totalPackagePrice + $addOnTotal;
        $booking->add_on_total = $addOnTotal;

        $booking->grand_total = $totalPackagePrice + $addOnTotal - $discount;

        $booking->balance = $booking->grand_total;
        $booking->status = 'booked';
        $booking->type = 'offline';
        $booking->payment_method = 'pay later';

        $cekUrlName = User::where('name', $user->name)->count();

        $urlName = str_replace(' ', '-', strtolower($user->name));

        $urlName = $cekUrlName != 1 ? $urlName . $cekUrlName : $urlName;

        $booking->url_name = $urlName;

        $booking->url = md5($urlName);

        $night = $booking->package_duration - 1;


        if ($request->is_shuttle) {
            $booking->is_shuttle = '1';
        }
        // if ($request->send_wa) {
            $booking->is_send_wa = '1';
            $booking->wa_schedule_trip_information = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -2 days"));
            $booking->wa_schedule_trip_media = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " +$night days"));
            $booking->wa_schedule_trip_media_crew = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " -1 days"));
        // }
        $booking->custom_code = "";
        $booking->save();

        if ($request->hasFile('booking_file')) {
            $fileName = time() . '.' . $request->file('booking_file')->extension();
            $request->file('booking_file')->move(public_path('assets/customer-document'), $fileName);

            $bookingDocument = new BookingDocument();
            $bookingDocument->booking_id = $booking->id;
            $bookingDocument->user_id = $booking->user_id;
            $bookingDocument->attachment_type_id = $attachment_id; //Klook Booking Ticket
            $bookingDocument->file = $fileName;
            $bookingDocument->save();
        }
        $invoiceHistory = [];

        if ($bookingInfo->package_id) {
            $package = Package::find($bookingInfo->package_id);
            $invoiceDescription = $package->name;
            $packageId = $package->id;
        } else {
            $invoiceDescription = $booking->package_duration . " Days " . $night . " Night Package";
            $packageId = null;
        }

        $invoiceHistory[] = [
            'booking_id' => $booking->id,
            'description' => $invoiceDescription,
            'rate' => $packagePrice,
            'qty' => $request->number_of_pax,
            'line_total' => $totalPackagePrice,
            'type' => 'package',
            'parent_id' => $packageId,
        ];

        $bookingDetail = new BookingDetail();
        $bookingDetail->booking_id = $booking->id;
        $bookingDetail->package_id = $packageId;
        $bookingDetail->travel_date_start = $booking->travel_date_start;
        $bookingDetail->travel_date_end = $booking->travel_date_end;
        $bookingDetail->pax = $booking->total_pax;
        $bookingDetail->xss = $customerInfo->t_shirt_size->XSS ? $customerInfo->t_shirt_size->XSS : 0;
        $bookingDetail->xxs = $customerInfo->t_shirt_size->XXS ? $customerInfo->t_shirt_size->XXS : 0;
        $bookingDetail->xs = $customerInfo->t_shirt_size->XS ? $customerInfo->t_shirt_size->XS : 0;
        $bookingDetail->s = $customerInfo->t_shirt_size->S ? $customerInfo->t_shirt_size->S : 0;
        $bookingDetail->m = $customerInfo->t_shirt_size->M ? $customerInfo->t_shirt_size->M : 0;
        $bookingDetail->l = $customerInfo->t_shirt_size->L ? $customerInfo->t_shirt_size->L : 0;
        $bookingDetail->xl = $customerInfo->t_shirt_size->XL ? $customerInfo->t_shirt_size->XL : 0;
        $bookingDetail->xxl = $customerInfo->t_shirt_size->XXL ? $customerInfo->t_shirt_size->XXL : 0;
        $bookingDetail->xxxl = $customerInfo->t_shirt_size->XXXL ? $customerInfo->t_shirt_size->XXXL : 0;
        $bookingDetail->save();

        foreach ($invoiceHistory as $key => $value) {
            $invoiceHistory = new InvoiceHistory();
            $invoiceHistory->booking_id = $value['booking_id'];
            $invoiceHistory->description = $value['description'];
            $invoiceHistory->rate = $value['rate'];
            $invoiceHistory->qty = $value['qty'];
            $invoiceHistory->line_total = $value['line_total'];
            $invoiceHistory->type = $value['type'];
            $invoiceHistory->parent_id = $value['parent_id'];
            $invoiceHistory->save();
        }


    }
}
