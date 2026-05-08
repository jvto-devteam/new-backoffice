<?php

namespace App\Http\Controllers;

use App\Models\ActivityEnd;
use App\Models\ActivityStart;
use App\Models\AddOn;
use App\Models\BookAddOn;
use App\Models\BookCar;
use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookGuideDriver;
use App\Models\BookHotel;
use App\Models\BookHotelMeal;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\BookingDocument;
use App\Models\BookingItinerary;
use App\Models\BookingPayment;
use App\Models\BookJeep;
use App\Models\BookOthersActivity;
use App\Models\BookRoomHotel;
use App\Models\CarConfiguration;
use App\Models\Country;
use App\Models\Discount;
use App\Models\GiftCard;
use App\Models\Hotel;
use App\Models\InvoiceHistory;
use App\Models\Itinerary;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\RoomHotel;
use App\Models\TwCalculation;
use App\Models\TwCalculationDetail;
use App\Models\User;
use App\Models\UserLog;
use App\Models\WaItinerary;
use App\Models\WaLog;
use Google\Client as GoogleClient;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\PdfToText\Pdf;

class BookingController extends Controller
{
    function create(Request $request, $channel){
        $countries = Country::orderBy('long_name','asc')->get()->map(function($query){
            return [
                'value' => $query->id,
                'label' => $query->long_name,
            ];
        });
        $packages = []; 
        if($channel != 'twt'){
            $packages = Package::select('id','name','package_code','duration_id')->with('duration')->with(['packagePrice.priceCategory','itinerary','packageHotel' => function($q){
                $q->where('price_plan_id',2);
            }]);
            if($channel == 'jvto'){
                $packages->where('package_platform','!=','klook')->where('is_publish','1');
            }else{
                $packages->where('package_platform','klook');
            }
            $packages = $packages->orderBy('package_code','asc')->get();
            $packages = $packages->map(function($query){
                return [
                    'value' => $query->id,
                    'label' => $query->package_code." - ".$query->name,
                    'day' => (int)$query->duration->day,
                    'night' => (int)$query->duration->night,
                    'prices' => $query->packagePrice->map(function($q){
                        return [
                            'start' => $q->priceCategory->start,
                            'end' => $q->priceCategory->end,
                            'pricePerPax' => $q->price,
                        ];
                    }),
                    'itineraries' => $query->itinerary->map(function($q){
                        return [
                            'day' => (int)$q->day,
                            'activity_start_id' => $q->activity_start_id,
                            'activity_end_id' => $q->activity_end_id,
                            'itinerary' => $q->title,
                        ];
                    }),
                    'hotels' => $query->packageHotel->map(function($q){
                        return [
                            'day' => (int)$q->day,
                            'hotel_id' => $q->hotel_id,
                        ];
                    })
                ];
            });
        }

        $startActivities = ActivityStart::select('id','name','description as itinerary','destination_id')->orderBy('name','asc')->get();
        $endActivities = ActivityEnd::select('id','name','description as itinerary')->orderBy('name','asc')->get();
        $hotels = Hotel::with('roomHotel')->select('id','name','destination_id')->orderBy('id','asc')->get();
        $addOns = AddOn::select('id as value','add_on as label','price as defaultPrice')->orderBy('label','asc')->get();
        $discountCodes = Discount::select('id','name','type','disc as value')->where('is_isic','0')->whereNull('user_id')->get();
        

        return Inertia::render('Bookings/AddBooking', [
            'channel' => strtoupper($channel),
            'countries' => $countries,
            'packages' => $packages,
            'hotelOptions' => $hotels->map(function($query){
                return [
                    'id' => $query->id,
                    'name' => $query->name,
                    'destination_id' => $query->destination_id,
                ];
            }),
            'hotelRoomOptions' => $hotels->groupBy('id')->map(function($rooms) {
                return $rooms->flatMap(function($room) {
                    return $room->roomHotel->map(function($roomDetail) {
                        return [
                            'id' => $roomDetail->id,
                            'name' => $roomDetail->room_name,
                        ];
                    });
                })->values();
            }),
            'startActivityOptions' => $startActivities,
            'addOns' => $addOns,
            'discountCodes' => $discountCodes,
            'endActivityOptions' => $endActivities,
        ]);
    }
    function edit($id){
        $booking = Booking::select('*','discount as discountValue')->with(['user','bookingDetail.package','discount','bookAddOn','bookingItinerary.bookHotel.hotel','bookingItinerary.bookHotel.bookRoom.roomHotel'])->where('id',$id)->first();

        if($booking->agent_id == 1){
            $channel = 'twt';
        }
        else if($booking->agent_id == 2){
            if($booking->booking_category_id != 3){
                $channel = 'jvto';
            }
            else{
                $channel = 'klook';
            }
        }
        $countries = Country::orderBy('long_name','asc')->get()->map(function($query){
            return [
                'value' => $query->id,
                'label' => $query->long_name,
            ];
        });
        $packages = []; 
        if($channel != 'twt'){
            $packages = Package::select('id','name','package_code','duration_id')->with('duration')->with(['packagePrice.priceCategory','itinerary','packageHotel' => function($q){
                $q->where('price_plan_id',2);
            }]);
            if($channel == 'jvto'){
                $packages->where('package_platform','!=','klook')->where('is_publish','1');
            }else{
                $packages->where('package_platform','klook');
            }
            $packages = $packages->orderBy('package_code','asc')->get();
            $packages = $packages->map(function($query){
                return [
                    'value' => $query->id,
                    'label' => $query->package_code." - ".$query->name,
                    'day' => (int)$query->duration->day,
                    'night' => (int)$query->duration->night,
                    'prices' => $query->packagePrice->map(function($q){
                        return [
                            'start' => $q->priceCategory->start,
                            'end' => $q->priceCategory->end,
                            'pricePerPax' => (int)$q->price,
                        ];
                    }),
                    'itineraries' => $query->itinerary->map(function($q){
                        return [
                            'day' => (int)$q->day,
                            'activity_start_id' => $q->activity_start_id,
                            'activity_end_id' => $q->activity_end_id,
                            'itinerary' => $q->title,
                        ];
                    }),
                    'hotels' => $query->packageHotel->map(function($q){
                        return [
                            'day' => (int)$q->day,
                            'hotel_id' => $q->hotel_id,
                        ];
                    })
                ];
            });
        }

        $startActivities = ActivityStart::select('id','name','description as itinerary','destination_id')->orderBy('name','asc')->get();
        $endActivities = ActivityEnd::select('id','name','description as itinerary')->orderBy('name','asc')->get();
        $hotels = Hotel::with('roomHotel')->select('id','name','destination_id')->orderBy('id','asc')->get();
        $addOns = AddOn::select('id as value','add_on as label','price as defaultPrice')->orderBy('label','asc')->get();
        $discountCodes = Discount::select('id','name','type','disc as value')->where('is_isic','0')->whereNull('user_id')->get();
        

        return Inertia::render('Bookings/EditBooking', [
            'booking' => $booking,
            'channel' => strtoupper($channel),
            'countries' => $countries,
            'packages' => $packages,
            'hotelOptions' => $hotels->map(function($query){
                return [
                    'id' => $query->id,
                    'name' => $query->name,
                    'destination_id' => $query->destination_id,
                ];
            }),
            'hotelRoomOptions' => $hotels->groupBy('id')->map(function($rooms) {
                return $rooms->flatMap(function($room) {
                    return $room->roomHotel->map(function($roomDetail) {
                        return [
                            'id' => $roomDetail->id,
                            'name' => $roomDetail->room_name,
                        ];
                    });
                })->values();
            }),
            'startActivityOptions' => $startActivities,
            'addOns' => $addOns,
            'discountCodes' => $discountCodes,
            'endActivityOptions' => $endActivities,
        ]);
    }

    function store(Request $request){
        // return $request->all();
        $user = new User;
        $user->name = $request->customer;
        if($request->channel == 'TWT'){
            $agent_id = 1;
            $booking_category_id = NULL;
            $attachment_id = 6;
        }
        else{
            $user->email = $request->email;
            $user->phone = $request->phone;
            $user->country_id = $request->nationality;
            $agent_id = 2;
            if($request->channel == 'JVTO'){
                $booking_category_id = $request->type;
            }
            else{
                $booking_category_id = 3;
                $attachment_id = 7;
            }
        }
        $user->avatar = "default.jpg";
        $user->password  = Hash::make('password');
        $user->save();

    if ($request->has('newAddOns') && !empty($request->newAddOns)) {
        $newAddOns = json_decode($request->newAddOns, true);
        foreach ($newAddOns as $newAddOn) {
            $addOn = new AddOn();
            $addOn->add_on = $newAddOn['name'];
            $addOn->price = $newAddOn['price'];
            $addOn->save();
        }
    }
        $ym = date('Y-m', strtotime($request->travelDate));
        $getBooking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
        $getBooking = $getBooking->orderBy('booking_numb', 'desc');
        $count = $getBooking->count();
        if ($count == 0) {
            $code = '001';
        } else {
            $getBooking = $getBooking->first();
            $code = (int) $getBooking->booking_numb + 1;
            $code = sprintf("%03s", $code);
        }

        $invoiceCode = [
            'year' => date("y", strtotime($request->travelDate)),
            'month' => date("m", strtotime($request->travelDate)),
            'code' => $code
        ];

        $invoice_number = "JVR/$invoiceCode[code]/$invoiceCode[month]/$invoiceCode[year]";
        $packageDays = json_decode($request->packageDays, true);
        $pickupLocation = json_decode($request->pickupLocation, true);
        $dropLocation = json_decode($request->dropLocation, true);
        $summary = json_decode($request->summary, true);
        $discount = json_decode($request->discount, true);
        $addOns = json_decode($request->addOns, true);
        $tshirts = json_decode($request->sizes, true);
        $days = count($packageDays);
        $nights = $days-1;

        $booking = new Booking();
        $booking->booking_code = $invoice_number;
        $booking->custom_code = $invoice_number;
        $booking->agent_id = $agent_id;
        $booking->booking_category_id = $booking_category_id;
        if($request->bookingDate && $request->bookingDate != null && $request->bookingDate != 'null' && $request->bookingDate != ''){
            $booking->booking_date = $request->bookingDate;
        }
        else{
            $booking->booking_date = date('Y-m-d');
        }
        if($request->dueDate && $request->dueDate != null && $request->dueDate != 'null' && $request->dueDate != ''){
            $booking->due_date = $request->dueDate;
        }
        $booking->invoice_code_origin = $request->bookingCodeOrigin;
        $booking->booking_numb = $code;
        $booking->user_id = $user->id;
        $booking->travel_date_start = $request->travelDate;
        $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$nights days"));
        $booking->package_duration = $days;
        $booking->total_pax = $request->numOfPax;

        //pickup
        $booking->meeting_point = $pickupLocation['location'];
        if($pickupLocation['location'] == 'Surabaya Airport' || $pickupLocation['location'] == 'Denpasar Airport'){
            $booking->meeting_point_arrival = $pickupLocation['terminal'];
            $booking->meeting_point_value = $pickupLocation['ticketNumber'];
        }
        if($pickupLocation['location'] == 'Surabaya Train Station'){
            $booking->meeting_point_arrival = $pickupLocation['station'];
            $booking->meeting_point_value = $pickupLocation['ticketNumber'];
        }
        if($pickupLocation['location'] == 'Surabaya Hotel' || $pickupLocation['location'] == 'Bali Hotel'){
            $booking->meeting_point_value = $pickupLocation['hotelName'];
        }
        if($pickupLocation['location'] == 'Others'){
            $booking->pickup = $pickupLocation['customLocation'];
            $booking->meeting_point_value = $pickupLocation['customLocation'];
        }
        else{
            $booking->pickup = $pickupLocation['location']." ".$booking->meeting_point_arrival." ".$booking->meeting_point_value;
        }
        //drop
        $booking->drop_point = $dropLocation['location'];
        if($dropLocation['location'] == 'Surabaya Airport' || $dropLocation['location'] == 'Denpasar Airport'){
            $booking->drop_point_arrival = $dropLocation['terminal'];
            $booking->drop_point_value = $dropLocation['ticketNumber'];
        }
        if($dropLocation['location'] == 'Surabaya Train Station'){
            $booking->drop_point_arrival = $dropLocation['station'];
            $booking->drop_point_value = $dropLocation['ticketNumber'];
        }
        if($dropLocation['location'] == 'Surabaya Hotel' || $dropLocation['location'] == 'Bali Hotel'){
            $booking->drop_point_value = $dropLocation['hotelName'];
        }
        if($dropLocation['location'] == 'Others'){
            $booking->drop = $dropLocation['customLocation'];
            $booking->drop_point_value = $dropLocation['customLocation'];
        }
        else{
            $booking->drop = $dropLocation['location']." ".$booking->drop_point_arrival." ".$booking->drop_point_value;
        }

        $booking->pickup_time = $request->pickupTime && $request->pickupTime != '' && $request->pickupTime != null && $request->pickupTime != 'null' ? $request->pickupTime : null;
        $booking->drop_time = $request->dropTime && $request->dropTime != '' && $request->dropTime != null && $request->dropTime != 'null' ? $request->dropTime : null;

        $booking->dp_no_idr = 0;
        $booking->payment = 0;

        if ($summary['discount'] != 0) {
            if($discount['discountId']){
                $booking->discount_id = $discount['discountId'];
            }
            $booking->discount_type = $discount['type'];
            $booking->discount = $discount['value'];
        }

        $booking->grand_total_before_disc = $summary['totalPackage'];
        $booking->add_on_total = $summary['totalAddOn'];

        $booking->grand_total = $summary['totalPackage'] - $summary['discount'];
        $booking->dp = 20/100 * $booking->grand_total;

        $booking->balance = $booking->grand_total+$booking->add_on_total;
        $booking->status = 'booked';
        $booking->type = 'offline';
        $booking->payment_method = 'pay later';
        $booking->url_name = $user->name.$user->id;
        $booking->url = md5($booking->url_name);

        if ($request->isShuttle == 'true') {
            $booking->is_shuttle = '1';
        }
        if ($request->isSendWa == 'true') {
            $booking->is_send_wa = '1';
            $booking->wa_schedule_trip_information = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -2 days"));
            $booking->wa_schedule_trip_media = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " +$nights days"));
            $booking->wa_schedule_trip_media_crew = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " -1 days"));
        }
        $booking->wa_schedule_reminder_crew = date('Y-m-d 10:00:00', strtotime($booking->travel_date_start . " -1 days"));

        $booking->save();

        if ($request->hasFile('bookingFileOrigin')) {
            $fileName = time() . '.' . $request->file('bookingFileOrigin')->extension();
            $request->file('bookingFileOrigin')->move(public_path('assets/customer-document'), $fileName);

            $bookingDocument = new BookingDocument();
            $bookingDocument->booking_id = $booking->id;
            $bookingDocument->user_id = $booking->user_id;
            $bookingDocument->attachment_type_id = $attachment_id; //Klook Booking Ticket
            $bookingDocument->file = $fileName;
            $bookingDocument->save();
        }
        $isPackage = $request->packageName && $request->packageName != '' && $request->packageName != 'Custom' && $request->packageName != null && $request->packageName != 'null' ? true : false;

        if ($isPackage) {
            $package = Package::find($request->packageName);
            $invoiceDescription = $package ? $package->name : $booking->package_duration . " Days " . $nights . " Night Package";
            $packageId = $package ? $package->id : null;
        } else {
            $invoiceDescription = $booking->package_duration . " Days " . $nights . " Night Package";
            $packageId = null;
        }

        $invoiceHistory[] = [
            'booking_id' => $booking->id,
            'description' => $invoiceDescription,
            'rate' => $summary['pricePerPax'],
            'qty' => $booking->total_pax,
            'line_total' => $summary['totalPackage'],
            'type' => 'package',
            'parent_id' => $packageId,
        ];

    if ($summary['totalAddOn']) {
        foreach ($addOns as $key => $value) {
            $bookAddOn = new BookAddOn();
            
            // Jika addOn berupa string 'new-X', cari berdasarkan nama
            if (is_string($value['addOn']) && strpos($value['addOn'], 'new-') === 0) {
                // Ambil add-on berdasarkan nama dari newAddOns
                $newAddOnIndex = (int)str_replace('new-', '', $value['addOn']);
                $newAddOns = json_decode($request->newAddOns, true);
                
                if (isset($newAddOns[$newAddOnIndex])) {
                    $addOnName = $newAddOns[$newAddOnIndex]['name'];
                    $addOnRecord = AddOn::where('add_on', $addOnName)->orderBy('id', 'desc')->first();
                    
                    if ($addOnRecord) {
                        $bookAddOn->add_on_id = $addOnRecord->id;
                    }
                }
            } else {
                $bookAddOn->add_on_id = $value['addOn'];
            }
            
            $bookAddOn->booking_id = $booking->id;
            $bookAddOn->price = $value['price'];
            $bookAddOn->price_expense = $value['price'];
            $bookAddOn->qty = $value['quantity'];
            $bookAddOn->save();

            $getAddOn = AddOn::find($bookAddOn->add_on_id);

            $invoiceHistory[] = [
                'booking_id' => $booking->id,
                'description' => $getAddOn->add_on,
                'rate' => $bookAddOn->price,
                'qty' => $bookAddOn->qty,
                'line_total' => $bookAddOn->price * $bookAddOn->qty,
                'type' => 'add on',
                'parent_id' => $bookAddOn->add_on_id,
            ];
        }
    }

        $bookingDetail = new BookingDetail();
        $bookingDetail->booking_id = $booking->id;
        if($isPackage){
            $bookingDetail->package_id = $request->packageName;
        }
        $bookingDetail->travel_date_start = $booking->travel_date_start;
        $bookingDetail->travel_date_end = $booking->travel_date_end;
        $bookingDetail->pax = $booking->total_pax;
        $bookingDetail->xss = $tshirts['xss'] ? $tshirts['xss'] : 0;
        $bookingDetail->xxs = $tshirts['xxs'] ? $tshirts['xxs'] : 0;
        $bookingDetail->xs = $tshirts['xs'] ? $tshirts['xs'] : 0;
        $bookingDetail->s = $tshirts['s'] ? $tshirts['s'] : 0;
        $bookingDetail->m = $tshirts['m'] ? $tshirts['m'] : 0;
        $bookingDetail->l = $tshirts['l'] ? $tshirts['l'] : 0;
        $bookingDetail->xl = $tshirts['xl'] ? $tshirts['xl'] : 0;
        $bookingDetail->xxl = $tshirts['xxl'] ? $tshirts['xxl'] : 0;
        $bookingDetail->xxxl = $tshirts['xxxl'] ? $tshirts['xxxl'] : 0;
        $bookingDetail->total = 0;
        $bookingDetail->save();

        $startSchedule = 0;
        $daySchedule = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -1 days"));
        $day = 0;
        foreach ($packageDays as $key => $value) {
            $day++;
            if ($value['startActivity'] && $value['startActivity'] != '') {
                $getStart = ActivityStart::find($value['startActivity']);
                $getEnd = ActivityEnd::find($value['endActivity']);

                if ($getStart->destination_id == 2) {
                    $updateAtIjen = Booking::find($booking->id);
                    $plus = $day - 1;
                    $updateAtIjen->at_bondowoso = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
                    $updateAtIjen->save();
                }

                if ($getStart->destination_id == 1) {
                    $updateAtBromo = Booking::find($booking->id);
                    $plus = $day - 1;
                    $updateAtBromo->at_bromo = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
                    $updateAtBromo->save();
                }
                $getEndName = '';
                $getEndId = null;
                if ($getEnd) {
                    $getEndName = $getEnd->name;
                    $getEndId = $getEnd->id;
                }
                $bookingItinerary = new BookingItinerary();
                $bookingItinerary->booking_id = $booking->id;
                $bookingItinerary->day = $day;
                $bookingItinerary->activity_start_id = $getStart->id;
                $bookingItinerary->activity_end_id = $getEndId;
                $bookingItinerary->itinerary = $getStart->name . ' - ' . $getEndName;
                $bookingItinerary->activity = $value['itinerary'];
                $bookingItinerary->b = $value['meals']['breakfast'] ? '1' : '0';
                $bookingItinerary->l = $value['meals']['lunch'] ? '1' : '0';
                $bookingItinerary->d = $value['meals']['dinner'] ? '1' : '0';
                $bookingItinerary->save();
                if ($request->isSendWa) {
                    $waItinerary = new WaItinerary();
                    $waItinerary->booking_id = $booking->id;
                    $waItinerary->user_id = $booking->user_id;
                    $waItinerary->day = $day;
                    $waItinerary->message = "*" . $bookingItinerary->itinerary . "*{br}" . $bookingItinerary->activity;
                    $waItinerary->schedule = date('Y-m-d 20:00:00', strtotime($daySchedule . " +$startSchedule days"));
                    $waItinerary->save();
                }
                if ($value['hotel'] && $value['hotel'] != '') {
                    $bookHotel = new BookHotel();
                    $bookHotel->booking_id = $booking->id;
                    $bookHotel->booking_itinerary_id = $bookingItinerary->id;
                    $bookHotel->hotel_id = $value['hotel'];
                    $bookHotel->b = $value['meals']['breakfast'] ? '1' : '0';
                    $bookHotel->l = $value['meals']['lunch'] ? '1' : '0';
                    $bookHotel->d = $value['meals']['dinner'] ? '1' : '0';
                    $bookHotel->status = NULL;
                    $bookHotel->save();

                    $textMeals = "";
                    if($bookHotel->d == '1' || $bookHotel->l == '1'){
                        $textMeals = "Include ";
                        if($bookHotel->d == '1' && $bookHotel->l == '1'){
                            $textMeals .= "Dinner & Lunch ";
                        }
                        else if($bookHotel->d == '1' && $bookHotel->l != '1'){
                            $textMeals .= "Dinner ";
                        }
                        else if($bookHotel->d != '1' && $bookHotel->l == '1'){
                            $textMeals .= "Lunch ";
                        }
                        $textMeals .= $booking->total_pax." pax\r\n\r\n";
                    }                    


                    if ($getStart->destination_id == 1) {
                        $updateAtBromo = Booking::find($booking->id);
                        $updateAtBromo->bromo_hotel_id = $value['hotel'];
                        $updateAtBromo->bromo_hotel_checkin = date('Y-m-d', strtotime($updateAtBromo->at_bromo . " -1 days"));
                        $updateAtBromo->save();
                    }

                    $hotelRooms = '';
                    $currentRoomIndex = 0;
                    $hotelRoomNames = "";
                    $roomCount = count($value['rooms']);
                    foreach ($value['rooms'] as $keyRoom => $valueRoom) {
                        $currentRoomIndex++;                                    
                        if($valueRoom['room'] && $valueRoom['room'] != ''){
                            $getRoomDetails = RoomHotel::find($valueRoom['room']);
    
                            $bookRoom = new BookRoomHotel();
                            $bookRoom->booking_id = $booking->id;
                            $bookRoom->booking_itinerary_id = $bookingItinerary->id;
                            $bookRoom->book_hotel_id = $bookHotel->id;
                            $bookRoom->room_hotel_id = $valueRoom['room'];
                            $bookRoom->quantity = $valueRoom['quantity'];
                            $bookRoom->subtotal = $bookRoom->quantity * $getRoomDetails->rate;
                            $bookRoom->save();
                            $more = ($currentRoomIndex < $roomCount) ? " + " : "";                                        

                            $hotelRoomNames .= $getRoomDetails->room_name . " x " . $valueRoom['quantity'].$more;
                        }
                    }

                    $cekHotel = Hotel::find($value['hotel']);
                    if($cekHotel->group_wa_id && $request->channel != 'TWT'){
                        $dataSending = Array();
                        $dataSending["api_key"] = config('wa.wa_api_key');
                        $dataSending["number_key"] = config('wa.wa_number_key');
                        $night = $day - 1;
                        $checkInDate = date('d M Y', strtotime($booking->travel_date_start . " +$night days"));
                        $checkOutDate = date('d M Y', strtotime($booking->travel_date_start . " +$day days"));
                                        
                        $dataSending["group_id"] = $cekHotel->group_wa_id;
                        $customerName = $user->name." (".$booking->total_pax." PAX)";
                        $dataSending["message"] = "*📩 Room Reservation ".$cekHotel->name."*\r\n\r\n🗓 Check In : $checkInDate\r\n\r\n🛫Check Out : $checkOutDate\r\n\r\n👥 Guest : $customerName\r\n\r\n🛏 Rooms : $hotelRoomNames\r\n\r\n".$textMeals."Cek detail Reservasi ⬇️⬇️\r\nhttps://partner.javavolcano-touroperator.com/reservation/".$cekHotel->slug."\r\n\r\nTerima kasih";
    
                        $curl = curl_init();
                        curl_setopt_array($curl, array(
                          CURLOPT_URL => 'https://wa-dashboard.javavolcano-touroperator.com/api/v1/send_message_group',
                          CURLOPT_RETURNTRANSFER => true,
                          CURLOPT_ENCODING => '',
                          CURLOPT_MAXREDIRS => 10,
                          CURLOPT_TIMEOUT => 0,
                          CURLOPT_FOLLOWLOCATION => true,
                          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                          CURLOPT_CUSTOMREQUEST => 'POST',
                          CURLOPT_POSTFIELDS => json_encode($dataSending),
                          CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json'
                          ),
                        ));
                        $response = curl_exec($curl);
                        curl_close($curl);
                        $res = json_decode($response);
                    }
                }
                $startSchedule++;
            }
        }

        if ($request->channel == 'KLOOK') {
            $getGiftCard = GiftCard::get();
            $randomGiftCard = $getGiftCard->random();

            $discount = new Discount;
            $name = strtoupper($user->name);
            $name = str_replace(' ', '', $name);
            $discount->name = $name . "450";
            $discount->gift_card_id = $randomGiftCard->id;
            $discount->disc = 450000;
            $discount->type = 'nominal';
            $discount->user_id = $user->id;
            $discount->booking_id = $booking->id;
            $discount->is_verif = '0';
            $discount->valid_until = date('Y-12-31');
            $discount->save();
        }
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

        if($request->channel != 'TWT' ){
            $this->generateExpense($booking->id);            
        }

        if($booking->is_send_wa == '1'){
            $dataSending = Array();
            $dataSending["api_key"] = config('wa.wa_api_key');
            $dataSending["number_key"] = config('wa.wa_number_key');
            $isJvto = $booking->booking_category_id != 3 ? "\r\nYour *payment receipt, remaining balance, payment method*, and *tour itinerary* have all been sent to your registered email address.\r\n\r\nPlease kindly check your inbox (and spam folder just in case), or you can access it directly via the link below\r\n\r\n🔗 https://javavolcano-touroperator.com/my-booking/".$booking->url : '';
            $isKlook = $booking->booking_category_id == 3 ? "\r\n\r\nFor detailed trip information, you can check directly at the following link: https://javavolcano-touroperator.com/my-booking/".$booking->url : '';
                
            $dataSending["message"] = "✅ *Booking Confirmed – Java Volcano Tour Operator (JVTO)*\r\nThank you, ".$user->name.", for completing your *booking*.\r\n\r\nWe’re pleased to confirm that your *tour booking is now secured*. 📩".$isJvto."\r\n\r\nIf you have any questions or special requests, feel free to contact us via WhatsApp or email.".$isKlook."\r\n\r\n🙏 We truly appreciate your trust. We look forward to welcoming you on an unforgettable journey!\r\n\r\n*JVTO Team*";
            $dataSending["phone_no"] = (string)$user->phone;
            $dataSending["url"] = "https://legacy.javavolcano-touroperator.com/assets/img/banner.jpeg";
            $dataSending["separate_caption"] = "0";
    
            $curl = curl_init();
            curl_setopt_array($curl, array(
              CURLOPT_URL => 'https://wa-dashboard.javavolcano-touroperator.com/api/v1/send_image_url',
              CURLOPT_RETURNTRANSFER => true,
              CURLOPT_ENCODING => '',
              CURLOPT_MAXREDIRS => 10,
              CURLOPT_TIMEOUT => 0,
              CURLOPT_FOLLOWLOCATION => true,
              CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
              CURLOPT_CUSTOMREQUEST => 'POST',
              CURLOPT_POSTFIELDS => json_encode($dataSending),
              CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json'
              ),
            ));
            $response = curl_exec($curl);
            curl_close($curl);
            $res = json_decode($response);      
        }

        return back()->with('message', 'Booking saved successfully');
    }

    function update(Request $request){
        $booking = Booking::where('id', $request->booking_id)->first();
        if ($request->has('newAddOns') && !empty($request->newAddOns)) {
            $newAddOns = json_decode($request->newAddOns, true);
            foreach ($newAddOns as $newAddOn) {
                $addOn = new AddOn();
                $addOn->add_on = $newAddOn['name'];
                $addOn->price = $newAddOn['price'];
                $addOn->save();
            }
        }        
        $user = User::find($booking->user_id);
        $user->name = $request->customer;
        if($request->channel == 'TWT'){
            $agent_id = 1;
            $booking_category_id = NULL;
            $attachment_id = 6;
        }
        else{
            $user->email = $request->email;
            $user->phone = $request->phone;
            $user->country_id = $request->nationality;
            $agent_id = 2;
            if($request->channel == 'JVTO'){
                $booking_category_id = $request->type;
            }
            else{
                $booking_category_id = 3;
                $attachment_id = 7;
            }
        }
        $user->save();

        $monthOld = date('Y-m', strtotime($booking->travel_date_start));
        $ym = date('Y-m', strtotime($request->travelDate));
        if($monthOld != $ym){
            $getBooking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
            $getBooking = $getBooking->orderBy('booking_numb', 'desc');
            $count = $getBooking->count();
            if ($count == 0) {
                $code = '001';
            } else {
                $getBooking = $getBooking->first();
                $code = (int) $getBooking->booking_numb + 1;
                $code = sprintf("%03s", $code);
            }
    
            $invoiceCode = [
                'year' => date("y", strtotime($request->travelDate)),
                'month' => date("m", strtotime($request->travelDate)),
                'code' => $code
            ];        
            $invoice_number = "JVR/$invoiceCode[code]/$invoiceCode[month]/$invoiceCode[year]";        }
        else{
            $invoice_number = $booking->booking_code;
            $code = $booking->booking_numb;
        }

        $packageDays = json_decode($request->packageDays, true);
        $pickupLocation = json_decode($request->pickupLocation, true);
        $dropLocation = json_decode($request->dropLocation, true);
        $summary = json_decode($request->summary, true);
        $discount = json_decode($request->discount, true);
        $addOns = json_decode($request->addOns, true);
        $tshirts = json_decode($request->sizes, true);
        $days = count($packageDays);
        $nights = $days-1;

        $booking->booking_code = $invoice_number;
        $booking->custom_code = $invoice_number;
        $booking->booking_category_id = $booking_category_id;
        if($request->bookingDate && $request->bookingDate != null && $request->bookingDate != 'null' && $request->bookingDate != ''){
            $booking->booking_date = $request->bookingDate;
        }
        if($request->dueDate && $request->dueDate != null && $request->dueDate != 'null' && $request->dueDate != ''){
            $booking->due_date = $request->dueDate;
        }
        $booking->invoice_code_origin = $request->bookingCodeOrigin;
        $booking->booking_numb = $code;
        $booking->user_id = $user->id;
        $booking->travel_date_start = $request->travelDate;
        $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$nights days"));
        $booking->package_duration = $days;
        $booking->total_pax = $request->numOfPax;

        //pickup
        $booking->meeting_point = $pickupLocation['location'];
        if($pickupLocation['location'] == 'Surabaya Airport' || $pickupLocation['location'] == 'Denpasar Airport'){
            $booking->meeting_point_arrival = $pickupLocation['terminal'];
            $booking->meeting_point_value = $pickupLocation['ticketNumber'];
        }
        if($pickupLocation['location'] == 'Surabaya Train Station'){
            $booking->meeting_point_arrival = $pickupLocation['station'];
            $booking->meeting_point_value = $pickupLocation['ticketNumber'];
        }
        if($pickupLocation['location'] == 'Surabaya Hotel' || $pickupLocation['location'] == 'Bali Hotel'){
            $booking->meeting_point_value = $pickupLocation['hotelName'];
        }
        if($pickupLocation['location'] == 'Others'){
            $booking->pickup = $pickupLocation['customLocation'];
            $booking->meeting_point_value = $pickupLocation['customLocation'];
        }
        else{
            $booking->pickup = $pickupLocation['location']." ".$booking->meeting_point_arrival." ".$booking->meeting_point_value;
        }
        //drop
        $booking->drop_point = $dropLocation['location'];
        if($dropLocation['location'] == 'Surabaya Airport' || $dropLocation['location'] == 'Denpasar Airport'){
            $booking->drop_point_arrival = $dropLocation['terminal'];
            $booking->drop_point_value = $dropLocation['ticketNumber'];
        }
        if($dropLocation['location'] == 'Surabaya Train Station'){
            $booking->drop_point_arrival = $dropLocation['station'];
            $booking->drop_point_value = $dropLocation['ticketNumber'];
        }
        if($dropLocation['location'] == 'Surabaya Hotel' || $dropLocation['location'] == 'Bali Hotel'){
            $booking->drop_point_value = $dropLocation['hotelName'];
        }
        if($dropLocation['location'] == 'Others'){
            $booking->drop = $dropLocation['customLocation'];
            $booking->drop_point_value = $dropLocation['customLocation'];
        }
        else{
            $booking->drop = $dropLocation['location']." ".$booking->drop_point_arrival." ".$booking->drop_point_value;
        }

        $booking->pickup_time = $request->pickupTime && $request->pickupTime != '' && $request->pickupTime != null && $request->pickupTime != 'null' ? $request->pickupTime : null;
        $booking->drop_time = $request->dropTime && $request->dropTime != '' && $request->dropTime != null && $request->dropTime != 'null' ? $request->dropTime : null;

        if ($summary['discount'] != 0) {
            if($discount['discountId']){
                $booking->discount_id = $discount['discountId'];
            }
            $booking->discount_type = $discount['type'];
            $booking->discount = $discount['value'];
        }

        $booking->grand_total_before_disc = $summary['totalPackage'];
        $booking->add_on_total = $summary['totalAddOn'];

        $booking->grand_total = $summary['totalPackage'] - $summary['discount'];

        $booking->balance = $booking->grand_total + $booking->add_on_total -  $booking->payment;

        if ($request->isShuttle == 'true') {
            $booking->is_shuttle = '1';
        }
        else{
            $booking->is_shuttle = '0';
        }
        if ($request->isSendWa == 'true') {
            $booking->is_send_wa = '1';
            $booking->wa_schedule_trip_information = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -2 days"));
            $booking->wa_schedule_trip_media = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " +$nights days"));
            $booking->wa_schedule_trip_media_crew = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " -1 days"));
        }
        else{
            $booking->is_send_wa = '0';
            $booking->wa_schedule_trip_information = null;
            $booking->wa_schedule_trip_media = null;
            $booking->wa_schedule_trip_media_crew = null;
        }
        $booking->wa_schedule_reminder_crew = date('Y-m-d 10:00:00', strtotime($booking->travel_date_start . " -1 days"));
        
        $booking->save();

        if ($request->hasFile('bookingFileOrigin')) {
            $fileName = time() . '.' . $request->file('bookingFileOrigin')->extension();
            $request->file('bookingFileOrigin')->move(public_path('assets/customer-document'), $fileName);
        
            // Cek apakah sudah ada dokumen untuk booking_id dan attachment_type_id
            $bookingDocument = BookingDocument::where('booking_id', $booking->id)
                ->where('attachment_type_id', $attachment_id)
                ->first();
        
            // Jika ada, hapus file lama terlebih dahulu
            if ($bookingDocument && $bookingDocument->file) {
                $oldFilePath = public_path('assets/customer-document/' . $bookingDocument->file);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            } else {
                // Jika tidak ada dokumen sebelumnya, buat yang baru
                $bookingDocument = new BookingDocument;
                $bookingDocument->booking_id = $booking->id;
                $bookingDocument->user_id = $booking->user_id;
            }
        
            // Simpan data file baru
            $bookingDocument->attachment_type_id = $attachment_id;
            $bookingDocument->file = $fileName;
            $bookingDocument->save();
        }

        $isPackage = $request->packageName && $request->packageName != '' && $request->packageName != 'Custom' && $request->packageName != null && $request->packageName != 'null' ? true : false;
        
        
        if ($isPackage) {
            $package = Package::find($request->packageName);
            $invoiceDescription = $package ? $package->name : $booking->package_duration . " Days " . $nights . " Night Package";
            $packageId = $package ? $package->id : null;
        } else {
            $invoiceDescription = $booking->package_duration . " Days " . $nights . " Night Package";
            $packageId = null;
        }

        $invoiceHistory[] = [
            'booking_id' => $booking->id,
            'description' => $invoiceDescription,
            'rate' => $summary['pricePerPax'],
            'qty' => $booking->total_pax,
            'line_total' => $summary['totalPackage'],
            'type' => 'package',
            'parent_id' => $packageId,
        ];

        BookAddOn::where('booking_id',$booking->id)->delete();
        InvoiceHistory::where('booking_id',$booking->id)->delete();
    if ($summary['totalAddOn']) {
        foreach ($addOns as $key => $value) {
            $bookAddOn = new BookAddOn();
            
            // Handle add-on ID mapping untuk add-on baru
            $addOnId = $value['addOn'];
            if (is_string($addOnId) && strpos($addOnId, 'new-') === 0) {
                // Ini adalah add-on baru, cari berdasarkan nama
                $tempIndex = (int)str_replace('new-', '', $addOnId);
                $newAddOns = json_decode($request->newAddOns, true);
                
                if (isset($newAddOns[$tempIndex])) {
                    $addOnName = $newAddOns[$tempIndex]['name'];
                    $addOnRecord = AddOn::where('add_on', $addOnName)->orderBy('id', 'desc')->first();
                    
                    if ($addOnRecord) {
                        $addOnId = $addOnRecord->id;
                    }
                }
            }
            
            $bookAddOn->add_on_id = $addOnId;
            $bookAddOn->booking_id = $booking->id;
            $bookAddOn->price = $value['price'];
            $bookAddOn->qty = $value['quantity'];
            $bookAddOn->save();

            $getAddOn = AddOn::find($bookAddOn->add_on_id);

            $invoiceHistory[] = [
                'booking_id' => $booking->id,
                'description' => $getAddOn->add_on,
                'rate' => $bookAddOn->price,
                'qty' => $bookAddOn->qty,
                'line_total' => $bookAddOn->price * $bookAddOn->qty,
                'type' => 'add on',
                'parent_id' => $bookAddOn->add_on_id,
            ];
        }
    }
        
        $bookingDetail = BookingDetail::where('booking_id',$booking->id)->first();
        if($isPackage){
            $bookingDetail->package_id = $request->packageName;
        }
        $bookingDetail->travel_date_start = $booking->travel_date_start;
        $bookingDetail->travel_date_end = $booking->travel_date_end;
        $bookingDetail->pax = $booking->total_pax;
        $bookingDetail->xss = $tshirts['xss'] ? $tshirts['xss'] : 0;
        $bookingDetail->xxs = $tshirts['xxs'] ? $tshirts['xxs'] : 0;
        $bookingDetail->xs = $tshirts['xs'] ? $tshirts['xs'] : 0;
        $bookingDetail->s = $tshirts['s'] ? $tshirts['s'] : 0;
        $bookingDetail->m = $tshirts['m'] ? $tshirts['m'] : 0;
        $bookingDetail->l = $tshirts['l'] ? $tshirts['l'] : 0;
        $bookingDetail->xl = $tshirts['xl'] ? $tshirts['xl'] : 0;
        $bookingDetail->xxl = $tshirts['xxl'] ? $tshirts['xxl'] : 0;
        $bookingDetail->xxxl = $tshirts['xxxl'] ? $tshirts['xxxl'] : 0;
        $bookingDetail->total = 0;
        $bookingDetail->save();
        
        $startSchedule = 0;
        $daySchedule = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -1 days"));
        $day = 0;

        // WaItinerary::where('booking_id',$booking->id)->delete();
        // BookRoomHotel::where('booking_id',$booking->id)->delete();
        // BookHotel::where('booking_id',$booking->id)->delete();
        // BookingItinerary::where('booking_id',$booking->id)->delete();
        // foreach ($packageDays as $key => $value) {
        //     $day++;
        //     if ($value['startActivity'] && $value['startActivity'] != '') {
        //         $getStart = ActivityStart::find($value['startActivity']);
        //         $getEnd = ActivityEnd::find($value['endActivity']);

        //         if ($getStart->destination_id == 2) {
        //             $updateAtIjen = Booking::find($booking->id);
        //             $plus = $day - 1;
        //             $updateAtIjen->at_bondowoso = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
        //             $updateAtIjen->save();
        //         }

        //         if ($getStart->destination_id == 1) {
        //             $updateAtBromo = Booking::find($booking->id);
        //             $plus = $day - 1;
        //             $updateAtBromo->at_bromo = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
        //             $updateAtBromo->save();
        //         }
        //         $getEndName = '';
        //         $getEndId = null;
        //         if ($getEnd) {
        //             $getEndName = $getEnd->name;
        //             $getEndId = $getEnd->id;
        //         }
        //         $bookingItinerary = new BookingItinerary();
        //         $bookingItinerary->booking_id = $booking->id;
        //         $bookingItinerary->day = $day;
        //         $bookingItinerary->activity_start_id = $getStart->id;
        //         $bookingItinerary->activity_end_id = $getEndId;
        //         $bookingItinerary->itinerary = $getStart->name . ' - ' . $getEndName;
        //         $bookingItinerary->activity = $value['itinerary'];
        //         $bookingItinerary->b = $value['meals']['breakfast'] ? '1' : '0';
        //         $bookingItinerary->l = $value['meals']['lunch'] ? '1' : '0';
        //         $bookingItinerary->d = $value['meals']['dinner'] ? '1' : '0';
        //         $bookingItinerary->save();
        //         if ($request->isSendWa) {
        //             $waItinerary = new WaItinerary();
        //             $waItinerary->booking_id = $booking->id;
        //             $waItinerary->user_id = $booking->user_id;
        //             $waItinerary->day = $day;
        //             $waItinerary->message = "*" . $bookingItinerary->itinerary . "*{br}" . $bookingItinerary->activity;
        //             $waItinerary->schedule = date('Y-m-d 20:00:00', strtotime($daySchedule . " +$startSchedule days"));
        //             $waItinerary->save();
        //         }
        //         if ($value['hotel'] && $value['hotel'] != '') {
        //             $bookHotel = new BookHotel();
        //             $bookHotel->booking_id = $booking->id;
        //             $bookHotel->booking_itinerary_id = $bookingItinerary->id;
        //             $bookHotel->hotel_id = $value['hotel'];
        //             $bookHotel->b = $value['meals']['breakfast'] ? '1' : '0';
        //             $bookHotel->l = $value['meals']['lunch'] ? '1' : '0';
        //             $bookHotel->d = $value['meals']['dinner'] ? '1' : '0';
        //             $bookHotel->status = NULL;
        //             $bookHotel->save();

        //             if ($getStart->destination_id == 1) {
        //                 $updateAtBromo = Booking::find($booking->id);
        //                 $updateAtBromo->bromo_hotel_id = $value['hotel'];
        //                 $updateAtBromo->bromo_hotel_checkin = date('Y-m-d', strtotime($updateAtBromo->at_bromo . " -1 days"));
        //                 $updateAtBromo->save();
        //             }

        //             $hotelRooms = '';
        //             $currentRoomIndex = 0;

        //             foreach ($value['rooms'] as $keyRoom => $valueRoom) {
        //                 if($valueRoom['room'] && $valueRoom['room'] != ''){
        //                     $getRoomDetails = RoomHotel::find($valueRoom['room']);
    
        //                     $bookRoom = new BookRoomHotel();
        //                     $bookRoom->booking_id = $booking->id;
        //                     $bookRoom->booking_itinerary_id = $bookingItinerary->id;
        //                     $bookRoom->book_hotel_id = $bookHotel->id;
        //                     $bookRoom->room_hotel_id = $valueRoom['room'];
        //                     $bookRoom->quantity = $valueRoom['quantity'];
        //                     $bookRoom->subtotal = $bookRoom->quantity * $getRoomDetails->rate;
        //                     $bookRoom->save();
        //                 }
        //             }
        //         }
        //         $startSchedule++;
        //     }
        // }

        // Pendekatan ini hanya menghapus WaItinerary di awal
        // BookingItinerary, BookHotel, dan BookRoomHotel akan diproses selektif
        WaItinerary::where('booking_id',$booking->id)->delete();

        // Simpan data hotel yang ada untuk referensi
        $existingHotels = [];
        $existingBookHotels = BookHotel::where('booking_id', $booking->id)->get();
        foreach ($existingBookHotels as $existingHotel) {
            $itinerary = BookingItinerary::find($existingHotel->booking_itinerary_id);
            if ($itinerary) {
                $day = $itinerary->day;
                $existingHotels[$day] = [
                    'hotel_id' => $existingHotel->hotel_id,
                    'book_hotel_id' => $existingHotel->id,
                    'booking_itinerary_id' => $existingHotel->booking_itinerary_id,
                    'rooms' => []
                ];
                
                // Simpan data room yang ada
                $existingRooms = BookRoomHotel::where('book_hotel_id', $existingHotel->id)->get();
                foreach ($existingRooms as $room) {
                    $existingHotels[$day]['rooms'][] = [
                        'id' => $room->id,
                        'room_hotel_id' => $room->room_hotel_id,
                        'quantity' => $room->quantity
                    ];
                }
            }
        }

        // Simpan referensi ke itinerary yang ada
        $existingItineraries = [];
        $itineraries = BookingItinerary::where('booking_id', $booking->id)->get();
        foreach ($itineraries as $itinerary) {
            $existingItineraries[$itinerary->day] = $itinerary;
        }

        // Array untuk melacak ID yang akan dipertahankan
        $usedHotelIds = [];
        $usedItineraryIds = [];
        $day = 0;

        foreach ($packageDays as $key => $value) {
            $day++;
            if ($value['startActivity'] && $value['startActivity'] != '') {
                $getStart = ActivityStart::find($value['startActivity']);
                $getEnd = ActivityEnd::find($value['endActivity']);

                if ($getStart->destination_id == 2) {
                    $updateAtIjen = Booking::find($booking->id);
                    $plus = $day - 1;
                    $updateAtIjen->at_bondowoso = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
                    $updateAtIjen->save();
                }

                if ($getStart->destination_id == 1) {
                    $updateAtBromo = Booking::find($booking->id);
                    $plus = $day - 1;
                    $updateAtBromo->at_bromo = date('Y-m-d', strtotime($booking->travel_date_start . " +$plus days"));
                    $updateAtBromo->save();
                }
                
                $getEndName = '';
                $getEndId = null;
                if ($getEnd) {
                    $getEndName = $getEnd->name;
                    $getEndId = $getEnd->id;
                }
                
                // Proses itinerary (update jika sudah ada, buat baru jika belum)
                if (isset($existingItineraries[$day])) {
                    $bookingItinerary = $existingItineraries[$day];
                    $bookingItinerary->activity_start_id = $getStart->id;
                    $bookingItinerary->activity_end_id = $getEndId;
                    $bookingItinerary->itinerary = $getStart->name . ' - ' . $getEndName;
                    $bookingItinerary->activity = $value['itinerary'];
                    $bookingItinerary->b = $value['meals']['breakfast'] ? '1' : '0';
                    $bookingItinerary->l = $value['meals']['lunch'] ? '1' : '0';
                    $bookingItinerary->d = $value['meals']['dinner'] ? '1' : '0';
                    $bookingItinerary->save();
                } else {
                    $bookingItinerary = new BookingItinerary();
                    $bookingItinerary->booking_id = $booking->id;
                    $bookingItinerary->day = $day;
                    $bookingItinerary->activity_start_id = $getStart->id;
                    $bookingItinerary->activity_end_id = $getEndId;
                    $bookingItinerary->itinerary = $getStart->name . ' - ' . $getEndName;
                    $bookingItinerary->activity = $value['itinerary'];
                    $bookingItinerary->b = $value['meals']['breakfast'] ? '1' : '0';
                    $bookingItinerary->l = $value['meals']['lunch'] ? '1' : '0';
                    $bookingItinerary->d = $value['meals']['dinner'] ? '1' : '0';
                    $bookingItinerary->save();
                }
                
                // Tambahkan ID itinerary ke daftar yang digunakan
                $usedItineraryIds[] = $bookingItinerary->id;
                
                if ($request->isSendWa) {
                    $waItinerary = new WaItinerary();
                    $waItinerary->booking_id = $booking->id;
                    $waItinerary->user_id = $booking->user_id;
                    $waItinerary->day = $day;
                    $waItinerary->message = "*" . $bookingItinerary->itinerary . "*{br}" . $bookingItinerary->activity;
                    $waItinerary->schedule = date('Y-m-d 20:00:00', strtotime($daySchedule . " +$startSchedule days"));
                    $waItinerary->save();
                }
                
                if ($value['hotel'] && $value['hotel'] != '') {
                    // Cek apakah hotel untuk hari ini sama dengan yang sudah ada
                    $hotelExists = isset($existingHotels[$day]) && $existingHotels[$day]['hotel_id'] == $value['hotel'];
                    
                    if ($hotelExists) {
                        // Update hotel yang sudah ada
                        $bookHotel = BookHotel::find($existingHotels[$day]['book_hotel_id']);
                        $bookHotel->booking_itinerary_id = $bookingItinerary->id;
                        $bookHotel->b = $value['meals']['breakfast'] ? '1' : '0';
                        $bookHotel->l = $value['meals']['lunch'] ? '1' : '0';
                        $bookHotel->d = $value['meals']['dinner'] ? '1' : '0';
                        $bookHotel->save();
                        
                        // Tandai hotel ini sebagai digunakan
                        $usedHotelIds[] = $bookHotel->id;
                        
                        // Hapus semua room dulu karena akan diupdate
                        BookRoomHotel::where('book_hotel_id', $bookHotel->id)->delete();
                    } else {
                        // Buat hotel baru
                        $bookHotel = new BookHotel();
                        $bookHotel->booking_id = $booking->id;
                        $bookHotel->booking_itinerary_id = $bookingItinerary->id;
                        $bookHotel->hotel_id = $value['hotel'];
                        $bookHotel->b = $value['meals']['breakfast'] ? '1' : '0';
                        $bookHotel->l = $value['meals']['lunch'] ? '1' : '0';
                        $bookHotel->d = $value['meals']['dinner'] ? '1' : '0';
                        $bookHotel->status = NULL;
                        $bookHotel->save();
                        
                        // Tandai hotel ini sebagai digunakan
                        $usedHotelIds[] = $bookHotel->id;
                    }

                    if ($getStart->destination_id == 1) {
                        $updateAtBromo = Booking::find($booking->id);
                        $updateAtBromo->bromo_hotel_id = $value['hotel'];
                        $updateAtBromo->bromo_hotel_checkin = date('Y-m-d', strtotime($updateAtBromo->at_bromo . " -1 days"));
                        $updateAtBromo->save();
                    }

                    // Tambahkan room baru
                    foreach ($value['rooms'] as $keyRoom => $valueRoom) {
                        if($valueRoom['room'] && $valueRoom['room'] != ''){
                            $getRoomDetails = RoomHotel::find($valueRoom['room']);

                            $bookRoom = new BookRoomHotel();
                            $bookRoom->booking_id = $booking->id;
                            $bookRoom->booking_itinerary_id = $bookingItinerary->id;
                            $bookRoom->book_hotel_id = $bookHotel->id;
                            $bookRoom->room_hotel_id = $valueRoom['room'];
                            $bookRoom->quantity = $valueRoom['quantity'];
                            $bookRoom->subtotal = $bookRoom->quantity * $getRoomDetails->rate;
                            $bookRoom->save();
                        }
                    }
                }
                $startSchedule++;
            }
        }

        // Hapus hotel yang tidak lagi digunakan dalam update ini
        // Pastikan untuk menghapus data room terlebih dahulu
        $unusedHotels = BookHotel::where('booking_id', $booking->id)
                                ->whereNotIn('id', $usedHotelIds)
                                ->get();
                                
        foreach ($unusedHotels as $unusedHotel) {
            BookRoomHotel::where('book_hotel_id', $unusedHotel->id)->delete();
            $unusedHotel->delete();
        }

        // Hapus itinerary yang tidak lagi digunakan
        // Pastikan untuk menghapus setelah hotel karena ada foreign key constraint
        $unusedItineraries = BookingItinerary::where('booking_id', $booking->id)
                                            ->whereNotIn('id', $usedItineraryIds)
                                            ->get();
                                            
        foreach ($unusedItineraries as $unusedItinerary) {
            // Periksa terlebih dahulu apakah tidak ada hotel yang terkait
            $relatedHotel = BookHotel::where('booking_itinerary_id', $unusedItinerary->id)->first();
            if (!$relatedHotel) {
                $unusedItinerary->delete();
            }
        }        

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

        if($request->channel != 'TWT' && !$booking->expense_file_internal){
            $cekDestinations = BookDestinationActivity::where('booking_id',$booking->id)->count();
            if($cekDestinations == 0){
                $this->generateExpense($booking->id);
            }
            else{
                $this->updateExpense($booking->id);
            }
        }

        return back()->with('message', 'Booking saved successfully');
    }

    function updateExpense($id){
        $booking = Booking::where('id',$id)->first();
        $pax = $booking->total_pax;

        $totalAccommodations = 0;
        $totalAccommodationsPaid = 0;
        $totalAccommodationsDebt = 0;
        $totalDestinations = 0;
        $totalOthers = 0;
        $totalResources = 0;


        $bookRoom = BookHotel::select('id','booking_id','hotel_id','b','l','d','is_paid','is_debt')->with(['hotel' => function($query){
            $query->select('id','name','lunch_rate','dinner_rate');
        },'bookRoom' => function($query){
            $query->select('id','book_hotel_id','room_hotel_id','quantity','subtotal')->with(['roomHotel' => function($q){
                $q->select('id','room_name','rate');
            }]);
        },'bookHotelMeal'])->where('booking_id',$id)
        ->get()
        ->map(function($booking) use($pax,&$totalAccommodations,&$totalAccommodationsPaid,&$totalAccommodationsDebt) {
            if($booking->l == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->first();
                
                $lunch = $cekBookHotelMeals;
                if(!$cekBookHotelMeals){
                    $lunch = new BookHotelMeal;
                    $lunch->book_hotel_id = $booking->id;
                    $lunch->booking_id = $booking->booking_id;
                    $lunch->hotel_id = $booking->hotel_id;
                }
                $lunch->meals = 'lunch';
                $lunch->qty = $pax;
                $lunch->price = $booking->hotel->lunch_rate;
                $lunch->subtotal = $pax*$booking->hotel->lunch_rate;
                $lunch->save();
                $lunchTotal = $lunch->subtotal;
                if($booking->is_debt == '1'){
                    $totalAccommodationsDebt += $lunchTotal;
                }
                else if($booking->is_paid == '1'){
                    $totalAccommodationsPaid += $lunchTotal;
                }


                $totalAccommodations += $lunchTotal;
            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->delete();
            }
            if($booking->d == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->first();
 
                $dinner = $cekBookHotelMeals;
                if(!$cekBookHotelMeals){
                    $dinner = new BookHotelMeal;
                    $dinner->book_hotel_id = $booking->id;
                    $dinner->booking_id = $booking->booking_id;
                    $dinner->hotel_id = $booking->hotel_id;
                }
                $dinner->meals = 'dinner';
                $dinner->qty = $pax;
                $dinner->price = $booking->hotel->dinner_rate;
                $dinner->subtotal = $pax*$booking->hotel->dinner_rate;
                $dinner->save();
                
                $dinnerTotal = $dinner->subtotal;
                if($booking->is_debt == '1'){
                    $totalAccommodationsDebt += $dinnerTotal;
                }
                else if($booking->is_paid == '1'){
                    $totalAccommodationsPaid += $dinnerTotal;
                }

                $totalAccommodations += $dinnerTotal;

            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->delete();
            }

            $booking->bookRoom->map(function($room) use(&$totalAccommodations,&$booking,&$totalAccommodationsPaid,&$totalAccommodationsDebt) {
                if ($room->subtotal == null) {
                    $room->subtotal = $room->roomHotel->rate * $room->quantity;
                    $room->save();
                }
                $totalAccommodations += $room->subtotal;
                if($booking->is_debt == '1'){
                    $totalAccommodationsDebt += $room->subtotal;
                }
                else if($booking->is_paid == '1'){
                    $totalAccommodationsPaid += $room->subtotal;
                }

                return $room;
            });

            return $booking;
        });

        $bookDestinationActivity = BookDestinationActivity::where('booking_id',$id)->sum('subtotal');
        $bookOthers = BookOthersActivity::where('booking_id',$id)->sum('subtotal');
        $bookCarActivity = BookCarActivity::where('booking_id',$id)->sum('subtotal');
        $bookCrewActivity = BookCrewActivity::where('booking_id',$id)->sum('subtotal');
        
        // BookDestinationActivity::where('booking_id',$id)->where('is_debt','0')->update(['status_paid' => 'paid']);
        // BookOthersActivity::where('booking_id',$id)->where('is_debt','0')->update(['status_paid' => 'paid']);
        // BookCarActivity::where('booking_id',$id)->where('is_debt','0')->update(['status_paid' => 'paid']);
        // BookCrewActivity::where('booking_id',$id)->where('is_debt','0')->update(['status_paid' => 'paid']);
        
        $bookDestinationActivityPaid = BookDestinationActivity::where('booking_id',$id)->where('status_paid','paid')->sum('subtotal');
        $bookOthersPaid = BookOthersActivity::where('booking_id',$id)->where('status_paid','paid')->sum('subtotal');
        $bookCarActivityPaid = BookCarActivity::where('booking_id',$id)->where('status_paid','paid')->sum('subtotal');
        $bookCrewActivityPaid = BookCrewActivity::where('booking_id',$id)->where('status_paid','paid')->sum('subtotal');
        
        $bookDestinationActivityDebt = BookDestinationActivity::where('booking_id',$id)->where('is_debt','1')->sum('subtotal');
        $bookOthersDebt = BookOthersActivity::where('booking_id',$id)->where('is_debt','1')->sum('subtotal');
        $bookCarActivityDebt = BookCarActivity::where('booking_id',$id)->where('is_debt','1')->sum('subtotal');
        $bookCrewActivityDebt = BookCrewActivity::where('booking_id',$id)->where('is_debt','1')->sum('subtotal');

        $totalExpense = $totalAccommodations + $bookDestinationActivity + $bookOthers + $bookCarActivity + $bookCrewActivity;

        $totalExpensePaid = $totalAccommodationsPaid + $bookDestinationActivityPaid + $bookOthersPaid + $bookCarActivityPaid + $bookCrewActivityPaid;
        $totalExpenseDebt = $totalAccommodationsDebt + $bookDestinationActivityDebt + $bookOthersDebt + $bookCarActivityDebt + $bookCrewActivityDebt;

        $booking->expense_internal_total = $totalExpense;
        $booking->total_expense_paid = $totalExpensePaid;
        $booking->total_expense_debt = $totalExpenseDebt;
        $booking->total_expense_crew = $totalExpense - ($totalExpensePaid+$totalExpenseDebt);
        $booking->total_expense_balance = 0;

        $booking->save();
    }
    
    function generateExpense($id){
        $booking = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','agent_id','booking_category_id','package_duration')->with(['user' => function($query){
            $query->select('id','name');
        },'bookingDetail' => function($query){
            $query->select('id','package_id','booking_id')->with(['package' => function($q){
                $q->select('id','name','duration_id')->with('duration');
            }]);
        }])->where('id',$id)->first();
        $pax = $booking->total_pax;
        $day = $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->duration->day : $booking->package_duration;

        $totalAccommodations = 0;
        $totalDestinations = 0;
        $totalOthers = 0;
        $totalResources = 0;

        $bookRoom = BookHotel::select('id','booking_id','hotel_id','b','l','d','is_paid','is_debt')->with(['hotel' => function($query){
            $query->select('id','name','lunch_rate','dinner_rate');
        },'bookRoom' => function($query){
            $query->select('id','book_hotel_id','room_hotel_id','quantity','subtotal')->with(['roomHotel' => function($q){
                $q->select('id','room_name','rate');
            }]);
        },'bookHotelMeal'])->where('booking_id',$id)
        ->get()
        ->map(function($booking) use($pax,&$totalAccommodations) {
            if($booking->l == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->first();
                
                $lunch = $cekBookHotelMeals;
                if(!$cekBookHotelMeals){
                    $lunch = new BookHotelMeal;
                    $lunch->book_hotel_id = $booking->id;
                    $lunch->booking_id = $booking->booking_id;
                    $lunch->hotel_id = $booking->hotel_id;
                }
                $lunch->meals = 'lunch';
                $lunch->qty = $pax;
                $lunch->price = $booking->hotel->lunch_rate;
                $lunch->subtotal = $pax*$booking->hotel->lunch_rate;
                $lunch->save();
                $lunchTotal = $lunch->subtotal;

                $totalAccommodations += $lunchTotal;
            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->delete();
            }
            if($booking->d == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->first();
 
                $dinner = $cekBookHotelMeals;
                if(!$cekBookHotelMeals){
                    $dinner = new BookHotelMeal;
                    $dinner->book_hotel_id = $booking->id;
                    $dinner->booking_id = $booking->booking_id;
                    $dinner->hotel_id = $booking->hotel_id;
                }
                $dinner->meals = 'dinner';
                $dinner->qty = $pax;
                $dinner->price = $booking->hotel->dinner_rate;
                $dinner->subtotal = $pax*$booking->hotel->dinner_rate;
                $dinner->save();
                
                $dinnerTotal = $dinner->subtotal;
                $totalAccommodations += $dinnerTotal;

            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->delete();
            }

            $booking->bookRoom->map(function($room) use(&$totalAccommodations) {
                if ($room->subtotal == null) {
                    $room->subtotal = $room->roomHotel->rate * $room->quantity;
                    $room->save();
                }
                $totalAccommodations += $room->subtotal;
                return $room;
            });
            return $booking;
        });

        if($booking->agent_id == 1){
            $channel = 'twt';
        }
        else if($booking->agent_id == 2){
            if($booking->booking_category_id == 3){
                $channel = 'klook';
            }
            else{
                $channel = 'jvto';
            }
        }

        $cekDestinations = BookDestinationActivity::where('booking_id',$id)->count();
        $cekOthers = BookOthersActivity::where('booking_id',$id)->count();
        $packageId = $booking->bookingDetail[0]->package_id;
        $agentId = $booking->agent_id;
        $bookinCategoryId = $booking->booking_category_id;
        
        if($cekDestinations == 0){
            $getDestinationActivities = Itinerary::with(['itineraryDestination.destination.activity' => function($query) use($agentId,$bookinCategoryId){
                if($agentId == 1){
                    $query->where('is_default_twt','1');
                }
                else if($agentId == 2){
                    if($bookinCategoryId == 3){
                        $query->where('is_default_klook','1');
                    }
                    else{
                        $query->where('is_default_jvto','1');
                    }
                }
            },'itineraryDestination.secondDestination.activity' =>  function($query) use($agentId,$bookinCategoryId){
                if($agentId == 1){
                    $query->where('is_default_twt','1');
                }
                else if($agentId == 2){
                    if($bookinCategoryId == 3){
                        $query->where('is_default_klook','1');
                    }
                    else{
                        $query->where('is_default_jvto','1');
                    }
                }

            }])->where('package_id',$packageId)->get()->map(function($itinerary) use($pax,$day,$id,&$totalDestinations){
                if(!empty($itinerary->itineraryDestination->destination->activity)){
                    $itinerary->itineraryDestination->destination->activity->map(function($activity) use($itinerary,$pax,$day,$id,&$totalDestinations){
                        $formula = str_replace(
                            ['pax', 'day', 'Math.ceil'],
                            ['$pax', '$day', 'ceil'],
                            $activity->formula
                        );                        
                        $resultFormula = eval('return ' . $formula . ';');
                        $bookDestinationActivity = new BookDestinationActivity;
                        $bookDestinationActivity->booking_id = $id;
                        $bookDestinationActivity->destination_id = $activity->destination_id;
                        $bookDestinationActivity->destination_activity_id = $activity->id;
                        $bookDestinationActivity->qty = $resultFormula;
                        $bookDestinationActivity->price = $activity->price;
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty*$activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";

                        $totalDestinations += $bookDestinationActivity->subtotal;
                        $bookDestinationActivity->save();

                    });
                }
                if(!empty($itinerary->itineraryDestination->secondDestination->activity)){
                    $itinerary->itineraryDestination->secondDestination->activity->map(function($activity) use($itinerary,$pax,$day,$id,&$totalDestinations){
                        $formula = str_replace(
                            ['pax', 'day', 'Math.ceil'],
                            ['$pax', '$day', 'ceil'],
                            $activity->formula
                        );                        
                        $resultFormula = eval('return ' . $formula . ';');
                        $bookDestinationActivity = new BookDestinationActivity;
                        $bookDestinationActivity->booking_id = $id;
                        $bookDestinationActivity->destination_id = $activity->destination_id;
                        $bookDestinationActivity->destination_activity_id = $activity->id;
                        $bookDestinationActivity->qty = $resultFormula;
                        $bookDestinationActivity->price = $activity->price;
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty*$activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";
                        $bookDestinationActivity->save();

                        $totalDestinations += $bookDestinationActivity->subtotal;

                    });

                }
            });
        }

        if($cekOthers == 0){
            $getOthers = OthersActivity::where('is_default','1')->get()->map(function($others) use($id,$pax,$day,&$totalOthers){
                $insertOthers = new BookOthersActivity;
                $insertOthers->booking_id = $id;
                $insertOthers->others_activity_id = $others->id;
                
                $formula = str_replace(
                    ['pax', 'day', 'Math.ceil'],
                    ['$pax', '$day', 'ceil'],
                    $others->formula
                );                        
                $resultFormula = eval('return ' . $formula . ';');
                
                $insertOthers->qty = $resultFormula;
                $insertOthers->price = $others->price;
                $insertOthers->subtotal = $insertOthers->qty*$others->price;
                $insertOthers->status_paid = 'unpaid';
                $insertOthers->save();

                $totalOthers += $insertOthers->subtotal;
            });
        }

        $others = BookOthersActivity::with('othersActivity')->where('booking_id',$id)->get();

        $cekCar = CarConfiguration::with(['crewJvtoRole','crewTwtRole','crewKlookRole'])->where('pax',$pax);
        $isCarExist = false;
        if($booking->agent_id == 1){
            $cekCar = $cekCar->whereNotNull('crew_twt_role_id');
            $isCarExist = true;
        }
        else if($booking->agent_id == 2){
            $isCarExist = true;
            if($booking->booking_category_id == 3){
                $cekCar = $cekCar->whereNotNull('crew_klook_role_id');
            }
            else{
                $cekCar = $cekCar->whereNotNull('crew_jvto_role_id');
            }
        }

        if($isCarExist){
            $cekCar = $cekCar->first();
            if(!$cekCar){
                $isCarExist = false;
            }
        }
        if($isCarExist){

            $cekCarActivities = BookCarActivity::where('booking_id',$id)->count();
            if($cekCarActivities == 0 && $cekCar){
                $insertCar = new BookCarActivity;
                $insertCar->booking_id = $id;
                $insertCar->car_id = $cekCar->car_id;
                $insertCar->qty = $day;
                $insertCar->price = $cekCar->price;
                $insertCar->subtotal = $insertCar->qty*$insertCar->price;
                $insertCar->status_paid = 'unpaid';
                $insertCar->save();

                $totalResources += $insertCar->subtotal;
            }

            $cekCrewActivities = BookCrewActivity::where('booking_id',$id)->count();
            if($cekCrewActivities == 0 && $cekCar){
                $insertCrew = new BookCrewActivity;
                $insertCrew->booking_id = $id;
                
                if($booking->agent_id == 1){
                    $crew_role_id = $cekCar->crew_twt_role_id;
                    $crew_price = $cekCar->crewTwtRole->rate;
                }
                else if($booking->agent_id == 2){
                    if($booking->booking_category_id == 3){
                        $crew_role_id = $cekCar->crew_klook_role_id;
                        $crew_price = $cekCar->crewKlookRole->rate;
                    }
                    else{
                        $crew_role_id = $cekCar->crew_jvto_role_id;
                        $crew_price = $cekCar->crewJvtoRole->rate;
                    }
                }
                $insertCrew->crew_role_id = $crew_role_id;
                $insertCrew->qty = $day;
                $insertCrew->price = $crew_price;

                $insertCrew->subtotal = $insertCrew->qty*$insertCrew->price;
                $insertCrew->status_paid = 'unpaid';
                $insertCrew->save();

                $totalResources += $insertCrew->subtotal;

            }
        }

        $totalExpense = $totalAccommodations + $totalDestinations + $totalOthers + $totalResources;

        $booking->expense_internal_total = $totalExpense;
        $booking->total_expense_crew = $totalExpense;
        $booking->total_expense_balance = 0;
        $booking->total_expense_debt = 0;

        $booking->save();

        return [
            'accomodations' => $totalAccommodations,
            'destinations' => $totalDestinations,
            'others' => $totalOthers,
            'resources' => $totalResources,
        ];
    }
    function twtExtractor(Request $request){
        try {
            // Pastikan direktori logs ada
            if (!Storage::disk('local')->exists('logs')) {
                Storage::disk('local')->makeDirectory('logs');
            }
            
            // Pastikan direktori untuk file ada
            if (!file_exists(public_path('assets/customer-document'))) {
                mkdir(public_path('assets/customer-document'), 0755, true);
            }
            
            // Log awal request
            $logData = "============ " . date('Y-m-d H:i:s') . " ============\n";
            $logData .= "CONTENT TYPE: " . $request->header('Content-Type') . "\n\n";
            
            // Ambil data JSON dari request
            $jsonData = $request->json()->all();
            $logData .= "REQUEST DATA RECEIVED\n";
            
            // Periksa apakah ada data email
            if (isset($jsonData['emailData'])) {
                $logData .= "EMAIL DATA FOUND\n";
                $emailData = $jsonData['emailData'];
                // Proses data email sesuai kebutuhan
                // ...
            } else {
                $logData .= "NO EMAIL DATA FOUND\n";
            }
            
            // Periksa apakah ada data file
            if (isset($jsonData['fileData'])) {
                $fileData = $jsonData['fileData'];
                $logData .= "FILE DATA FOUND\n";
                $logData .= "FILE NAME: " . $fileData['fileName'] . "\n";
                $logData .= "FILE TYPE: " . $fileData['fileType'] . "\n";
                $logData .= "FILE SIZE: " . $fileData['fileSize'] . " bytes\n";
                
                // Decode base64 file content
                $fileContent = base64_decode($fileData['fileContent']);
                
                // Tentukan nama file
                $fileName = time() . '.' . pathinfo($fileData['fileName'], PATHINFO_EXTENSION);
                $filePath = public_path('assets/customer-document/' . $fileName);
                
                // Simpan file ke disk
                file_put_contents($filePath, $fileContent);
                $logData .= "FILE SAVED AS: " . $fileName . "\n";
    
                // Mulai pemrosesan file PDF seperti pada fungsi twtExtractorFileProcess
                // Validasi tipe file di sini kalau perlu (misalnya harus PDF)
                if (pathinfo($fileData['fileName'], PATHINFO_EXTENSION) !== 'pdf') {
                    throw new \Exception('File harus berupa PDF');
                }
                
                // Path lengkap ke file
                $fullPath = $filePath;
                
                try {
                    $getHotel = Hotel::select('id','name','destination_id')->with(['roomHotel' => function($query){
                        $query->select('id','hotel_id','room_name');
                    }])->whereIn('id',[59,11,60,12,63,34,56,10])->get();
                    $hotels = json_encode($getHotel);
                    $activityStart = ActivityStart::select('id','name','description')->get();
                    $activityEnd = ActivityEnd::select('id','name','description')->get();
                    $activityStart = json_encode($activityStart);
                    $activityEnd = json_encode($activityEnd);
                    
                    // Ekstrak teks dari PDF menggunakan PDFParser
                    $parser = new \Smalot\PdfParser\Parser();
                    $pdf = $parser->parseFile($fullPath);
                    $pages = $pdf->getPages();
                    $text = $pdf->getText();
    
                    $prompt = "
                    get Trip Duration (always get from count number of itineraries dont get directly from package), Invoice Number,Invoice Date (Y-m-d format), Customer Name, Traveling Date Start (Y-m-d format), Traveling Date End  (Y-m-d format), No of Pax (number only), Tshirt Size (XSS,XXS,XS,S,M,L,XL,XXL,XXL) (default value 0), pick up location at first day, pick up time at first day (you also can see in flight details in first day, If there are 2 times (start and end), then use end because that is the arrival time. (H:i format), flight details at first day (flight number only), drop location at last day (check in itinerary in last day. Example : Airport), drop time at last day (maybe the name is pick up at last day, but because it's a last day, so pick up is drop), drop time at last day (maybe the name is pick up at last day, but because it's a last day, so pick up is drop), flight details at last day, itineraries (should be array with format like this : 
                        [
                            {
                                'date': '2025-10-01',
                                'day': 1,
                                'itinerary': 'Itinerary day 1',
                                'activity_start_id' : 'activity_start_id',
                                'activity_end_id' : 'activity_end_id',
                                'activity' : 'activity start name - activity end name',
                                'hotel_id': 'hotel_id',
                                'hotel': 'hotel name',
                                'rooms': [
                                    {
                                        'id': 1,
                                        'room': 'Room Name',
                                        'quantity': 2
                                    }
                                ],
                                'meals': {
                                    'breakfast': true,
                                    'lunch': true,
                                    'dinner': false
                                }
                            },
                            {
                                'date': '2025-10-02',
                                'day': 2,
                                'itinerary': 'Itinerary day 2',
                                'activity_start_id' : 'activity_start_id',
                                'activity_end_id' : 'activity_end_id',
                                'activity' : 'activity start name - activity end name',
                                'hotel_id': 'hotel_id',
                                'hotel': 'hotel name',
                                'rooms': [
                                    {
                                        'id': 10,
                                        'room': 'Room Name',
                                        'quantity': 2
                                    }
                                ],
                                'meals': {
                                    'breakfast': true,
                                    'lunch': false,
                                    'dinner': true
                                }
                            },
                            .... etc
                        ]), make sure the itinerary are not mixed up, according to the day and date Also make sure the itinerary text is neat in terms of writing and spacing. for the activity_start_id, activity_end_id, and activity you can check on this data: \nActivity Start: ".$activityStart."\nActivity End: ".$activityEnd."\n\n\n\n. and get also grand total in the bottom, at ijen (date)(After you get the itinerary date and hotel, do a search for a hotel that has a master destination_id == 2, if you can get it, take the itinerary date + 1 day. Example Date 2025-05-02 Hotel Riverside Homestay, so at ijen is 2025-05-02 + 1 day = 2025-05-03, that is at Ijen),at bromo (date)(After you get the itinerary date and hotel, do a search for a hotel that has a master destination_id == 1, if you can get it, take the itinerary date + 1 day. Example Date 2025-05-03 Hotel Joglo Kecombrang, so at bromo is 2025-05-03 + 1 day = 2025-05-04, that is at bromo). for the hotel and room id you can check in this master data : \n".$hotels.".\n\n\n\n                     
                    Provide me as a json format only, not text intro before. Set the key like this (day,invoice_number,invoice_date,customer_name,travel_date_start,travel_date_end,no_of_pax,xss,xxs,xs,s,m,l,xl,xxl,xxxl,pickup_location,pickup_time,pickup_flight_number,drop_location,drop_time,drop_flight_number,itineraries,grand_total, at_ijen, at_bromo. if you didn't get the value, just leave it blank. Here is the data :\n" . $text;
    
                    $response = Http::timeout(120)->withHeaders([
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                    ])->post('https://api.deepseek.com/chat/completions', [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a helpful assistant.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'stream' => false,
                    ]);
                    $content = $response['choices'][0]['message']['content'];
    
                    // Bersihkan backticks dan prefix "json"
                    $cleaned = trim($content, " \n`");
                    $cleaned = preg_replace('/^json\s*/', '', $cleaned);
            
                    // Decode ke array PHP
                    $data = json_decode($cleaned, true);
    
                    $agent_id = 1;
                    $booking_category_id = NULL;
                    $attachment_id = 6;
    
                    $user = new User;
                    $user->name = $data['customer_name'];
                    $user->avatar = "default.jpg";
                    $user->password  = Hash::make('password');
                    $user->save();
    
                    $ym = date('Y-m', strtotime($data['travel_date_start']));
        
                    $getBooking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
                    $getBooking = $getBooking->orderBy('booking_numb', 'desc');
                    $count = $getBooking->count();
                    if ($count == 0) {
                        $code = '001';
                    } else {
                        $getBooking = $getBooking->first();
                        $code = (int) $getBooking->booking_numb + 1;
                        $code = sprintf("%03s", $code);
                    }
            
                    $invoiceCode = [
                        'year' => date("y", strtotime($data['travel_date_start'])),
                        'month' => date("m", strtotime($data['travel_date_start'])),
                        'code' => $code
                    ];
            
                    $invoice_number = "JVR/$invoiceCode[code]/$invoiceCode[month]/$invoiceCode[year]";
            
                    $days = count($data['itineraries']);
                    $nights = count($data['itineraries']) - 1; // Corrected the syntax error
    
                    $booking = new Booking;
                    $booking->booking_code = $invoice_number;
                    $booking->custom_code = $invoice_number;
                    $booking->agent_id = $agent_id;
                    $booking->booking_category_id = $booking_category_id;
                    $booking->booking_date = $data['invoice_date'];
                    $booking->invoice_code_origin = $data['invoice_number'];
                    $booking->booking_numb = $code;
                    $booking->user_id = $user->id;
                    $booking->travel_date_start = $data['travel_date_start'];
                    $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$nights days"));
                    $booking->package_duration = $days;
                    $booking->total_pax = $data['no_of_pax'];
                    $booking->meeting_point = 'Others';
                    $booking->pickup = $data['pickup_location'];
                    $booking->meeting_point_value = $data['pickup_location'];
            
                    $booking->drop_point = 'Others';
                    $booking->drop = $data['drop_location'];
                    $booking->drop_point_value = $data['drop_location'];
            
                    $booking->dp_no_idr = 0;
                    $booking->payment = 0;
    
                    $booking->grand_total_before_disc = $data['grand_total'];
                    $booking->add_on_total = 0;
            
                    $booking->grand_total = $data['grand_total'];
                    $booking->dp = 0;
                    
                    $booking->at_bondowoso = $data['at_ijen'];
                    $booking->at_bromo = $data['at_bromo'];
    
                    $booking->balance = $booking->grand_total;
                    $booking->status = 'booked';
                    $booking->type = 'offline';
                    $booking->payment_method = 'pay later';
                    $slug = str_replace(' ', '-', $user->name);
                    $slug = strtolower($slug);
                    $booking->url_name = $slug.$user->id;
                    $booking->url = md5($booking->url_name);
                    $booking->wa_schedule_reminder_crew = date('Y-m-d 10:00:00', strtotime($booking->travel_date_start . " -1 days"));

                    $booking->save();

                    $bookingDocument = new BookingDocument();
                    $bookingDocument->booking_id = $booking->id;
                    $bookingDocument->user_id = $booking->user_id;
                    $bookingDocument->attachment_type_id = $attachment_id; //Klook Booking Ticket
                    $bookingDocument->file = $fileName;
                    $bookingDocument->save();
        
    
                    $bookingDetail = new BookingDetail;
                    $bookingDetail->booking_id = $booking->id;
                    $bookingDetail->travel_date_start = $booking->travel_date_start;
                    $bookingDetail->travel_date_end = $booking->travel_date_end;
                    $bookingDetail->pax = $booking->total_pax;
                    $bookingDetail->xss = $data['xss'];
                    $bookingDetail->xxs = $data['xxs'];
                    $bookingDetail->xs = $data['xs'];
                    $bookingDetail->s = $data['s'];
                    $bookingDetail->m = $data['m'];
                    $bookingDetail->l = $data['l'];
                    $bookingDetail->xl = $data['xl'];
                    $bookingDetail->xxl = $data['xxl'];
                    $bookingDetail->xxxl = $data['xxxl'];
                    $bookingDetail->total = $data['xss'] + $data['xxs'] + $data['xs'] + $data['s'] + $data['m'] + $data['l'] + $data['xl'] + $data['xxl'] + $data['xxxl'];
                    $bookingDetail->save();
                    
                    for($i=0;$i<$days;$i++){
                        $day = $i+1;
                        $itinerary = new BookingItinerary;
                        $itinerary->booking_id = $booking->id;
                        $itinerary->day = $day;
                        $itinerary->itinerary = $data['itineraries'][$i]['activity'];
                        $itinerary->activity = $data['itineraries'][$i]['itinerary'];
                        if($data['itineraries'][$i]['activity_start_id']){
                            $itinerary->activity_start_id = $data['itineraries'][$i]['activity_start_id'];
                        }
                        if($data['itineraries'][$i]['activity_end_id']){
                            $itinerary->activity_end_id = $data['itineraries'][$i]['activity_end_id'];
                        }
                        $itinerary->b = $data['itineraries'][$i]['meals']['breakfast'] ? '1' : '0';
                        $itinerary->l = $data['itineraries'][$i]['meals']['lunch'] ? '1' : '0';
                        $itinerary->d = $data['itineraries'][$i]['meals']['dinner'] ? '1' : '0';
                        $itinerary->save();
    
                        if($data['itineraries'][$i]['hotel_id'] != ''){
                            $bookHotel = new BookHotel;
                            $bookHotel->booking_id = $booking->id;
                            $bookHotel->booking_itinerary_id = $itinerary->id;
                            $bookHotel->hotel_id = $data['itineraries'][$i]['hotel_id'];
                            $bookHotel->b = $data['itineraries'][$i]['meals']['breakfast'] ? '1' : '0';
                            $bookHotel->l = $data['itineraries'][$i]['meals']['lunch'] ? '1' : '0';
                            $bookHotel->d = $data['itineraries'][$i]['meals']['dinner'] ? '1' : '0';
                            $bookHotel->status = NULL;
                            $bookHotel->save();
    
                            if($data['itineraries'][$i]['rooms'] != null){
                                foreach($data['itineraries'][$i]['rooms'] as $room){
                                    $getRoomDetails = RoomHotel::find($room['id']);
    
                                    if($getRoomDetails){
                                        $bookRoomHotel = new BookRoomHotel;
                                        $bookRoomHotel->booking_id = $booking->id;
                                        $bookRoomHotel->booking_itinerary_id = $itinerary->id;
                                        $bookRoomHotel->book_hotel_id = $bookHotel->id;
                                        $bookRoomHotel->room_hotel_id = $room['id'];
                                        $bookRoomHotel->quantity = $room['quantity'];
                                        $bookRoomHotel->subtotal = $bookRoomHotel->quantity * $getRoomDetails->rate;
                                        $bookRoomHotel->save();
                                    }
                                }
                            }
                        }
                    }
    
                    // Tambahkan informasi hasil pemrosesan ke response
                    $response = [
                        'success' => true,
                        'message' => 'PDF berhasil diproses',
                        'fileName' => $fileName,
                        'booking_code' => $booking->booking_code,
                        'user_name' => $user->name,
                        'travel_date' => $booking->travel_date_start . ' s/d ' . $booking->travel_date_end,
                        'total_pax' => $booking->total_pax,
                        'grand_total' => $booking->grand_total
                    ];
                    
                    $logData .= "PDF PROCESSED SUCCESSFULLY\n";
                    $logData .= "BOOKING CODE: " . $booking->booking_code . "\n";
                    $logData .= "CUSTOMER: " . $user->name . "\n";
                    
                } catch (\Exception $e) {
                    $logData .= "PDF PROCESSING ERROR: " . $e->getMessage() . "\n";
                    $response = [
                        'success' => false,
                        'message' => 'Gagal memproses PDF: ' . $e->getMessage(),
                        'fileName' => $fileName
                    ];
                }
                
            } else {
                $logData .= "NO FILE DATA FOUND\n";
                $response = [
                    'success' => true,
                    'message' => 'Hanya data email yang diterima'
                ];
            }
            
            // Simpan log
            $logFileName = 'twt_' . date('Y-m-d_H-i-s') . '.log';
            Storage::disk('local')->put('logs/' . $logFileName, $logData);
            
            // Tambahkan info log ke response
            $response['log_file'] = $logFileName;
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            // Log error
            $errorLog = "ERROR: " . $e->getMessage() . "\n";
            $errorLog .= "FILE: " . $e->getFile() . "\n";
            $errorLog .= "LINE: " . $e->getLine() . "\n";
            $errorLog .= "TRACE: " . $e->getTraceAsString() . "\n";
            
            // Log request data yang menyebabkan error
            $errorLog .= "\nREQUEST DATA:\n";
            $errorLog .= json_encode($request->all(), JSON_PRETTY_PRINT);
            
            Storage::disk('local')->put(
                'logs/twt_error_' . date('Y-m-d_H-i-s') . '.log', 
                $errorLog
            );
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
    function twtExtractorFileIndex(){
        return view('pdf-extractor.index');
    }        
    function twtExtractorFileProcess(Request $request){

        $request->validate([
            'pdf_file' => 'required|mimes:pdf|max:10240', // Max 10MB
        ]);
        
        if ($request->hasFile('pdf_file')) {
            $file = $request->file('pdf_file');
            
            // Simpan file ke storage
            $fileName = time() . '.' . $file->extension();
            $filePath = $file->storeAs('pdfs', $fileName, 'public');
            
            // Path lengkap ke file
            $fullPath = Storage::disk('public')->path($filePath);
            
            try {
                $getHotel = Hotel::select('id','name','destination_id')->with(['roomHotel' => function($query){
                    $query->select('id','hotel_id','room_name');
                }])->whereIn('id',[59,11,60,12,63,34,56,10])->get();
                $hotels = json_encode($getHotel);
                $activityStart = ActivityStart::select('id','name','description')->get();
                $activityEnd = ActivityEnd::select('id','name','description')->get();
                $activityStart = json_encode($activityStart);
                $activityEnd = json_encode($activityEnd);
                // Ekstrak teks dari PDF menggunakan PDFParser
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($fullPath);
                $pages = $pdf->getPages();
                $text = $pdf->getText();

                    $prompt = "
                    get Trip Duration (always get from count number of itineraries dont get directly from package), Invoice Number,Invoice Date (Y-m-d format), Customer Name, Traveling Date Start (Y-m-d format), Traveling Date End  (Y-m-d format), No of Pax (number only), Tshirt Size (XSS,XXS,XS,S,M,L,XL,XXL,XXL) (default value 0), pick up location at first day, pick up time at first day (you also can see in flight details in first day, If there are 2 times (start and end), then use end because that is the arrival time. (H:i format), flight details at first day (flight number only), drop location at last day (check in itinerary in last day. Example : Airport), drop time at last day (maybe the name is pick up at last day, but because it's a last day, so pick up is drop), drop time at last day (maybe the name is pick up at last day, but because it's a last day, so pick up is drop), flight details at last day, itineraries (should be array with format like this : 
                        [
                            {
                                'date': '2025-10-01',
                                'day': 1,
                                'itinerary': 'Itinerary day 1',
                                'activity_start_id' : 'activity_start_id',
                                'activity_end_id' : 'activity_end_id',
                                'activity' : 'activity start name - activity end name',
                                'hotel_id': 'hotel_id',
                                'hotel': 'hotel name',
                                'rooms': [
                                    {
                                        'id': 1,
                                        'room': 'Room Name',
                                        'quantity': 2
                                    }
                                ],
                                'meals': {
                                    'breakfast': true,
                                    'lunch': true,
                                    'dinner': false
                                }
                            },
                            {
                                'date': '2025-10-02',
                                'day': 2,
                                'itinerary': 'Itinerary day 2',
                                'activity_start_id' : 'activity_start_id',
                                'activity_end_id' : 'activity_end_id',
                                'activity' : 'activity start name - activity end name',
                                'hotel_id': 'hotel_id',
                                'hotel': 'hotel name',
                                'rooms': [
                                    {
                                        'id': 10,
                                        'room': 'Room Name',
                                        'quantity': 2
                                    }
                                ],
                                'meals': {
                                    'breakfast': true,
                                    'lunch': false,
                                    'dinner': true
                                }
                            },
                            .... etc
                        ]), make sure the itinerary are not mixed up, according to the day and date Also make sure the itinerary text is neat in terms of writing and spacing. for the activity_start_id, activity_end_id, and activity you can check on this data: \nActivity Start: ".$activityStart."\nActivity End: ".$activityEnd."\n\n\n\n. and get also grand total in the bottom, at ijen (date)(After you get the itinerary date and hotel, do a search for a hotel that has a master destination_id == 2, if you can get it, take the itinerary date + 1 day. Example Date 2025-05-02 Hotel Riverside Homestay, so at ijen is 2025-05-02 + 1 day = 2025-05-03, that is at Ijen),at bromo (date)(After you get the itinerary date and hotel, do a search for a hotel that has a master destination_id == 1, if you can get it, take the itinerary date + 1 day. Example Date 2025-05-03 Hotel Joglo Kecombrang, so at bromo is 2025-05-03 + 1 day = 2025-05-04, that is at bromo). for the hotel and room id you can check in this master data : \n".$hotels.".\n\n\n\n                     
                    Provide me as a json format only, not text intro before. Set the key like this (day,invoice_number,invoice_date,customer_name,travel_date_start,travel_date_end,no_of_pax,xss,xxs,xs,s,m,l,xl,xxl,xxxl,pickup_location,pickup_time,pickup_flight_number,drop_location,drop_time,drop_flight_number,itineraries,grand_total, at_ijen, at_bromo. if you didn't get the value, just leave it blank. Here is the data :\n" . $text;
    
                    $response = Http::timeout(120)->withHeaders([
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                    ])->post('https://api.deepseek.com/chat/completions', [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a helpful assistant.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'stream' => false,
                    ]);
                    $content = $response['choices'][0]['message']['content'];
    
                    // Bersihkan backticks dan prefix "json"
                    $cleaned = trim($content, " \n`");
                    $cleaned = preg_replace('/^json\s*/', '', $cleaned);
            
                    // Decode ke array PHP
                    $data = json_decode($cleaned, true);

                    $agent_id = 1;
                    $booking_category_id = NULL;
                    $attachment_id = 6;

                    $user = new User;
                    $user->name = $data['customer_name'];
                    $user->avatar = "default.jpg";
                    $user->password  = Hash::make('password');
                    $user->save();

                    $ym = date('Y-m', strtotime($data['travel_date_start']));
        
                    $getBooking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
                    $getBooking = $getBooking->orderBy('booking_numb', 'desc');
                    $count = $getBooking->count();
                    if ($count == 0) {
                        $code = '001';
                    } else {
                        $getBooking = $getBooking->first();
                        $code = (int) $getBooking->booking_numb + 1;
                        $code = sprintf("%03s", $code);
                    }
            
                    $invoiceCode = [
                        'year' => date("y", strtotime($data['travel_date_start'])),
                        'month' => date("m", strtotime($data['travel_date_start'])),
                        'code' => $code
                    ];
            
                    $invoice_number = "JVR/$invoiceCode[code]/$invoiceCode[month]/$invoiceCode[year]";
            
                    $days = count($data['itineraries']);
                    $nights = count($data['itineraries'])-1;

                    $booking = new Booking;
                    $booking->booking_code = $invoice_number;
                    $booking->custom_code = $invoice_number;
                    $booking->agent_id = $agent_id;
                    $booking->booking_category_id = $booking_category_id;
                    $booking->booking_date = $data['invoice_date'];
                    $booking->invoice_code_origin = $data['invoice_number'];
                    $booking->booking_numb = $code;
                    $booking->user_id = $user->id;
                    $booking->travel_date_start = $data['travel_date_start'];
                    $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$nights days"));
                    $booking->package_duration = $days;
                    $booking->total_pax = $data['no_of_pax'];
                    $booking->meeting_point = 'Others';
                    $booking->pickup = $data['pickup_location'];
                    $booking->meeting_point_value = $data['pickup_location'];
            
                    $booking->drop_point = 'Others';
                    $booking->drop = $data['drop_location'];
                    $booking->drop_point_value = $data['drop_location'];
            
                    $booking->dp_no_idr = 0;
                    $booking->payment = 0;

                    $booking->grand_total_before_disc = $data['grand_total'];
                    $booking->add_on_total = 0;
            
                    $booking->grand_total = $data['grand_total'];
                    $booking->dp = 0;
                    
                    $booking->at_bondowoso = $data['at_ijen'];
                    $booking->at_bromo = $data['at_bromo'];

                    $booking->balance = $booking->grand_total;
                    $booking->status = 'booked';
                    $booking->type = 'offline';
                    $booking->payment_method = 'pay later';
                    $slug = str_replace(' ', '-', $user->name);
                    $slug = strtolower($slug);
                    $booking->url_name = $slug.$user->id;
                    $booking->url = md5($booking->url_name);
                    $booking->save();

                    $bookingDocument = new BookingDocument();
                    $bookingDocument->booking_id = $booking->id;
                    $bookingDocument->user_id = $booking->user_id;
                    $bookingDocument->attachment_type_id = $attachment_id; //Klook Booking Ticket
                    $bookingDocument->file = $fileName;
                    $bookingDocument->save();


                    $bookingDetail = new BookingDetail;
                    $bookingDetail->booking_id = $booking->id;
                    $bookingDetail->travel_date_start = $booking->travel_date_start;
                    $bookingDetail->travel_date_end = $booking->travel_date_end;
                    $bookingDetail->pax = $booking->total_pax;
                    $bookingDetail->xss = $data['xss'];
                    $bookingDetail->xxs = $data['xxs'];
                    $bookingDetail->xs = $data['xs'];
                    $bookingDetail->s = $data['s'];
                    $bookingDetail->m = $data['m'];
                    $bookingDetail->l = $data['l'];
                    $bookingDetail->xl = $data['xl'];
                    $bookingDetail->xxl = $data['xxl'];
                    $bookingDetail->xxxl = $data['xxxl'];
                    $bookingDetail->total = $data['xss'] + $data['xxs'] + $data['xs'] + $data['s'] + $data['m'] + $data['l'] + $data['xl'] + $data['xxl'] + $data['xxxl'];
                    $bookingDetail->save();
                    
                    for($i=0;$i<$days;$i++){
                        $day = $i+1;
                        $itinerary = new BookingItinerary;
                        $itinerary->booking_id = $booking->id;
                        $itinerary->day = $day;
                        $itinerary->itinerary = $data['itineraries'][$i]['activity'];
                        $itinerary->activity = $data['itineraries'][$i]['itinerary'];
                        if($data['itineraries'][$i]['activity_start_id']){
                            $itinerary->activity_start_id = $data['itineraries'][$i]['activity_start_id'];
                        }
                        if($data['itineraries'][$i]['activity_end_id']){
                            $itinerary->activity_end_id = $data['itineraries'][$i]['activity_end_id'];
                        }
                        $itinerary->b = $data['itineraries'][$i]['meals']['breakfast'] ? '1' : '0';
                        $itinerary->l = $data['itineraries'][$i]['meals']['lunch'] ? '1' : '0';
                        $itinerary->d = $data['itineraries'][$i]['meals']['dinner'] ? '1' : '0';
                        $itinerary->save();

                        if($data['itineraries'][$i]['hotel_id'] != ''){
                            $bookHotel = new BookHotel;
                            $bookHotel->booking_id = $booking->id;
                            $bookHotel->booking_itinerary_id = $itinerary->id;
                            $bookHotel->hotel_id = $data['itineraries'][$i]['hotel_id'];
                            $bookHotel->b = $data['itineraries'][$i]['meals']['breakfast'] ? '1' : '0';
                            $bookHotel->l = $data['itineraries'][$i]['meals']['lunch'] ? '1' : '0';
                            $bookHotel->d = $data['itineraries'][$i]['meals']['dinner'] ? '1' : '0';
                            $bookHotel->status = NULL;
                            $bookHotel->save();

                            if($data['itineraries'][$i]['rooms'] != null){
                                foreach($data['itineraries'][$i]['rooms'] as $room){
                                    $getRoomDetails = RoomHotel::find($room['id']);

                                    if($getRoomDetails){
                                        $bookRoomHotel = new BookRoomHotel;
                                        $bookRoomHotel->booking_id = $booking->id;
                                        $bookRoomHotel->booking_itinerary_id = $itinerary->id;
                                        $bookRoomHotel->book_hotel_id = $bookHotel->id;
                                        $bookRoomHotel->room_hotel_id = $room['id'];
                                        $bookRoomHotel->quantity = $room['quantity'];
                                        $bookRoomHotel->subtotal = $bookRoomHotel->quantity * $getRoomDetails->rate;
                                        $bookRoomHotel->save();
                                    }
                                }
                            }
                        }
            
                    }

                return [
                    'user' => $user,
                    'booking' => $booking,
                    'bookingDetail' => $bookingDetail,
                    'itinerary' => $itinerary,
                    'bookHotel' => $bookHotel,
                    'bookRoomHotel' => $bookRoomHotel,                    
                ];

                        
                return view('pdf-extractor.result', [
                    'fileName' => $file->getClientOriginalName(),
                    'extractedText' => $text,
                    'filePath' => $filePath
                ]);
                
            } catch (\Exception $e) {
                return back()->with('error', 'Gagal mengekstrak teks: ' . $e->getMessage());
            }
        }
        
        return back()->with('error', 'Tidak ada file yang diupload');

    }        
    function storePayment(Request $request, $id){
        $booking = Booking::findOrFail($id);

        $description = $request->note;

        $new_payment = new BookingPayment();
        $new_payment->booking_id = $id;
        $new_payment->nominal = $request->nominal;
        $new_payment->payment_method_id = $request->payment_method;
        $new_payment->description = $description;
        $new_payment->reference = $request->reference;
        if($request->invoice_item && $request->invoice_item == 'add_on'){
            $new_payment->is_add_on = '1';
        }
        $new_payment->save();

        $balance = $booking->balance - $new_payment->nominal;
        $booking->balance = $balance;
        $booking->payment = $booking->payment + $new_payment->nominal;
        $booking->save();

        if($request->send_receipt){
            // Send receipt notification
            try {
                $receiptId = $new_payment->id; // Use the new payment ID
                $url = env('API_URL') . "/api/new-backoffice/send-receipt/{$id}/{$receiptId}";
                $response = Http::post($url);
            } catch (\Exception $e) {
                \Log::error('Failed to send receipt', [
                    'payment_id' => 207,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    function updateTripMedia(Request $request, $id){
        $booking = Booking::findOrFail($id);
        $request->validate([
            'media_link' => ['required', 'url'],
        ]);

        $booking->media_link = $request->media_link;
        $booking->save();

        return back();
    }

    function generateTripMedia($id): RedirectResponse
    {
        $booking = Booking::with('user')->findOrFail($id);

        if ($booking->media_link) {
            return back()->withErrors([
                'trip_media' => 'Trip Media sudah dibuat untuk booking ini.',
            ]);
        }

        if (! class_exists(GoogleClient::class) || ! class_exists(Drive::class)) {
            return back()->withErrors([
                'trip_media' => 'Package Google API client belum terinstall di local. Jalankan composer require google/apiclient:^2.18 terlebih dahulu.',
            ]);
        }

        $credentialsPath = base_path('adept-stage-472705-a2-6d8a52e8f781.json');

        if (! file_exists($credentialsPath)) {
            return back()->withErrors([
                'trip_media' => 'File kredensial Google Drive tidak ditemukan.',
            ]);
        }

        try {
            $client = new GoogleClient();
            $client->setAuthConfig($credentialsPath);
            $client->setScopes([Drive::DRIVE]);

            $drive = new Drive($client);
            $folderName = $this->buildTripMediaFolderName($booking);

            $folder = new DriveFile([
                'name' => $folderName,
                'mimeType' => 'application/vnd.google-apps.folder',
                'parents' => ['1Gqf5Pjm0ElWKmXdaXHPupVti6m7cTiXZ'],
            ]);

            $createdFolder = $drive->files->create($folder, [
                'fields' => 'id, webViewLink',
            ]);

            $drive->permissions->create($createdFolder->id, new Permission([
                'type' => 'anyone',
                'role' => 'writer',
            ]), [
                'fields' => 'id',
            ]);

            $folderUrl = $createdFolder->webViewLink ?: 'https://drive.google.com/drive/folders/' . $createdFolder->id;

            $booking->media_link = $folderUrl;
            $booking->save();

            return back()->with('success', 'Trip Media berhasil dibuat.');
        } catch (\Throwable $th) {
            report($th);

            return back()->withErrors([
                'trip_media' => 'Gagal membuat folder Trip Media. Silakan cek konfigurasi Google Drive.',
            ]);
        }
    }

    private function buildTripMediaFolderName(Booking $booking): string
    {
        $customerName = trim((string) optional($booking->user)->name);
        $customerName = preg_replace('/[\\\\\\/]+/', '-', $customerName);
        $customerName = preg_replace('/\s+/', ' ', $customerName);

        return $booking->travel_date_start . '_' . $customerName;
    }

    function setPaymentMethod(Request $request, $id){
        $booking = Booking::findOrFail($id);
        $booking->outstanding_payment_method = $request->payment_method;
        $booking->save();

        if($request->payment_method == 'cc' && $request->generate_xendit_link){
            try {
                $url = env('API_URL') . "/api/new-backoffice/generate-xendit/{$booking->url}";
                $payload = [
                    'type' => 'cc',
                    'api' => true
                ];
                $response = Http::post($url, $payload);
            } catch (\Exception $e) {
                \Log::error('Failed to send receipt', [
                    'payment_id' => 207,
                    'error' => $e->getMessage()
                ]);
            }
        }

    }
    function delete($id){
        $booking = Booking::findOrFail($id);
        DB::transaction(function () use ($id) {
            BookGuideDriver::where('booking_id', $id)->delete();
            BookCar::where('booking_id', $id)->delete();
            WaLog::where('booking_id', $id)->delete();
            WaItinerary::where('booking_id', $id)->delete();
            BookingDocument::where('booking_id', $id)->delete();
            BookingPayment::where('booking_id', $id)->delete();
            BookRoomHotel::where('booking_id', $id)->delete();
            BookHotel::where('booking_id', $id)->delete();
            BookingItinerary::where('booking_id', $id)->delete();
            BookingDetail::where('booking_id', $id)->delete();
            BookAddOn::where('booking_id', $id)->delete();
            InvoiceHistory::where('booking_id', $id)->delete();
            $calc = TwCalculation::where('booking_id', $id)->first();
            if ($calc) {
                TwCalculationDetail::where('tw_calculation_id', $calc->id)->delete();
                $calc->delete();
            }
            $discount = Discount::where('booking_id', $id)->first();
            if ($discount) {
                $discount->delete();
            }

            Booking::where('id', $id)->delete();
        });
        return redirect()->back()->withStatus('Booking Deleted Successfully');
    }
    // function store(Request $request){
    //     // return dd($request->all());
    //     $customerInfo = json_decode($request->customer_info);
    //     $bookingInfo = json_decode($request->booking_info);
    //     $bookingItems = json_decode($request->booking_items);
    //     $financialSummary = json_decode($request->financial_summary);
    //     $user = new User();
    //     $user->name = $customerInfo->name;
    //     $user->phone = $customerInfo->phone;
    //     $user->email = $customerInfo->email;
    //     $user->country_id = $customerInfo->nationality_id;
    //     $user->avatar = 'default.jpg';
    //     $user->password  = Hash::make('password');
    //     $user->save();

    //     if ($bookingInfo->order_channel == 'twt') {
    //         $agent_id = 1;
    //         $booking_category_id = null;
    //         $package_duration = $request->package_duration;
    //         $night = $package_duration - 1;
    //         $packagePrice = str_replace('.', '', $financialSummary->grand_total) / $bookingInfo->number_of_pax;
    //         $attachment_id = 6;
    //     } else if ($bookingInfo->order_channel == 'jvto') {
    //         $agent_id = 2;
    //         $getPackage = Package::with('duration')->where('id', $bookingInfo->package_id)->first();
    //         $booking_category_id = $getPackage->category_id;
    //         $package_duration = $getPackage->duration->day;
    //         $night = $getPackage->duration->night;
    //         $packagePrice = str_replace('.', '', $financialSummary->package_price);
    //     } else if ($bookingInfo->order_channel == 'klook') {
    //         $agent_id = 2;
    //         $booking_category_id = 3;
    //         $getPackage = Package::with('duration')->where('id', $bookingInfo->package_id)->first();
    //         $package_duration = $getPackage->duration->day;
    //         $night = $getPackage->duration->night;
    //         $packagePrice = str_replace('.', '', $financialSummary->package_price);
    //         $attachment_id = 7;
    //     }

    //     $ym = date('Y-m', strtotime($bookingInfo->trip_date));
    //     $booking = Booking::where('agent_id', $agent_id)->where('travel_date_start', 'like', '%' . $ym . '%');
    //     $booking = $booking->orderBy('booking_numb', 'desc');
    //     $count = $booking->count();
    //     if ($count == 0) {
    //         $code = '001';
    //     } else {
    //         $booking = $booking->first();
    //         $code = (int) $booking->booking_numb + 1;
    //         $code = sprintf("%03s", $code);
    //     }

    //     $data = [
    //         'year' => date("y", strtotime($bookingInfo->trip_date)),
    //         'month' => date("m", strtotime($bookingInfo->trip_date)),
    //         'code' => $code
    //     ];


    //     $booking = new Booking();
    //     $booking->booking_code = "JVR/$data[code]/$data[month]/$data[year]";
    //     $booking->agent_id = $agent_id;
    //     $booking->booking_category_id = $booking_category_id;
    //     $booking->booking_date = date('Y-m-d');
    //     // $booking->due_date = $request->due_date;
    //     // $booking->invoice_code_origin = $request->invoice_code_origin;
    //     $booking->booking_numb = explode('/', $booking->booking_code)[1];
    //     $booking->user_id = $user->id;
    //     $booking->travel_date_start = $bookingInfo->trip_date;
    //     $booking->travel_date_end = date('Y-m-d', strtotime($booking->travel_date_start . " +$night days"));
    //     $booking->package_duration = $package_duration;
    //     $booking->total_pax = $bookingInfo->number_of_pax;
    //     $booking->pickup = $bookingInfo->pickup_location;
    //     $booking->pickup_time = $bookingInfo->pickup_time;
    //     // $booking->ticket_type_number = $request->ticket_type_number;
    //     $booking->drop = $bookingInfo->drop_location;
    //     $booking->drop_time = $bookingInfo->drop_time;

    //     $booking->dp = 0;
    //     $booking->dp_no_idr = 0;
    //     $booking->payment = 0;

    //     $totalPackagePrice = $packagePrice * $bookingInfo->number_of_pax;
    //     $addOnTotal = 0;
    //     $discount = 0;
    //     $booking->grand_total_before_disc = $totalPackagePrice + $addOnTotal;
    //     $booking->add_on_total = $addOnTotal;

    //     $booking->grand_total = $totalPackagePrice + $addOnTotal - $discount;

    //     $booking->balance = $booking->grand_total;
    //     $booking->status = 'booked';
    //     $booking->type = 'offline';
    //     $booking->payment_method = 'pay later';

    //     $cekUrlName = User::where('name', $user->name)->count();

    //     $urlName = str_replace(' ', '-', strtolower($user->name));

    //     $urlName = $cekUrlName != 1 ? $urlName . $cekUrlName : $urlName;

    //     $booking->url_name = $urlName;

    //     $booking->url = md5($urlName);

    //     $night = $booking->package_duration - 1;


    //     if ($request->is_shuttle) {
    //         $booking->is_shuttle = '1';
    //     }
    //     // if ($request->send_wa) {
    //         $booking->is_send_wa = '1';
    //         $booking->wa_schedule_trip_information = date('Y-m-d 20:00:00', strtotime($booking->travel_date_start . " -2 days"));
    //         $booking->wa_schedule_trip_media = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " +$night days"));
    //         $booking->wa_schedule_trip_media_crew = date('Y-m-d 15:00:00', strtotime($booking->travel_date_start . " -1 days"));
    //     // }
    //     $booking->custom_code = "";
    //     $booking->save();

    //     if ($request->hasFile('booking_file')) {
    //         $fileName = time() . '.' . $request->file('booking_file')->extension();
    //         $request->file('booking_file')->move(public_path('assets/customer-document'), $fileName);

    //         $bookingDocument = new BookingDocument();
    //         $bookingDocument->booking_id = $booking->id;
    //         $bookingDocument->user_id = $booking->user_id;
    //         $bookingDocument->attachment_type_id = $attachment_id; //Klook Booking Ticket
    //         $bookingDocument->file = $fileName;
    //         $bookingDocument->save();
    //     }
    //     $invoiceHistory = [];

    //     if ($bookingInfo->package_id) {
    //         $package = Package::find($bookingInfo->package_id);
    //         $invoiceDescription = $package->name;
    //         $packageId = $package->id;
    //     } else {
    //         $invoiceDescription = $booking->package_duration . " Days " . $night . " Night Package";
    //         $packageId = null;
    //     }

    //     $invoiceHistory[] = [
    //         'booking_id' => $booking->id,
    //         'description' => $invoiceDescription,
    //         'rate' => $packagePrice,
    //         'qty' => $request->number_of_pax,
    //         'line_total' => $totalPackagePrice,
    //         'type' => 'package',
    //         'parent_id' => $packageId,
    //     ];

    //     $bookingDetail = new BookingDetail();
    //     $bookingDetail->booking_id = $booking->id;
    //     $bookingDetail->package_id = $packageId;
    //     $bookingDetail->travel_date_start = $booking->travel_date_start;
    //     $bookingDetail->travel_date_end = $booking->travel_date_end;
    //     $bookingDetail->pax = $booking->total_pax;
    //     $bookingDetail->xss = $customerInfo->t_shirt_size->XSS ? $customerInfo->t_shirt_size->XSS : 0;
    //     $bookingDetail->xxs = $customerInfo->t_shirt_size->XXS ? $customerInfo->t_shirt_size->XXS : 0;
    //     $bookingDetail->xs = $customerInfo->t_shirt_size->XS ? $customerInfo->t_shirt_size->XS : 0;
    //     $bookingDetail->s = $customerInfo->t_shirt_size->S ? $customerInfo->t_shirt_size->S : 0;
    //     $bookingDetail->m = $customerInfo->t_shirt_size->M ? $customerInfo->t_shirt_size->M : 0;
    //     $bookingDetail->l = $customerInfo->t_shirt_size->L ? $customerInfo->t_shirt_size->L : 0;
    //     $bookingDetail->xl = $customerInfo->t_shirt_size->XL ? $customerInfo->t_shirt_size->XL : 0;
    //     $bookingDetail->xxl = $customerInfo->t_shirt_size->XXL ? $customerInfo->t_shirt_size->XXL : 0;
    //     $bookingDetail->xxxl = $customerInfo->t_shirt_size->XXXL ? $customerInfo->t_shirt_size->XXXL : 0;
    //     $bookingDetail->save();

    //     foreach ($invoiceHistory as $key => $value) {
    //         $invoiceHistory = new InvoiceHistory();
    //         $invoiceHistory->booking_id = $value['booking_id'];
    //         $invoiceHistory->description = $value['description'];
    //         $invoiceHistory->rate = $value['rate'];
    //         $invoiceHistory->qty = $value['qty'];
    //         $invoiceHistory->line_total = $value['line_total'];
    //         $invoiceHistory->type = $value['type'];
    //         $invoiceHistory->parent_id = $value['parent_id'];
    //         $invoiceHistory->save();
    //     }


    // }
}
