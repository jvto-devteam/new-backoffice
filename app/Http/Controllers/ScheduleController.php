<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\BookCar;
use App\Models\BookGuideDriver;
use App\Models\BookHotel;
use App\Models\Booking;
use App\Models\BookingCategory;
use App\Models\BookingItinerary;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Booking Overview';
        $pageTitle = 'Booking Overview';
        $data['filters'] = [
            'search' => $request->search ? $request->search : '',
            'startDate' => $request->startDate ? $request->startDate : date('Y-m-01'),
            'endDate' => $request->endDate ? $request->endDate : date('Y-m-t'),
            'channel' => $request->channel ? $request->channel : '',
            'paymentStatus' => $request->paymentStatus ? $request->paymentStatus : ''
        ];

        $startEnd = explode(" to ", $request->start_end);
        $data['startDate'] = $request->start_end ? $startEnd[0] : date('Y-m-01');
        $data['endDate'] = $request->start_end ? $startEnd[1] : date('Y-m-t', strtotime(date('Y-m-d')));
        $data['month'] = $request->month ? $request->month : date('m');
        $data['year'] = $request->year ? $request->year : date('Y');
        $data['source'] = $request->source ? $request->source : '';

        if ($request->get('month')) {
            $data['startDate'] = date('Y-' . $request->get('month') . '-01');
            $data['endDate'] = date('Y-' . $request->get('month') . '-t');
        }

        $order = $request->order ? $request->order : "travel_date_start-asc";
        $data['order_by'] = explode('-', $order)[0];
        $data['order_type'] = explode('-', $order)[1];
        if ($request->select) {
            $data['selected_field'] = explode(';', $request->select);
            $data['selected_field_string'] = $request->select;
        } else {
            $data['selected_field'] = ['Customer', 'Traveling Date', 'Durations', 'Agent', 'No. of Pax', 'Pickup', 'Drop', 'Vehicle', 'Crew', 'Input Date'];
            $data['selected_field_string'] = implode(';', $data['selected_field']);
        }

        try {
            $data['selectedCategory'] = "";
            if ($request->category) {
                $bookingCategory = BookingCategory::find($request->category);
                $data['selectedCategory'] = $bookingCategory->name;
            }
            $data['bookingCategory'] = BookingCategory::get();
            $data['booking'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', 'like', "$data[year]-%");
            if ($request->vendor) {
                $data['agent'] = Agent::find($request->vendor);
                $data['booking'] = $data['booking']->where('agent_id', $request->vendor);
                if ($request->vendor == 2) {
                    if ($request->category) {
                        $data['category'] = BookingCategory::find($request->category);
                        $data['booking'] = $data['booking']->where('booking_category_id', $request->category);
                    } else {
                        $data['booking'] = $data['booking']->where('booking_category_id', '!=', 3);
                    }
                }
            }
            if ($request->channel) {
                if ($request->channel == 'KLOOK') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id',3);
                }
                else if ($request->channel == 'JVTO') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id','!=',3);
                }
                else if ($request->channel == 'TWT') {
                    $data['booking'] = $data['booking']->where('agent_id', '1');
                }
            }
            if ($request->source) {
                if ($request->source == 'KLOOK') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id',3);
                }
                else if ($request->source == 'JVTO') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id','!=',3);
                }
                else if ($request->source == 'TWT') {
                    $data['booking'] = $data['booking']->where('agent_id', '1');
                }
            }
            if($request->package_id){
                $package_id = $request->package_id;
                $data['booking'] = $data['booking']->whereHas('bookingDetail',function($query) use($package_id){
                    $query->where('package_id',$package_id);
                });
            }
            if ($request->booking_id) {
                $booking_id = explode('-', $request->booking_id);
                if (count($booking_id) > 1) {
                    $booking_id = $booking_id[1];
                } else {
                    $booking_id = $request->booking_id;
                }

                $data['booking'] = $data['booking']->where('id', $booking_id);
            }
            if ($request->search) {
                $customer_name = $request->search;
                $data['booking'] = $data['booking']->whereHas('user', function ($query) use ($customer_name) {
                    $query->where('name', "like", "%" . $customer_name . "%");
                });
            }
            if ($request->search) {
                $data['booking'] = $data['booking']->whereHas('user', function ($query) use ($request) {
                    $query->where('name', "like", "%" . $request->search . "%");
                });
            }
            $status = "booked";
            $data['booking_status'] = "CONFIRMED";
            $data['booking_status_color'] = "success";
            if ($request->booking_status) {
                $status = $request->booking_status == 'pending' ? 'pending wise' : $request->booking_status;
                $data['booking'] = $data['booking']->where('status', $status);

                if ($request->booking_status == 'pending') {
                    $data['booking_status'] = strtoupper($request->booking_status);
                    $data['booking_status_color'] = "warning";
                }
            }
            if ($request->get('filter-column')) {
                $filterColumn = $request->get('filter-column');
                $filterId = $request->get('filter-column-item');
                if ($filterColumn == 'Garage') {
                    $data['booking'] = $data['booking']->whereHas('bookCar.car', function ($query) use ($filterId) {
                        $query->where('garage_id', $filterId);
                    });
                } else if ($filterColumn == 'Vehicle') {
                    $data['booking'] = $data['booking']->whereHas('bookCar', function ($query) use ($filterId) {
                        $query->where('car_id', $filterId);
                    });
                } else if ($filterColumn == 'Hotel') {
                    $data['booking'] = $data['booking']->whereHas('bookingItinerary.bookHotel', function ($query) use ($filterId) {
                        $query->where('hotel_id', $filterId);
                    });
                } else if ($filterColumn == 'Crew') {
                    $data['booking'] = $data['booking']->whereHas('guideDriver', function ($query) use ($filterId) {
                        $query->where('guide_id', $filterId);
                    });
                }
            }
            $data['booking'] = $data['booking']->where('status', $status)->orderBy($data['order_by'], $data['order_type'])->get();

            $data['booking'] = $data['booking']->map(function($booking){
                $orderChannel = $booking->agent_id == 1 ? 'TWT' : ($booking->agent_id == 2 && $booking->booking_category_id == 3 ? 'KLOOK' : 'JVTO');
                $itinerary = [];
                $hotels = [];
                foreach ($booking->bookingItinerary as $key => $value) {
                    $itinerary[]= [
                        'day' => $value->day,
                        'itinerary' => $value->itinerary,
                    ];
                    if(count($value->bookHotel) != 0){
                        $night = $value->day - 1;
                        $hotels[]= [
                            'day' => $value->day,
                            'checkIn' => date('d M Y',strtotime($booking->travel_date_start." +$night days")),
                            'hotel' => $value->bookHotel[0]->hotel->name,
                            'rooms' => [],
                        ];
                        foreach ($value->bookHotel[0]->bookRoom as $index => $data) {
                            $hotels[$key]['rooms'] = [
                                'roomName' => $data->roomHotel->room_name,
                                'quantity' => $data->quantity,
                            ];
                        }
                    }
                }
                $tshirtSizes = [];
                if($booking->bookingDetail[0]->xss != 0){
                    array_push($tshirtSizes, "XSS x ".$booking->bookingDetail[0]->xss);
                }
                if($booking->bookingDetail[0]->xxs != 0){
                    array_push($tshirtSizes, "XXS x ".$booking->bookingDetail[0]->xxs);
                }
                if($booking->bookingDetail[0]->xs != 0){
                    array_push($tshirtSizes, "XS x ".$booking->bookingDetail[0]->xs);
                }
                if($booking->bookingDetail[0]->s != 0){
                    array_push($tshirtSizes, "S x ".$booking->bookingDetail[0]->s);
                }
                if($booking->bookingDetail[0]->m != 0){
                    array_push($tshirtSizes, "M x ".$booking->bookingDetail[0]->m);
                }
                if($booking->bookingDetail[0]->l != 0){
                    array_push($tshirtSizes, "L x ".$booking->bookingDetail[0]->l);
                }
                if($booking->bookingDetail[0]->xl != 0){
                    array_push($tshirtSizes, "XL x ".$booking->bookingDetail[0]->xl);
                }
                if($booking->bookingDetail[0]->xxl != 0){
                    array_push($tshirtSizes, "XXL x ".$booking->bookingDetail[0]->xxl);
                }
                if($booking->bookingDetail[0]->xxxl != 0){
                    array_push($tshirtSizes, "XXXL x ".$booking->bookingDetail[0]->xxxl);
                }
                $tshirtSize = implode(', ',$tshirtSizes);
                
                $vehicles = [];
                if(count($booking->bookCar)!=0){
                    foreach ($booking->bookCar as $key => $value) {
                        array_push($vehicles,$value->car->name);
                    };
                }
                
                $drivers = [];
                $guides = [];

                if(count($booking->guideDriver) != 0){
                    foreach ($booking->guideDriver as $key => $value) {
                        if($value->type == 'driver'){
                            array_push($drivers,$value->person->name);
                        }
                        else{
                            $guides[] = [
                                'name' => $value->person->name,
                                'type' => $value->guide_ijen == '0' ? 'Escort' : 'Ijen',
                            ];
                        }
                    };
                }
                $invoiceLinks = [];
                if($orderChannel == 'JVTO'){
                    array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/".$booking->id);
                    if($booking->book_add_on_total != 0){
                        array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/".$booking->id."?addon=true");
                    }
                }

                return [
                    'booking_id' => $booking->id,
                    'id' => $orderChannel."-".$booking->id,
                    'orderChannel' => $orderChannel,
                    'guest_id' => $booking->user_id,
                    'guest' => $booking->user->name,
                    'total_pax' => $booking->total_pax,
                    'duration' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->duration->day."D ".$booking->bookingDetail[0]->package->duration->night."N" : $booking->package_duration."D ".($booking->package_duration-1)."N",
                    'package' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->name : $booking->package_duration."D ".($booking->package_duration-1)."N Package",
                    'date' => [
                        'start_ymd' => $booking->travel_date_start,
                        'start' => date('d M y',strtotime($booking->travel_date_start)),
                        'end' => date('d M y',strtotime($booking->travel_date_end)),
                        'days' => date('D',strtotime($booking->travel_date_start))." - ".date('D',strtotime($booking->travel_date_end)),
                    ],
                    'pickup' => [
                        'meeting_point' => $booking->meeting_point,
                        'meeting_point_arrival' => $booking->meeting_point_arrival,
                        'meeting_point_value' => $booking->meeting_point_value,
                        'pickup_time' => date("H:i",strtotime($booking->pickup_time)),
                    ],
                    'dropoff' => [
                        'drop_point' => $booking->drop_point,
                        'drop_point_arrival' => $booking->drop_point_arrival,
                        'drop_point_value' => $booking->drop_point_value,
                        'drop_time' => date("H:i",strtotime($booking->drop_time)),
                    ],
                    'itinerary' => $itinerary,
                    'hotels' => $hotels,
                    'tshirtSize' => $tshirtSize,
                    'vehicles' => $vehicles,
                    'drivers' => $drivers,
                    'guides' => $guides,
                    'financial' => [
                        'payment' =>  $booking->payment,
                        'balance' =>  $booking->balance,
                        'paymentMethod' =>  $booking->outstanding_payment_method,
                        'invoice' => [
                            'total' => $booking->grand_total+$booking->book_add_on_total,
                            'invoiceLink' => $invoiceLinks,
                        ],
                        'expense' => [
                            'total' => $booking->expense_internal_total,
                            'expenseLink' => $booking->expense_file_internal ? $booking->expense_file_internal : '/finance/expense-manager/'.$booking->id.'/edit',
                            'target' => '_blank'
                        ],
                        'profit' =>  $booking->grand_total+$booking->book_add_on_total-$booking->expense_internal_total
                    ],
                    'paymentHistory' => $booking->bookingPayment->map(function($payment){
                        return [
                            'nominal' => $payment->nominal,
                            'paymentMethod' => $payment->paymentMethod->name,
                            'description' => $payment->description,
                            'reference' => $payment->reference,
                            'date' => date('d M y H:i',strtotime($payment->created_at)),
                        ];
                    }),
                    'notes' => $booking->note,
                ];
            });

            // return $data['booking']; 
            $data['package'] = Package::with('duration')->where('is_publish','1')->get();

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        // return $data;
        if($request->export){
            return \view('exports.schedule-excel', $data);
        }
        else if($request->pdf){
            // return view('exports.pdf-schedule', $data);
            $pdf = PDF::loadView('exports.pdf-schedule', $data)->setPaper('A4', 'landscape')->setOptions([
                'margin_top' => 5,
                'margin_bottom' => 5,
                'margin_left' => 5,
                'margin_right' => 5,
            ]);
                // Download or display the PDF
            $name = "_".$data['filters']['startDate']."_".$data['filters']['endDate']."_";
            $name .= request()->channel ? request()->channel : 'all';
        
            $name = 'Schedule'.$name.'.pdf';
            return $pdf->download($name);
        }
        else{
            return Inertia::render('Schedule/Index',['data' => $data]);
        }
    }

    function details($id){
        $booking = Booking::with(['user.country','bookingDetail.package.itinerary' => function($query){
            $query->with(['itineraryDetail' => function($q){
                $q->orderBy('no','asc')->with('activity.activityCategory');
            }]);
        },'bookingPayment'])->where('id',$id)->first();
        $itinerary = BookingItinerary::with('activityStart.destination')->where('booking_id',$id)->get()->map(function($query) use($booking){
            $night = $query->day - 1;
            return [
                'day' => $query->day,
                'date' => date('d F Y',strtotime($booking->travel_date_start." +$night days")),
                'itinerary' => $query->itinerary,
                'activity' => $query->activityStart && $query->activityStart->destination ? $query->activityStart->destination->name : null
            ];
        });
        $bookHotel = BookHotel::with(['bookingItinerary','hotel','bookRoom.roomHotel'])->where('booking_id',$id)->get()->map(function($query) use($booking){
            $night = $query->day - 1;
            return [
                'day' => $query->bookingItinerary->day,
                'hotel' => $query->hotel->name,
                'check_in' => date('d F Y',strtotime($booking->travel_date_start." +$night days")),
                'rooms' => $query->bookRoom->map(function($q){
                    return [
                        'room_name' => $q->roomHotel->room_name,
                        'quantity' => $q->quantity,
                    ];
                }),
            ];
        });
        $cars = [];
        $drivers = [];
        $escorts = [];
        $ijens = [];
        $car = BookCar::with('car')->where('booking_id',$id)->get()->map(function($query) use(&$cars){
            array_push($cars,$query->car->name);
            return $query;
        });

        $driver = BookGuideDriver::with('person')->where('booking_id',$id)->where('type','driver')->get()->map(function($query) use(&$drivers){
            array_push($drivers,$query->person->name);
            return $query;
        });

        $escort = BookGuideDriver::with('person')->where('booking_id',$id)->where('type','guide')->where('guide_ijen','0')->get()->map(function($query) use(&$escorts){
            array_push($escorts,$query->person->name);
            return $query;
        });

        $ijen = BookGuideDriver::with('person')->where('booking_id',$id)->where('type','guide')->where('guide_ijen','1')->get()->map(function($query) use(&$ijens){
            array_push($ijens,$query->person->name);
            return $query;
        });
        
        if($booking->agent_id == 1){
           $channel = 'TWT'; 
        }
        else if($booking->agent_id == 2 && $booking->booking_category_id != 3){
           $channel = 'JVTO'; 
        }
        else if($booking->agent_id == 2 && $booking->booking_category_id == 3){
           $channel = 'KLOOK'; 
        }

        $invoiceLinks = [];
        if($channel == 'JVTO'){
            array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/".$booking->id);
            if($booking->book_add_on_total != 0){
                array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/".$booking->id."?addon=true");
            }
        }

        $tshirt = [];
        if($booking->bookingDetail[0]->xss){
            array_push($tshirt,"XSS: ".$booking->bookingDetail[0]->xss);
        }
        if($booking->bookingDetail[0]->xxs){
            array_push($tshirt,"XXS: ".$booking->bookingDetail[0]->xxs);
        }
        if($booking->bookingDetail[0]->xs){
            array_push($tshirt,"XS: ".$booking->bookingDetail[0]->xs);
        }
        if($booking->bookingDetail[0]->s){
            array_push($tshirt,"S: ".$booking->bookingDetail[0]->s);
        }
        if($booking->bookingDetail[0]->m){
            array_push($tshirt,"M: ".$booking->bookingDetail[0]->m);
        }
        if($booking->bookingDetail[0]->l){
            array_push($tshirt,"L: ".$booking->bookingDetail[0]->l);
        }
        if($booking->bookingDetail[0]->xl){
            array_push($tshirt,"XL: ".$booking->bookingDetail[0]->xl);
        }
        if($booking->bookingDetail[0]->xxl){
            array_push($tshirt,"XXL: ".$booking->bookingDetail[0]->xxl);
        }
        if($booking->bookingDetail[0]->xxxl){
            array_push($tshirt,"XXXL: ".$booking->bookingDetail[0]->xxxl);
        }
        $tshirts = implode(", ",$tshirt);

        $package_information = [];
        if($channel != 'TWT'){
            $package_information = $booking->bookingDetail[0]->package->itinerary->map(function($query, $index) use ($booking) {
                // Get total days to identify first and last day
                $totalDays = $booking->bookingDetail[0]->package->itinerary->count();
                
                // Get the details for the current day
                $details = $query->itineraryDetail->map(function($q) {
                    return [
                        'time' => $q->time ? date('H:i', strtotime($q->time)) : null,
                        'activity' => $q->activity ? $q->activity->name : null,
                        'icon' => $q->activity->activityCategory->icon ?? null,
                        'notes' => $q->notes,
                        'location' => $q->location ? $q->location->name : null,
                        'activity_notes' => $q->activity ? $q->activity->notes : null,
                    ];
                })->toArray();
            
                // Add pickup record for first day
                if ($query->day === 1) {
                    array_unshift($details, [
                        'time' => null,
                        'icon' => "https://res.klook.com/image/upload/v1667274969/UED%20Team%EF%BC%88for%20DE%20only%EF%BC%89/Exp%20vertical/Itinerary/icon_category_location_3x.png",
                        'activity' => 'Departure',
                        'notes' => null,
                        'location' => null,
                        'activity_notes' => null
                    ]);
                }
            
                // Add drop record for last day
                if ($query->day === $totalDays) {
                    $details[] = [
                        'time' => null,
                        'icon' => "https://res.klook.com/image/upload/v1667274969/UED%20Team%EF%BC%88for%20DE%20only%EF%BC%89/Exp%20vertical/Itinerary/icon_category_location_3x.png",
                        'activity' => 'Return',
                        'notes' => null,
                        'location' => null,
                        'activity_notes' => null
                    ];
                }
            
                return [
                    'day' => $query->day,
                    'details' => $details
                ];
            });            
        }

        $details = [
            'client_information' => [
                'client_id' => $booking->user->id,
                'client_name' => $booking->user->name,
                'contact_number' => $booking->user->phone,
                'email_address' => $booking->user->email,
                'nationality' => $booking->user->country ? $booking->user->country->long_name : '-',
            ],
            'booking_information' => [
                'booking_id' => $channel."-".$booking->id,
                'booking_reference_id' => $channel == 'JVTO' ? $booking->booking_code : $booking->invoice_code_origin,
                'order_channel' => $channel,
                'tour_package' => $channel != 'TWT' ? $booking->bookingDetail[0]->package->package_code." | ".$booking->bookingDetail[0]->package->name : '-',
                'number_of_participants' => $booking->total_pax,
                'travel_date' => date('d F Y',strtotime($booking->travel_date_start)),
                'booking_date' => date('d F Y',strtotime($booking->booking_date)),
                'tshirt' => $tshirts,
                'pickup' => [
                    'location' => $booking->meeting_point ? $booking->meeting_point : '-',
                    'arrival' => $booking->meeting_point_arrival ? $booking->meeting_point_arrival : '-',
                    'location_value' => $booking->meeting_point_value ? $booking->meeting_point_value : '-',
                    'time' => $booking->pickup_time ? date('H:i',strtotime($booking->pickup_time)) : '-',
                ],
                'drop' => [
                    'location' => $booking->drop_point ? $booking->drop_point : '-',
                    'arrival' => $booking->drop_point_arrival ? $booking->drop_point_arrival : '-',
                    'location_value' => $booking->drop_point_value ? $booking->drop_point_value : '-',
                    'time' => $booking->drop_time ? date('H:i',strtotime($booking->drop_time)) : '-',
                ],
                'special_requirements' => $booking->special_requirements,
                'notes' => $booking->note
            ],
            'package_information' => $package_information,
            'itinerary_information' => $itinerary,
            'accommodation_information' => $bookHotel,
            'resource_allocation_information' => [
                'cars' => $cars,
                'crews' => [
                    'driver' => $drivers,
                    'escort' => $escorts,
                    'ijen' => $ijens,
                ],
            ],
            'financial_data' => [
                'payment' =>  $booking->payment,
                'balance' =>  $booking->balance,
                'paymentMethod' =>  $booking->outstanding_payment_method ? strtoupper($booking->outstanding_payment_method) : $booking->outstanding_payment_method,
                'invoice' => [
                    'total' => $booking->grand_total+$booking->book_add_on_total,
                    'invoiceLink' => $invoiceLinks,
                ],
                'expense' => [
                    'total' => $booking->expense_internal_total,
                    'expenseLink' => $booking->expense_file_internal ? $booking->expense_file_internal : '/finance/expense-manager/'.$booking->id.'/edit',
                    'target' => '_blank'
                ],
                'profit' =>  $booking->grand_total+$booking->book_add_on_total-$booking->expense_internal_total,
                'payment_history' => $booking->bookingPayment->map(function($payment){
                    return [
                        'nominal' => $payment->nominal,
                        'paymentMethod' => $payment->paymentMethod->name,
                        'description' => $payment->description,
                        'reference' => $payment->reference,
                        'date' => date('d M y H:i',strtotime($payment->created_at)),
                    ];
                }),

            ],
        ];
        // return $details;
        return Inertia::render('Schedule/Details', ['initialData' => $details]);
    }

    function bookingList(Request $request){
        return Inertia::render('Schedule/BookingList');
    }

    function bookingAnalist(Request $request){

        $data['filter'] = [
            'month' => $request->month ? $request->month : date('m'),
            'year' => $request->year ? $request->year : date('Y'),
            'channel' => $request->channel ? $request->channel : 'all',
            'hotel' => $request->hotel ? $request->hotel : '',
            'activity' => $request->activity ? $request->activity : '',
            'activeTab' => $request->activeTab ? $request->activeTab : 'all-reports',
        ];

        $data['destination'] = Destination::whereRaw('id in(1,2,7)')->get(['id','name']);
        $data['hotel'] = Hotel::whereRaw('id in(1,10,11,34)')->get(['id','name']);
        $last_month_year = date('Y-m',strtotime($data['filter']['year']."-".$data['filter']['month']."-01 -1 month"));

        $data['total_booking_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_booking_current_month'] = $data['total_booking_current_month']->count();

        $data['total_booking_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_booking_last_month'] = $data['total_booking_last_month']->count();


        if ($data['total_booking_last_month'] > 0) {
            $data['total_booking_percentage_change'] = round(($data['total_booking_current_month'] - $data['total_booking_last_month']) / $data['total_booking_last_month'] * 100);
        } else {
            $data['total_booking_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_booking_percentage_change'] == 0){
            $data['total_booking_percentage_change'] = "";
            $data['total_booking_percentage_change_trend'] = "same";
        }
        else if($data['total_booking_percentage_change'] < 0){
            $data['total_booking_percentage_change'] = $data['total_booking_percentage_change']."%";
            $data['total_booking_percentage_change_trend'] = "down";
        }
        else{
            $data['total_booking_percentage_change'] = "+".$data['total_booking_percentage_change']."%";
            $data['total_booking_percentage_change_trend'] = "up";
        }

        $data['total_invoice_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_invoice_current_month'] = $data['total_invoice_current_month']->sum('grand_total');

        $data['total_expense_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_expense_current_month'] = $data['total_expense_current_month']->sum('expense_internal_total');

        $data['total_invoice_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_invoice_last_month'] = $data['total_invoice_last_month']->sum('grand_total');

        $data['total_expense_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_expense_last_month'] = $data['total_expense_last_month']->sum('expense_internal_total');

        $data['total_profit_current_month'] = $data['total_invoice_current_month'] - $data['total_expense_current_month'];

        $data['total_profit_last_month'] = $data['total_invoice_last_month'] - $data['total_expense_last_month'];

        if ($data['total_invoice_last_month'] > 0) {
            $data['total_invoice_percentage_change'] = round(($data['total_invoice_current_month'] - $data['total_invoice_last_month']) / $data['total_invoice_last_month'] * 100);
        } else {
            $data['total_invoice_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_invoice_percentage_change'] == 0){
            $data['total_invoice_percentage_change'] = "";
            $data['total_invoice_percentage_change_trend'] = "same";
        }
        else if($data['total_invoice_percentage_change'] < 0){
            $data['total_invoice_percentage_change'] = $data['total_invoice_percentage_change']."%";
            $data['total_invoice_percentage_change_trend'] = "down";
        }
        else{
            $data['total_invoice_percentage_change'] = "+".$data['total_invoice_percentage_change']."%";
            $data['total_invoice_percentage_change_trend'] = "up";
        }
        $data['total_invoice_current_month'] = "IDR ".number_format($data['total_invoice_current_month'],0,',','.');

        if ($data['total_profit_last_month'] > 0) {
            $data['total_profit_percentage_change'] = round(($data['total_profit_current_month'] - $data['total_profit_last_month']) / $data['total_profit_last_month'] * 100);
        } else {
            $data['total_profit_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_profit_percentage_change'] == 0){
            $data['total_profit_percentage_change'] = "";
            $data['total_profit_percentage_change_trend'] = "same";
        }
        else if($data['total_profit_percentage_change'] < 0){
            $data['total_profit_percentage_change'] = $data['total_profit_percentage_change']."%";
            $data['total_profit_percentage_change_trend'] = "down";
        }
        else{
            $data['total_profit_percentage_change'] = "+".$data['total_profit_percentage_change']."%";
            $data['total_profit_percentage_change_trend'] = "up";
        }
        $data['total_profit_current_month'] = "IDR ".number_format($data['total_profit_current_month'],0,',','.');

        $year = $data['filter']['year'];
        $month = $data['filter']['month'];
        $data['report']['data_hotel'] = [];
        $data['report']['data_hotel']['book_hotel'] = [];
        $data['report']['data_tshirt'] = [];
        $data['report']['data_activity'] = [];

        if($request->activeTab == 'accommodations'){
            $getBookHotel = BookHotel::with([
                'bookRoom.roomHotel',
                'booking.user',
                'bookingItinerary',
            ])
                ->where('hotel_id', $data['filter']['hotel'])
                ->whereHas('booking', function ($query) use ($year, $month) {
                    $query->where('travel_date_start', 'like', "%$year-$month%");
                });
            if($data['filter']['channel'] != 'all'){
                if($data['filter']['channel'] == 'twt'){
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 1);
                    });
                }
                else if($data['filter']['channel'] == 'jvto'){
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 2)->where('booking_category_id','!=',3);
                    });
                }
                else{
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 2)->where('booking_category_id',3);
                    });
                }
            }

            $bookHotel = $getBookHotel->get()->sortBy(function ($item) use ($year, $month) {
                $plusDay = $item->bookingItinerary->day - 1;
                $checkIn = date('Y-m-d', strtotime($item->booking->travel_date_start . " +$plusDay days"));
                return $checkIn;
            });
            $data['report']['data_hotel']['book_hotel'] = $bookHotel;
            $data['report']['data_hotel']['total_booking'] = $bookHotel->count();
            $data['report']['data_hotel']['total_pax'] = $bookHotel->sum('booking.total_pax');
            $data['report']['data_hotel']['total_room'] = $bookHotel->sum('book_room.quantity');
            $data['report']['data_hotel']['total_rate'] = $bookHotel->sum('book_room.room_hotel.rate');
        }

        if ($request->activeTab == 'activities') {
            if ($request->activity == '1') {
                $data['report']['data_activity']['data_bromo'] = $this->getBromoData($year, $month, $data['filter']['channel']);
            }
            elseif ($request->activity == '2') {
                $data['report']['data_activity']['data_ijen'] = $this->getIjenData($year, $month, $data['filter']['channel']);
            } elseif ($request->activity == '7') {
                $data['report']['data_activity']['data_tumpak_sewu'] = $this->getTumpakSewuData($year, $month, $data['filter']['channel']);
            }
        }

        if ($request->activeTab == 't-shirts') {
            $data['report']['data_tshirt'] = $this->getTshirt($year, $month, $data['filter']['channel']);
        }

        // return $data['report']['data_tshirt'];

        return Inertia::render('Schedule/BookingAnalist',['data' => $data, 'total' => 1000]);
    }

    function getTshirt($year, $month, $channel) {

        $get_tshirt = Booking::select([
            'bookings.id',
            'bookings.agent_id',
            'bookings.booking_category_id',
            'users.id as client_id',
            'bookings.travel_date_start',
            'total_pax',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_details.xss',
            'booking_details.xxs',
            'booking_details.xs',
            'booking_details.s',
            'booking_details.m',
            'booking_details.l',
            'booking_details.xl',
            'booking_details.xxl',
            'booking_details.xxxl'
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->join('agents', 'bookings.agent_id', '=', 'agents.id')
            ->whereNotNull('bookings.travel_date_start')
            ->whereMonth('bookings.travel_date_start', $month)
            ->whereYear('bookings.travel_date_start', $year)
            ->where(function ($query) {
                $query->where('booking_details.xss', '>', 0)
                    ->orWhere('booking_details.xxs', '>', 0)
                    ->orWhere('booking_details.xs', '>', 0)
                    ->orWhere('booking_details.s', '>', 0)
                    ->orWhere('booking_details.m', '>', 0)
                    ->orWhere('booking_details.l', '>', 0)
                    ->orWhere('booking_details.xl', '>', 0)
                    ->orWhere('booking_details.xxl', '>', 0)
                    ->orWhere('booking_details.xxxl', '>', 0);
            })
            ->orderBy('bookings.travel_date_start', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $get_tshirt->where('bookings.agent_id', 1);
            }
            elseif($channel == 'jvto'){
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            }
            else{
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $get_tshirt->get();
    }

    function getBromoData($year, $month, $channel) {
        $getBromoData = Booking::select([
            'bookings.id',
            'users.id AS client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_bromo AS bromo_visit_date',
            'total_pax AS pax',
            'qty_jeep'
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_bromo')
            ->whereMonth('at_bromo', $month)
            ->whereYear('at_bromo', $year)
            ->orderBy('at_bromo', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getBromoData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getBromoData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getBromoData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getBromoData->get();
    }

    function getIjenData($year, $month, $channel)
    {
        $getIjenData = Booking::select([
            'bookings.id',
            'users.id as client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_bondowoso AS ijen_visit_date',
            'total_pax AS pax',
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_bondowoso')
            ->whereMonth('at_bondowoso', $month)
            ->whereYear('at_bondowoso', $year)
            ->orderBy('at_bondowoso', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getIjenData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getIjenData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getIjenData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getIjenData->get();
    }

    function getTumpakSewuData($year, $month, $channel)
    {
        $getTumpakSewuData = Booking::select([
            'bookings.id',
            'users.id as client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_tumpak_sewu AS ijen_visit_date',
            'total_pax AS pax',
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_tumpak_sewu')
            ->whereMonth('at_tumpak_sewu', $month)
            ->whereYear('at_tumpak_sewu', $year)
            ->orderBy('at_tumpak_sewu', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getTumpakSewuData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getTumpakSewuData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getTumpakSewuData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getTumpakSewuData->get();
    }

public function plotting(Request $request)
{
    try {
        DB::beginTransaction();
        
        $booking = Booking::where('id', $request->booking_id)->first();
        
        if (!$booking) {
            throw new \Exception('Booking not found');
        }

        $dateStart = Carbon::parse($booking->travel_date_start);
        $dateEnd = Carbon::parse($booking->travel_date_end);
        
        $night = $dateStart->diffInDays($dateEnd);
        $day = $night + 1;
        
        // Delete existing records
        BookCar::where('booking_id', $request->booking_id)->delete();
        BookGuideDriver::where('booking_id', $request->booking_id)->delete();
        
        // Save vehicles
        foreach ($request->vehicles as $value) {
            $bookCar = new BookCar();
            $bookCar->booking_id = $request->booking_id;
            $bookCar->car_id = $value;
            $bookCar->quantity = 1;
            $bookCar->start_date = $booking->travel_date_start;
            if ($booking->is_shuttle == '1') {
                $bookCar->duration = $night;
                $bookCar->end_date = date('Y-m-d', strtotime($booking->travel_date_end." -1 days"));
            } else {
                $bookCar->duration = $day;
                $bookCar->end_date = $booking->travel_date_end;
            }
            $bookCar->save();
        }
        
        // Save drivers
        foreach ($request->drivers as $value) {
            $bookDriver = new BookGuideDriver();
            $bookDriver->booking_id = $request->booking_id;
            $bookDriver->guide_id = $value;
            $bookDriver->type = 'driver';
            $bookDriver->start_date = $booking->travel_date_start;
            if ($booking->is_shuttle == '1') {
                $bookDriver->duration = $night;
                $bookDriver->end_date = date('Y-m-d', strtotime($booking->travel_date_end." -1 days"));
            } else {
                $bookDriver->duration = $day;
                $bookDriver->end_date = $booking->travel_date_end;
            }
            $bookDriver->save();
        }
        
        // Save escort guides
        foreach ($request->escortGuides as $value) {
            $bookDriver = new BookGuideDriver();
            $bookDriver->booking_id = $request->booking_id;
            $bookDriver->type = 'guide';
            $bookDriver->guide_id = $value;
            $bookDriver->start_date = $booking->travel_date_start;
            if ($booking->is_shuttle == '1') {
                $bookDriver->duration = $night;
                $bookDriver->end_date = date('Y-m-d', strtotime($booking->travel_date_end." -1 days"));
            } else {
                $bookDriver->duration = $day;
                $bookDriver->end_date = $booking->travel_date_end;
            }
            $bookDriver->save();
        }
        
        // Save ijen guides if applicable
        if ($booking->at_bondowoso) {
            foreach ($request->ijenGuides as $value) {
                $bookDriver = new BookGuideDriver();
                $bookDriver->booking_id = $request->booking_id;
                $bookDriver->type = 'guide';
                $bookDriver->guide_id = $value;
                $bookDriver->duration = 1;
                $bookDriver->start_date = $booking->at_bondowoso;
                $bookDriver->end_date = $booking->at_bondowoso;
                $bookDriver->guide_ijen = '1';
                $bookDriver->save();
            }
        }
        
        // Save notes
        $booking->note = $request->notes;
        $booking->save();

        DB::commit();
        
        return back()->with('message', 'Plotting saved successfully');
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to save plotting: ' . $e->getMessage()
        ], 500);
    }
    }
}
