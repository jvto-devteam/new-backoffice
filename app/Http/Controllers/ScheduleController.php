<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\BookCar;
use App\Models\BookGuideDriver;
use App\Models\BookHotel;
use App\Models\Booking;
use App\Models\BookingCategory;
use App\Models\BookingDocument;
use App\Models\BookingItinerary;
use App\Models\BookingPayment;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\Destination;
use App\Models\GuideDriver;
use App\Models\Hotel;
use App\Models\NoteCategory;
use App\Models\Package;
use App\Models\PackageHotel;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Spatie\GoogleCalendar\Event;
use Carbon\Carbon;


class ScheduleController extends Controller
{
    function index(Request $request)
    {
        $pageInfo = 'Booking Overview';
        $pageTitle = 'Booking Overview';
        $startEnd = explode("_", $request->date_range);
        $data['filters'] = [
            'search' => $request->search ? $request->search : '',
            'startDate' => $request->date_range ? $startEnd[0] : date('Y-m-01'),
            'endDate' => $request->date_range ? $startEnd[1] : date('Y-m-t'),
            'month' => $request->month ? $request->month : date('Y-m'),
            'channel' => $request->channel ? $request->channel : '',
            'filterType' => $request->filter_type ? $request->filter_type : 'month',
            // 'view' => $request->view ? $request->view : 'pickup,dropoff,tshirtSize,activities,itinerary,accommodation,vehicleCrew,financial,notes', // Add this line
            'view' => $request->view ? $request->view : 'pickup,dropoff,itinerary,accommodation,vehicleCrew,financial,notes', // Add this line
            'sort_column' => $request->sort_column ? $request->sort_column : 'date',
            'sort_order' => $request->sort_order ? $request->sort_order : 'asc',
            'payment' => $request->payment ? $request->payment : '',
            'crew' => $request->crew ? $request->crew : '',
        ];

        $data['note_categories'] = NoteCategory::get();

        try {
            $data['booking'] = Booking::with(['bookingPayment.paymentMethod', 'bookingCategory', 'user.country', 'user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area', 'bookingItinerary.activityStart.destination', 'bookingDocument']);
            if (!$request->filter_type || $request->filter_type == 'month') {
                $data['booking'] = $data['booking']->where('travel_date_start', 'like', $data['filters']['month'] . "%");
            } else {
                $data['booking'] = $data['booking']->whereBetween('travel_date_start', [$data['filters']['startDate'], $data['filters']['endDate']]);
            }

            if ($request->channel) {
                if ($request->channel == 'KLOOK') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id', 3);
                } else if ($request->channel == 'JVTO') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id', '!=', 3);
                } else if ($request->channel == 'TWT') {
                    $data['booking'] = $data['booking']->where('agent_id', '1');
                }
            }
            if ($request->search) {
                $data['booking'] = $data['booking']->whereHas('user', function ($query) use ($request) {
                    $query->where('name', "like", "%" . $request->search . "%");
                });
            }
            $status = "booked";
            $orderByBookingColumn = $data['filters']['sort_column'] == 'date' ? 'travel_date_start asc, travel_date_end asc, booking_date' : $data['filters']['sort_column'];
            $orderByBookingOrder = $data['filters']['sort_order'] == 'asc' ? 'asc' : 'desc';
            if($request->payment) {
                if ($request->payment == 'fully') {
                    $data['booking'] = $data['booking']->where('balance', 0);
                } else if ($request->payment == 'partially') {
                    $data['booking'] = $data['booking']->where('balance', '>', 0);
                } else if ($request->payment == 'overdue') {
                    $data['booking'] = $data['booking']->where('balance', '>', 0)->where('travel_date_end', '<', date('Y-m-d'));
                }
            }
            if($request->crew) {
                $data['booking'] = $data['booking']->whereHas('guideDriver', function ($query) use ($request) {
                    $query->where('guide_id', $request->crew);
                });
            }
            $data['booking'] = $data['booking']->where('status', $status)->orderByRaw($orderByBookingColumn . " " . $orderByBookingOrder)->get();
            $data['bookingReal'] = $data['booking'];
            $d = $data;
            $data['booking'] = $data['booking']->map(function ($booking) use ($request, $d) {
                $orderChannel = $booking->agent_id == 1 ? 'TWT' : ($booking->agent_id == 2 && $booking->booking_category_id == 3 ? 'KLOOK' : 'JVTO');
                $itinerary = [];
                $hotels = [];
                foreach ($booking->bookingItinerary as $key => $value) {
                    $activity = $value->activityStart && $value->activityStart->destination ? ($value->activityStart->destination->activityDestination ? $value->activityStart->destination->activityDestination->name : $value->activityStart->destination->name) : null;

                    if ($activity) {
                        if ($value->activity_start_id == 7) {
                            $activity .= ", Madakaripura Warterfall Tour";
                        } else if ($value->activity_start_id == 5) {
                            $activity .= ", Papuma Beach Tour";
                        }
                    }


                    $itinerary[] = [
                        'day' => $value->day,
                        'date' => date('d M Y', strtotime($booking->travel_date_start . " +$key days")),
                        'itinerary' => $value->itinerary,
                        'activity' => $activity,
                        'destination_id' => $value->activityStart->destination ? $value->activityStart->destination->id : null,
                        'destination' => $value->activityStart->destination ? $value->activityStart->destination->name : null,

                    ];
                    if (count($value->bookHotel) != 0) {
                        $night = $value->day - 1;
                        $meals = [];
                        if ($value->bookHotel[0]->b == '1') {
                            array_push($meals, "Breakfast");
                        }
                        if ($value->bookHotel[0]->l == '1') {
                            array_push($meals, "Lunch");
                        }
                        if ($value->bookHotel[0]->d == '1') {
                            array_push($meals, "Dinner");
                        }
                        $hotels[] = [
                            'day' => $value->day,
                            'checkIn' => date('d M Y', strtotime($booking->travel_date_start . " +$night days")),
                            'hotelId' => $value->bookHotel[0]->hotel->id,
                            'hotel' => $value->bookHotel[0]->hotel->name,
                            'rooms' => [],
                            'meals' => $meals,
                        ];
                        foreach ($value->bookHotel[0]->bookRoom as $index => $data) {
                            $hotels[$key]['rooms'][] = [
                                'roomId' => $data->roomHotel->id,
                                'roomName' => $data->roomHotel->room_name,
                                'quantity' => $data->quantity,
                            ];
                        }
                    }
                }
                $tshirtSizes = [];
                if ($booking->bookingDetail[0]->xss != 0) {
                    array_push($tshirtSizes, "XSS x " . $booking->bookingDetail[0]->xss);
                }
                if ($booking->bookingDetail[0]->xxs != 0) {
                    array_push($tshirtSizes, "XXS x " . $booking->bookingDetail[0]->xxs);
                }
                if ($booking->bookingDetail[0]->xs != 0) {
                    array_push($tshirtSizes, "XS x " . $booking->bookingDetail[0]->xs);
                }
                if ($booking->bookingDetail[0]->s != 0) {
                    array_push($tshirtSizes, "S x " . $booking->bookingDetail[0]->s);
                }
                if ($booking->bookingDetail[0]->m != 0) {
                    array_push($tshirtSizes, "M x " . $booking->bookingDetail[0]->m);
                }
                if ($booking->bookingDetail[0]->l != 0) {
                    array_push($tshirtSizes, "L x " . $booking->bookingDetail[0]->l);
                }
                if ($booking->bookingDetail[0]->xl != 0) {
                    array_push($tshirtSizes, "XL x " . $booking->bookingDetail[0]->xl);
                }
                if ($booking->bookingDetail[0]->xxl != 0) {
                    array_push($tshirtSizes, "XXL x " . $booking->bookingDetail[0]->xxl);
                }
                if ($booking->bookingDetail[0]->xxxl != 0) {
                    array_push($tshirtSizes, "XXXL x " . $booking->bookingDetail[0]->xxxl);
                }
                $tshirtSize = implode(', ', $tshirtSizes);

                $vehicles = [];
                if (count($booking->bookCar) != 0) {
                    foreach ($booking->bookCar as $key => $value) {
                        array_push($vehicles, $value->car->name);
                    };
                }

                $drivers = [];
                $guides = [];

                if (count($booking->guideDriver) != 0) {
                    foreach ($booking->guideDriver as $key => $value) {
                        if ($value->type == 'driver') {
                            $recapEscort = BookGuideDriver::where('guide_id', $value->person->id)->where('guide_ijen', '0');
                            if (!$request->filter_type || $request->filter_type == 'month') {
                                $recapEscort = $recapEscort->where('start_date', 'like', $d['filters']['month'] . "%")->count();
                            } else {
                                $recapEscort = $recapEscort->whereBetween('start_date', [$d['filters']['startDate'], $d['filters']['endDate']]);
                            }
                            $drivers[] = [
                                'id' => $value->person->id,
                                'name' => $value->person->name,
                                'tags' => $value->person->tags,
                                'photo' => $value->person->photo ? 'https://javavolcano-touroperator.com/assets/img/guide/' . $value->person->photo : 'https://javavolcano-touroperator.com/assets/img/guide/default.jpg',
                                'recap_this_month_escort' => $recapEscort, // for driver & guide
                            ];

                            // array_push($drivers,$value->person->name);
                        } else {

                            $recapEscort = BookGuideDriver::where('guide_id', $value->person->id)->where('guide_ijen', '0');
                            $recapIjen = BookGuideDriver::where('guide_id', $value->person->id)->where('guide_ijen', '1');
                            if (!$request->filter_type || $request->filter_type == 'month') {
                                $recapEscort = $recapEscort->where('start_date', 'like', $d['filters']['month'] . "%")->count();
                                $recapIjen = $recapIjen->where('start_date', 'like', $d['filters']['month'] . "%")->count();
                            } else {
                                $recapEscort = $recapEscort->whereBetween('start_date', [$d['filters']['startDate'], $d['filters']['endDate']]);
                                $recapIjen = $recapIjen->whereBetween('start_date', [$d['filters']['startDate'], $d['filters']['endDate']]);
                            }
                            $guides[] = [
                                'id' => $value->person->id,
                                'name' => $value->person->name,
                                'type' => $value->guide_ijen == '0' ? 'Escort' : 'Ijen',
                                'tags' => $value->person->tags,
                                'photo' => $value->person->photo ? 'https://javavolcano-touroperator.com/assets/img/guide/' . $value->person->photo : 'https://javavolcano-touroperator.com/assets/img/guide/default.jpg',
                                'recap_this_month_escort' => $recapEscort, // for driver & guide
                                'recap_this_month_ijen' => $recapIjen, // for guide only

                            ];
                        }
                    };
                }
                $invoiceLinks = [];
                if ($orderChannel == 'JVTO') {
                    array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/" . $booking->id);
                    if ($booking->book_add_on_total != 0) {
                        array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/" . $booking->id . "?addon=true");
                    }
                } else {
                    $attachmentType = $orderChannel == 'TWT' ? 6 : 7;
                    $bookingDocument = BookingDocument::where('booking_id', $booking->id)->where('attachment_type_id', $attachmentType)->first();
                    if ($bookingDocument) {
                        $invoiceLinks = [
                            'https://new-backoffice.javavolcano-touroperator.com/preview-file?title=Invoice ' . $booking->user->name . '&url=https://new-backoffice.javavolcano-touroperator.com/assets/customer-document/' . $bookingDocument->file,
                        ];
                    }
                }

                if ($booking->balance == 0) {
                    $lastPayment = BookingPayment::where('booking_id', $booking->id)
                        ->orderBy('id', 'desc')  // Or use created_at if that's more appropriate
                        ->first();

                    // Then sum all payments except the one with that ID
                    $dp = BookingPayment::where('booking_id', $booking->id)
                        ->when($lastPayment, function ($query) use ($lastPayment) {
                            return $query->where('id', '!=', $lastPayment->id);
                        })
                        ->sum('nominal');
                } else {
                    $dp = $booking->balance;
                }
                $profit = $dp - $booking->expense_internal_total;

                return [
                    'booking_id' => $booking->id,
                    'id' => $orderChannel . "-" . $booking->id,
                    'orderChannel' => $orderChannel,
                    'guest_id' => $booking->user_id,
                    'guest' => $booking->user->name,
                    'guestDetails' => [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'phone' => $booking->user->phone,
                        'email' => $booking->user->email,
                        'country_id' => $booking->user->country?->id,
                        'country' => $booking->user->country?->long_name,
                        'trip_media' => $booking->media_link,
                    ],
                    'total_pax' => $booking->total_pax,
                    'duration' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->duration->day . "D " . $booking->bookingDetail[0]->package->duration->night . "N" : $booking->package_duration . "D " . ($booking->package_duration - 1) . "N",
                    'package_id' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package_id : null,
                    'package' => $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->name : $booking->package_duration . "D " . ($booking->package_duration - 1) . "N Package",
                    'booking_date' => date('d M Y', strtotime($booking->booking_date)),
                    'date' => [
                        'start_ymd' => $booking->travel_date_start,
                        'end_ymd' => $booking->travel_date_end,
                        'start' => date('d M y', strtotime($booking->travel_date_start)),
                        'end' => date('d M y', strtotime($booking->travel_date_end)),
                        'days' => date('D', strtotime($booking->travel_date_start)) . " - " . date('D', strtotime($booking->travel_date_end)),
                    ],
                    'pickup' => [
                        'meeting_point' => $booking->meeting_point,
                        'meeting_point_arrival' => $booking->meeting_point_arrival,
                        'meeting_point_value' => $booking->meeting_point_value,
                        'pickup_time' => date("H:i", strtotime($booking->pickup_time)),
                        'text' => $booking->pickup
                    ],
                    'dropoff' => [
                        'drop_point' => $booking->drop_point,
                        'drop_point_arrival' => $booking->drop_point_arrival,
                        'drop_point_value' => $booking->drop_point_value,
                        'drop_time' => date("H:i", strtotime($booking->drop_time)),
                        'text' => $booking->drop
                    ],
                    'itinerary' => $itinerary,
                    'hotels' => $hotels,
                    'tshirtSize' => $tshirtSize,
                    'vehicles' => $vehicles,
                    'drivers' => $drivers,
                    'guides' => $guides,
                    'is_shuttle' => $booking->is_shuttle == '1' ? 'YES' : 'NO',
                    'at_ijen' => $booking->at_bondowoso ? date('d M y', strtotime($booking->at_bondowoso)) : null,
                    'financial' => [
                        'payment' =>  $booking->payment,
                        'balance' =>  $booking->balance,
                        'paymentMethod' =>  $booking->outstanding_payment_method,
                        'paymentMethodLink' =>  $booking->outstanding_payment_link,
                        'invoice' => [
                            'total' => $booking->grand_total + $booking->book_add_on_total,
                            'invoiceLink' => $invoiceLinks,
                        ],
                        'expense' => [
                            'total' => $booking->expense_internal_total,
                            'crew_expense' => $booking->total_expense_crew,
                            'debt_expense' => $booking->total_expense_debt,
                            'expenseLink' => $booking->expense_file_internal ? $booking->expense_file_internal : '/finance/expense-manager/' . $booking->id . '/edit',
                            'target' => '_blank'
                        ],
                        'profit' =>  $profit
                    ],
                    'paymentHistory' => $booking->bookingPayment->map(function ($payment) use ($booking) {
                        $countBefore = BookingPayment::where('booking_id', $payment->booking_id)->where('id', '<=', $payment->id)->count();

                        return [
                            'id' => $payment->id,
                            'booking_id' => $payment->booking_id,
                            'nominal' => $payment->nominal,
                            'paymentMethodId' => $payment->paymentMethod->id,
                            'paymentMethod' => $payment->paymentMethod->name,
                            'description' => $payment->description,
                            'receipt' => str_replace('JVR', 'RCP', $booking->booking_code) . "/" . $countBefore,
                            'reference' => $payment->reference,
                            'date' => date('d M y H:i', strtotime($payment->created_at)),
                        ];
                    }),
                    'notes' => $booking->note,
                ];
            });
            $data['now'] = date('Y-m-d');
            $data['crew'] = GuideDriver::orderBy('name','asc')->get();
            // return $data;

            if ($request->json) {
                if ($request->download) {
                    $jsonData = json_encode($data['booking'], JSON_PRETTY_PRINT);

                    return response()->streamDownload(function () use ($jsonData) {
                        echo $jsonData;
                    }, 'booking.json', [
                        'Content-Type' => 'application/json',
                    ]);
                } else {
                    return $data['booking'];
                }
            }
            $data['package'] = Package::with('duration')->where('is_publish', '1')->get();
        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        // return $data;
        if ($request->export) {
            return \view('exports.schedule-excel', $data);
        } else if ($request->pdf) {
            // return view('exports.pdf-schedule', $data);
            $pdf = PDF::loadView('exports.pdf-schedule', $data)->setPaper('A4', 'landscape')->setOptions([
                'margin_top' => 5,
                'margin_bottom' => 5,
                'margin_left' => 5,
                'margin_right' => 5,
            ]);
            // Download or display the PDF
            $name = "_" . $data['filters']['startDate'] . "_" . $data['filters']['endDate'] . "_";
            $name .= request()->channel ? request()->channel : 'all';

            $name = 'Schedule' . $name . '.pdf';
            return $pdf->download($name);
        } else {
            if ($request->segment(2) == 'kanban') {
                return Inertia::render('Schedule/Kanban', ['bookingData' => $data['booking'], 'month' => $data['filters']['month']]);
            } else {
                return Inertia::render('Schedule/Index', ['data' => $data]);
            }
        }
    }

    function displayTime($time)
    {
        // Cek apakah format H:i (14:30) atau H:i:s (14:30:00)
        if (preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $time)) {
            return date('H:i', strtotime($time));
        }
        // Jika bukan time, tampilkan string biasa
        return $time;
    }

    public function packageDetailJson()
    {
        // Main package data with basic relations
        $package = Package::with([
            'duration',
            'category',
            'packagePrice.priceCategory',
            'packageDestination.destination.activities',
            'packageDestination.destination.destinationDetail',
            'packageBanner.gallery',
            'itinerary' => function ($q) {
                $q->orderBy('day', 'asc');
            },
            'itinerary.itineraryDestination.destination.activities', // pastikan ini benar
            'itinerary.itineraryDestination.secondDestination.activities', // pastikan ini benar
            'itinerary.itineraryMeals' => function ($query) {
                $query->where('price_plan_id', 2);
            },
            'itinerary.itineraryDetail.activity', // Add these new relationships
            'itinerary.itineraryDetail.location'
        ])->where('is_publish','1')->get()->map(function ($package) {
        // Initialize meal counters
        $mealSummary = [
            'breakfast' => 0,
            'lunch' => 0,
            'dinner' => 0
        ];

        $dailyMeals = [];

        // Base result structure
        $destinationIds = [];
        $destinationNames = [];
        $highlights = array_values(array_filter(
                    array_map(function($dest) {
                        return $dest['destination']['highlight'] ?? null;
                    }, $package->packageDestination->toArray() ?? []),
                    fn($value) => !is_null($value)
                ));
        array_push($highlights, 'Enjoy comfortable accommodations');
        array_push($highlights, 'Benefit from private transportation');
        array_push($highlights, 'Guided by experienced English-speaking guides');
        $result = [
            'package' => [
                'id' => (int)$package->id,
                'package_code' => $package->package_code,
                'name' => $package->name,
                'duration' => [
                    'id' => (int)$package->duration->id,
                    'name' => $package->duration->name,
                    'days' => (int)$package->duration->day,
                    'nights' => (int)$package->duration->night
                ],
                'departure' => $package->startDestination->name,
                'return' => $package->endDestination->name,
                'category' => $package->category->name,
                'overview' => $package->overview,
                'highligts' => $highlights,
                'key_experiences' => array_values(array_filter(
                    array_map(function($dest) {
                        return $dest['destination']['activities']['name'] ?? null;
                    }, $package->packageDestination->toArray() ?? []),
                    fn($value) => !is_null($value)
                )),
                'overall_physicality' => $package->physicality,
                'ideal_for' => $package->suitable_for,
                'url' => "https://javavolcano-touroperator.com/packages/" . strtolower($package->startDestination->name) . '/' . $package->duration->day . 'd' . $package->duration->night . 'n/' . $package->id_url,
                'galleries' => $package->packageBanner->map(function ($banner) {
                    return [
                        'id' => (int)$banner->gallery->id,
                        'image_url' => "https://javavolcano-touroperator.com/assets/img/destinations/" . $banner->gallery->image,
                        'caption' => $banner->gallery->caption,
                        'alt_text' => $banner->gallery->alt_text
                    ];
                }),
                'itinerary' => $package->itinerary->map(function ($itineraryDay) use (&$mealSummary,&$dailyMeals) {

                    $activities = [];
                    // Handle single itineraryDestination object
                    if ($itineraryDay->itineraryDestination) {
                        // Primary destination activities
                        if (
                            $itineraryDay->itineraryDestination->destination &&
                            $itineraryDay->itineraryDestination->destination->activities
                        ) {
                            $activity = $itineraryDay->itineraryDestination->destination->activities;
                            $activities[] = [
                                'activity_id' => $activity->activity_code,
                                'activity' => $activity->name
                            ];
                        }

                        // Secondary destination activities
                        if (
                            $itineraryDay->itineraryDestination->secondDestination &&
                            $itineraryDay->itineraryDestination->secondDestination->activities
                        ) {
                            $activity = $itineraryDay->itineraryDestination->secondDestination->activities;
                            $activities[] = [
                                'activity_id' => $activity->activity_code,
                                'activity' => $activity->name
                            ];
                        }
                    }

                    // Get meals for this day (now filtered by price_plan_id = 2 in the relationship)
                    $meals = [
                        'breakfast' => false,
                        'lunch' => false,
                        'dinner' => false
                    ];
                    $todayMeals = [];
                    if ($itineraryDay->itineraryMeals && !empty($itineraryDay->itineraryMeals[0])) {
                        $meals = [
                            'breakfast' => (bool)$itineraryDay->itineraryMeals[0]->breakfast,
                            'lunch' => (bool)$itineraryDay->itineraryMeals[0]->lunch,
                            'dinner' => (bool)$itineraryDay->itineraryMeals[0]->dinner
                        ];

                        // Update meal summary
                        if ($meals['breakfast']) {
                            $mealSummary['breakfast']++;
                            array_push($todayMeals, 'Breakfast');
                        }
                        if ($meals['lunch']){
                            $mealSummary['lunch']++;
                            array_push($todayMeals, 'Lunch');
                        }
                        if ($meals['dinner']){
                            $mealSummary['dinner']++;
                            array_push($todayMeals, 'Dinner');
                        }
                    }
                    $dailyMeals[] = [
                        'day' => $itineraryDay->day,
                        'itinerary' => $itineraryDay->title,
                        'meals' => count($todayMeals) == '' ? 'No meals provided' : implode(', ',$todayMeals)
                    ];

                    // Get detailed itinerary for this day
                    $detailedSchedule = $itineraryDay->itineraryDetail
                        ->sortBy('no')
                        ->values()
                        ->map(function ($detail) {
                            return [
                                'sequence_no' => (int)$detail->no,
                                'time' => $this->displayTime($detail->time),
                                // 'activity' => [
                                //     'id' => $detail->activity->id ?? null,
                                //     'name' => $detail->activity->name ?? null
                                // ],
                                // 'location' => [
                                //     'id' => $detail->location->id ?? null,
                                //     'name' => $detail->location->name ?? null
                                // ],
                                'activity' => strip_tags($detail->notes ?? ''),
                                // 'care_tip_for_tomorrow' => ''
                            ];
                        });
                    $todayHotel = PackageHotel::where('package_id', $itineraryDay->package_id)
                        ->where('day', $itineraryDay->day)
                        ->where('price_plan_id', 2)
                        ->first();
                    $travelLogistic = $itineraryDay->travel_logistic == '' ? '[]' : $itineraryDay->travel_logistic;
                    eval("\$travelLogisticArray = $travelLogistic;");

                    return [
                        'id' => (int)$itineraryDay->id,
                        'day' => (int)$itineraryDay->day,
                        // 'activities' => $activities,
                        'title' => $itineraryDay->title,
                        'details' => strip_tags($itineraryDay->activity),
                        'meals' => $meals,
                        'accommodation' => $todayHotel ? [
                            'id' => (int)$todayHotel->id,
                            'name' => $todayHotel->hotel->name,
                        ] : null,
                        'detailed_schedule' => $detailedSchedule,
                        'physical_demand' => $itineraryDay->physical_demand,
                        'travel_logistic' => $travelLogisticArray,
                    ];
                }),
                'activity_profile' => $package->packageDestination->where('destination_id', '!=', 3)->where('destination_id', '!=', 4)->where('destination_id', '!=', 17)->where('activity_id','is not', null)->map(function ($packageDestination) {
                    $destination = $packageDestination->destination;
                    $trek =
                        $destination->trek_details == ''
                            ? '[]'
                            : $destination->trek_details;
                    eval("\$trekArray = $trek;");

                    $healthSafety =
                        $destination->health_safety == ''
                            ? '[]'
                            : $destination->health_safety;
                    eval("\$healthSafetyArray = $healthSafety;");

                    $requirements =
                        $destination->requirements == ''
                            ? '[]'
                            : $destination->requirements;
                    eval("\$requirementsArray = $requirements;");

                    return [
                        'id' => (int)$destination->id,
                        'name' => $destination->activities ? strip_tags($destination->activities->name) : null,
                        'difficulty' => $destination->difficulty,
                        'trek_details' => $trekArray,
                        'health_safety' => $healthSafetyArray,
                        'requirements' => $requirementsArray,
                    ];
                })->values(),
                'destinations' => $package->packageDestination->where('destination_id', '!=', 3)->where('destination_id', '!=', 4)->where('destination_id', '!=', 17)->map(function ($packageDestination) use(&$destinationIds,&$destinationNames) {
                    $destination = $packageDestination->destination;
                    $details = $destination->destinationDetail;
                    array_push($destinationIds,$destination->id);
                    if(!in_array($destination->id,[3,4,17])){
                        array_push($destinationNames,$destination->name);
                    }
                    return [
                        'id' => (int)$destination->id,
                        'name' => strip_tags($destination->name),
                        'description' => $destination->description,
                        'image_url' => "https://javavolcano-touroperator.com/assets/img/destinations/" . $destination->gallery->image,
                        // 'galleries' => $packageDestination->destination->galleries->map(function($gallery){
                        //     return [
                        //         'id' => $gallery->id,
                        //         'image_url' => "https://javavolcano-touroperator.com/assets/img/destinations/" . $gallery->image,
                        //         'caption' => $gallery->caption,
                        //         'alt_text' => $gallery->alt_text
                        //     ];
                        // }),
                        // 'weather_by_season' => $details->weather_by_season ?? '',
                        // 'rainfall_intensity' => $details->rainfall_intensity ?? '',
                        // 'trail_details' => $details->trail_details ?? '',
                        // 'required_gear' => $details->required_gear ?? '',
                        // 'difficulty_level' => $details->difficulty_level ?? '',
                        // 'environmental_factors' => $details->environmental_factors ?? '',
                        // 'physical_requirements' => $details->physical_requirements ?? '',
                        // 'main_attractions' => $details->main_attractions ?? '',
                        // 'best_time_to_visit' => $details->best_time_to_visit ?? '',
                        // 'tips_for_visitors' => $details->tips_for_visitors ?? ''
                    ];
                })->values(),
            ]
        ];

        // Get and transform accommodation data with room configurations
        $hotels = PackageHotel::with([
            'hotel',
            'hotel.roomConfigurations' => function ($query) {
                $query->with('room');
            }
        ])
            ->where('package_id', $package->id)
            ->where('price_plan_id', 2)
            ->get();

        $result['package']['accommodation'] = $hotels->map(function ($hotel) {
            $banner = ["https://javavolcano-touroperator.com/assets/img/hotels/" . $hotel->hotel->banner];
            if($hotel->hotel->hotelImage){
                foreach($hotel->hotel->hotelImage->take(2) as $image) {
                    $banner[] = "https://javavolcano-touroperator.com/assets/img/hotels/" . $image->image;
                }
            }
            $facilities = $hotel->hotel->facilities == '' ? '[]' : $hotel->hotel->facilities;
            eval("\$facilitiesArray = $facilities;");
            return [
                'id' => (int)$hotel->hotel->id,
                // 'hotel_code' => $hotel->hotel->code,
                'day' => (int)$hotel->day,
                'hotel' => $hotel->hotel->name,
                'location' => $hotel->hotel->address,
                'short_description' => $hotel->hotel->short_description,
                'description' => $hotel->hotel->description,
                'rating' => $hotel->hotel->rating,
                'map' => $hotel->hotel->url,
                'banner' => $banner,
                'facilities' => $facilitiesArray,
                // 'room_configurations' => $hotel->hotel->roomConfigurations->map(function ($config) {
                //     return [
                //         'room_configuration_id' => (int)$config->id,
                //         'room_id' => (int)$config->room->id,
                //         'pax' => (int)$config->pax,
                //         'room_type' => $config->room->room_name,
                //         'qty' => (int)$config->qty
                //     ];
                // })
            ];
        });

        $result['package']['meal_plan'] = [
            'summary' => $mealSummary,
            'details' => $dailyMeals
        ];

        // Transform transportation and crew data
        $carConfigs = CarConfiguration::with([
            'car',
            'crewRole' => function ($query) {
                // Assuming we're using JVTO role
                $query->where('order_channel_id', 1); // Adjust the channel ID as needed
            }
        ])->whereNotNull('crew_jvto_role_id')->get();


        // Transform package prices
        $result['package']['package_price'] = $package->packagePrice->sortBy('priceCategory.start')->map(function ($price) {
            return [
                'package_price_id' => (int)$price->id,
                'start' => (int)$price->priceCategory->start,
                'end' => (int)$price->priceCategory->end == 0 ? null : (int)$price->priceCategory->end,
                'group_size' => $price->priceCategory->temp_text,
                'price_per_person' => (int)$price->price
            ];
        })->values();

        $result['package']['group_discounts'] = [
            'One FOC for every 18 participants',
            'Two FOC for 35 participants',
            'Three FOC + 5% discount for 50 or more participants',
            'These benefits apply to both students and staff'
        ];
        $result['package']['vehicle_and_crew_allocation'] = [
            [
                "group_size" => "1-3 Pax",
                "vehicle" => "MPV",
                "crew" => "Driver-cum-Guide"
            ],
            [
                "group_size" => "4-11 Pax",
                "vehicle" => "Hiace Van",
                "crew" => "Driver + Local Guides"
            ],
            [
                "group_size" => ">11 Pax",
                "vehicle" => "Additional Vehicle",
                "crew" => "Customized Crew"
            ]
        ];

        $result['package']['payment_terms'] = [
            '<b>Deposit:</b> A 20% deposit of the total tour cost is required to secure your booking',
            '<b>Final Payment Deadlines:</b><ul><li>Credit/Debit Cards: At least 5 days prior to the tour date (please allow 5-7 business days for processing).</li><li>Bank Transfers/Wise: At least 3 days prior to the tour date.</li><li>Cash: Permitted on the first day of the tour only if pre-approved during booking. Please ensure you have the exact IDR amount, as airport exchange rates are unfavorable</li></ul>',
            '<b>Last-Minute Bookings (within 14 days of departure):</b> Full payment (100%) is required at the time of booking.',
            '<b>Late Payments:</b> Failure to meet payment deadlines may result in booking cancellation without a refund'
        ];
        $includeMeals = [];
        if($mealSummary['breakfast'] != 0){
            array_push($includeMeals,$mealSummary['breakfast']."x Breakfast");
        }
        if($mealSummary['lunch'] != 0){
            array_push($includeMeals, $mealSummary['lunch']."x Lunch");
        }
        if($mealSummary['dinner'] != 0){
            array_push($includeMeals, $mealSummary['dinner']."x Dinner");
        }

        $result['package']['included'] = [
            '<b>Private Transport:</b> Air-conditioned private vehicles (MPV for 1-3 guests, Minibus for 4-11 guests) with a dedicated driver. This includes fuel, tolls, and parking fees.',
            '<b>Tour Guides:</b> Experienced English-speaking guides. For 2-3 guests, a driver-guide. For 4+ guests, a separate local guide will be provided at each main destination (Bromo, Ijen, Madakaripura).',
            '<b>Mineral Water:</b> Daily supply.',
            '<b>Complimentary Travel T-Shirt:</b> One custom travel T-shirt per participant, with customizable designs/logos.',
            '<b>Full Assistance:</b> From your arrival to your final drop-off.',
            '<b>Quality Hotel Accommodation:</b> For '.count($result['package']['accommodation']).' nights, including daily breakfast.',
            '<b>All Entrance Fees & Permits:</b> To attractions such as '.implode(', ', $destinationNames),
            '<b>Meals:</b> '.implode(', ',$includeMeals),
        ];
        
        if(in_array(1,$destinationIds)){
            array_push($result['package']['included'],'<b>Private 4WD Jeep:</b> For the Mount Bromo sunrise tour.');
        }
        $trekkingEquipment = "";
        if(in_array(2,$destinationIds)){
            $trekkingEquipment .= "Gas masks and trekking poles for the Ijen Crater hike, and headlamps for the Ijen night hike. ";
            array_push($result['package']['included'],"<b>Medical Check-up:</b> Ijen authorities require a doctor's health certificate. This check-up will be conveniently arranged at your hotel in Bondowoso the evening before your trek. You only need your passport");
        }
        if(in_array(6,$destinationIds)){
            $trekkingEquipment .= "Helmets for Madakaripura Waterfall are provided by local management.";
        }
        if($trekkingEquipment != ''){
            array_push($result['package']['included'],'<b>Trekking Equipment: '.$trekkingEquipment.'</b>');
        }
        if($package->end_destination_id == 3){
            array_push($result['package']['included'], '<b>Ferry Tickets:</b> From Ketapang Harbour to Bali (public ferry with air-conditioned cabins).');
        }
        $result['package']['exclude'] = [
            "<b>International/Domestic Air Tickets:</b> To and from your tour's starting and ending points.",
            '<b>Indonesian VISA:</b> (If applicable).',
            '<b>Travel Insurance:</b> Optional but highly recommended for peace of mind, covering trip interruptions, medical emergencies, and lost luggage.',
            '<b>Meals Not Stated in Itinerary:</b> Specific lunches and additional dinners are at your own expense.',
            "<b>Personal Expenses:</b> Such as snacks, souvenirs, beverages, laundry, etc. It is recommended to carry at least IDR 500,000 per person for these.",
            "<b>Tips:</b> For drivers and guides (at your discretion).",
        ];


        $packingListBromoIjen = "";
        $packingListWaterfall = "";
        $packingListTreks = "";
        $packingListWaterfallFootwear = "";
        if(in_array(1,$destinationIds) || in_array(2,$destinationIds)){
            $excludeActivityBromo = "";
            $excludeActivityIjen = "";
            
            $packingListBromoIjenIds = [];
            if(in_array(1,$destinationIds)){
                $excludeActivityBromo = "<li>Horse ride at Mount Bromo: (Optional) Typically IDR 150,000–350,000 per person, payable directly to local horsemen on-site.</li>";
                array_push($packingListBromoIjenIds,"Bromo");
            }
            if(in_array(2,$destinationIds)){
                $excludeActivityIjen = "<li>Ijen Ojek Trolley Service: (Optional) Available for an additional fee if assistance is needed during the trek.</li>";
                array_push($packingListBromoIjenIds,"Ijen");
            }
            $excludeActivities = "<b>Optional Activities:</b><ul>".$excludeActivityBromo.$excludeActivityIjen."</ul>";
            array_push($result['package']['exclude'],$excludeActivities);
            
            $packingListBromoIjen = "<li><b>Evenings & Treks (".implode('/',$packingListBromoIjenIds)."):</b> Warm layers are crucial as temperatures can drop below 10°C (41°F). This includes a thermal jacket, warm hat, and gloves.</li>";
        }
        if(in_array(6,$destinationIds) ||in_array(7,$destinationIds)){
            $packingListWaterfallIds = [];
            if(in_array(6,$destinationIds)){
                array_push($packingListWaterfallIds,'Madakaripura');
            }
            if(in_array(7,$destinationIds)){
                array_push($packingListWaterfallIds,'Tumpak Sewu');
            }
            $packingListWaterfallFootwear = "<li><b>Waterfalls (".implode('/',$packingListWaterfallIds)."):</b> Trekking sandals or water shoes with good grip are highly recommended for navigating slippery terrain and walking through water.</li>";
            $packingListWaterfall = "<li><b>Waterfalls (".implode('/',$packingListWaterfallIds)."):</b> Quick-dry clothes and a poncho are essential, as you will get wet.</li>";
        }
        if(in_array(1,$destinationIds) || in_array(2,$destinationIds) || in_array(6,$destinationIds) || in_array(7,$destinationIds)){
            $packingListTreksIds = [];
            if(in_array(1,$destinationIds)){
                array_push($packingListTreksIds,'Bromo');
            }
            if(in_array(2,$destinationIds)){
                array_push($packingListTreksIds,'Ijen');
            }
            if(in_array(6,$destinationIds)){
                array_push($packingListTreksIds,'Madakaripura');
            }
            if(in_array(7,$destinationIds)){
                array_push($packingListTreksIds,'Tumpak Sewu');
            }

            $packingListTreks = "<li><b>Treks (".implode('/',$packingListTreksIds)."):</b> Sturdy hiking boots with excellent grip and ankle support are indispensable.</li>";
        }
        if($package->start_destination_id == 17 || $package->end_destination_id == 17){
            array_push($result['package']['exclude'],"<b>Train Tickets:</b> (e.g., for travel to/from Yogyakarta, not applicable for this package but generally excluded).");
        }

        if(in_array(2,$destinationIds)){
            $result['package']['before_you_go']['mandatory_requirements_for_ijen_trekking'] = [
                "<b>Medical Check-up:</b>Ijen authorities require a doctor's health certificate. This check-up (costing IDR 35,000-50,000) will be conveniently arranged at your hotel in Bondowoso the evening before your trek. You only need your passport.","<b>Printed Passport Copy:</b>A clear, printed copy of your passport is essential for permit processing at the Ijen site."
            ];
        }
        $result['package']['before_you_go']['recommended_packing_list'] = [
            "<b>Clothing for Varied Climates:</b><ul><li><b>Daytime:</b> Light, breathable attire for warmer temperatures.</li>$packingListBromoIjen<li><b>Rain Gear:</b> A reliable rain jacket or poncho for unexpected weather changes.</li>$packingListWaterfall</ul>",
            "<b>Health & Safety Priorities:</b><ul><li><b>Personal Medication:</b> Any prescription or essential personal medications.</li><li><b>First Aid:</b> A basic personal first aid kit (JVTO supplements with additional supplies).</li><li><b>Sun Protection:</b> High SPF sunscreen, a wide-brimmed hat, and sunglasses.</li><li><b>Insect Repellent:</b> To guard against mosquitoes and other insects.</li></ul>",
            "<b>Photography Gear:</b> Camera with spare batteries and memory cards. A protective cover for your camera against sulfur gases at Ijen. Drones are allowed, provided safety guidelines are adhered to.",
            "<b>Personal Expenses:</b> We recommend carrying at least IDR 500,000 per person."
        ];
        if(in_array(6,$destinationIds) ||in_array(7,$destinationIds)){
            array_push($result['package']['before_you_go']['recommended_packing_list'],"<b>Footwear Essentials:</b><ul>$packingListTreks"."$packingListWaterfallFootwear</ul>");
        }
        if(in_array(1,$destinationIds) ||in_array(2,$destinationIds)){
            array_push($result['package']['before_you_go']['recommended_packing_list'],"<b>Essential Gear:</b><ul>".(in_array(2,$destinationIds) ? "<li><b>Illumination:</b> A flashlight or headlamp (provided by JVTO for Ijen night hikes).</li>" : "").(in_array(1,$destinationIds) || in_array(2,$destinationIds) ? "<li><b>Protection:</b> ".(in_array(2,$destinationIds) ? "Gas masks for sulfur fumes at Ijen (provided by JVTO, personal ones are advisable)." : "").(in_array(1,$destinationIds) ? "A dust mask is useful for the \"Sea of Sand\" at Bromo. Waterproof bags/dry sacks for electronics, especially at waterfalls." : "")."</li>" : "" )."</ul>");
        }
        $result['package']['before_you_go']['general_travel_tips'] = [
            "<b>Currency Exchange:</b> We strongly advise against using airport money changers due to poor exchange rates. Ensure you have access to reliable IDR cash sources (ATMs or local money changers outside the airport).",
        ];
        if(in_array(2,$destinationIds)){
            array_push($result['package']['before_you_go']['general_travel_tips'],"<b>Jewelry:</b> It is advised to avoid wearing jewelry at Ijen to prevent tarnishing due to sulfur.");
        }
        if(in_array(1,$destinationIds)){
            array_push($result['package']['before_you_go']['general_travel_tips'],"<b>Luggage Handling:</b> During activities like the Bromo jeep ride, large bags can be safely left at your hotel; only essentials are needed.");
        }
        $result['package']['before_you_go']['safety_and_support'] = [
            "<b>JVTO Safety Record:</b> JVTO maintains a 100% safety record and takes great care of all guests.",
            "<b>Emergency Contact Information:</b> For any questions or immediate assistance during your trip, contact the dedicated JVTO Support Team via WhatsApp at +62822-4478-8833 or email at javavolcanotouroperator@gmail.com.",
            "<b>Travel Insurance:</b> Optional but recommended. JVTO can provide an official letter regarding non-refundable terms for insurance claims."
        ];
        $result['package']['before_you_go']['travel_insurance'] = [
            "Optional but recommended. JVTO can provide an official letter regarding non-refundable terms for insurance claims."
        ];
        $result['package']['terms_and_conditions']['confirmation'] = [
            "You'll get confirmation within minutes. If you don't see any confirmation, reach out to our customer support.",
        ];
        $result['package']['terms_and_conditions']['cancellation_policy'] = [
            "<ul><li><b>Within 48 hours of tour start or No-Shows:</b> No refund will be issued for cancellations.</li><li><b>Late Payments:</b> Failure to meet payment deadlines may result in booking cancellation without refund.</li><li><b>Injury during tour:</b> If an incident (e.g., injury) occurs during the tour, JVTO will provide immediate assistance (e.g., transport to a hospital). However, full refunds are typically not provided as tour services (transport, crew, logistics) will have already commenced or been mobilized.</li></ul>",
        ];
        $result['package']['terms_and_conditions']['rescheduling_policy'] = [
            "<ul><li><b>More than 48 hours prior to tour:</b> Rescheduling incurs no charge.</li><li><b>Within 48 hours of tour start:</b> Rescheduling is possible and will not incur a charge, subject to availability and potential itinerary adjustments.</li></ul>",
        ];
        $result['package']['terms_and_conditions']['skipped_attractions'] = [
            "<b>Skipped Attractions:</b><ul><li>Refunds are generally not provided for skipped attractions once the tour has commenced or tickets have been booked, as all services are integrated into the package price.</li></ul>",
        ];
        $result['package']['terms_and_conditions']['unforeseen_circumstances'] = [
            "<ul><li>JVTO monitors weather conditions and adjusts itineraries for safety (e.g., during the rainy season or foggy mornings).</li><li>In cases of flight cancellations or other unforeseen circumstances, JVTO can provide an official letter stating the non-refundable terms for insurance claims.</li></ul>"];
        $result['package']['terms_and_conditions']['full_terms'] = [
            "For a comprehensive understanding of all booking terms, conditions, and policies, please refer to our official website: https://javavolcano-touroperator.com/terms-and-condition."
        ];
        $result['package']['faq'] = [
            [
                'question' => 'What kind of tours do you offer?',
                'answer' => 'All tour packages are private and structured as all-inclusive packages. We provide personalized experiences with dedicated guides and transportation.'
            ],
            [
                'question' => 'Can I customize my tour?',
                'answer' => 'Yes, minor adjustments and "micro-tweaks" to the itinerary are allowed. However, major detours from the planned route are discouraged to ensure the best experience and safety.'
            ],
            [
                'question' => 'How do I confirm my booking?',
                'answer' => 'A deposit of 20% is required to confirm your booking. The remaining balance must be paid 3 days before the tour begins. If you book less than 24 hours in advance, 100% upfront payment is required.'
            ],
            [
                'question' => 'What payment methods are accepted?',
                'answer' => 'Payment can be made via cash, bank transfer, or other Wise-approved channels. We accept major credit cards, bank transfers, and cash (pre-approved).'
            ],
            [
                'question' => 'What happens if the weather is bad?',
                'answer' => 'JVTO continuously monitors weather conditions. For safety reasons, we may adjust itineraries during extreme weather (heavy rain, thick fog). Tours typically continue in light rain. If major attractions are completely inaccessible due to weather, we\'ll provide alternative activities when possible.'
            ],
            [
                'question' => 'Is this tour suitable for children or elderly people?',
                'answer' => 'This tour requires good physical fitness due to early starts, hiking, and potentially challenging conditions. Children under 12 and elderly individuals with mobility issues should carefully consider their abilities. The Ijen trek is not suitable for those with respiratory conditions due to sulfur exposure.'
            ],
            [
                'question' => 'Do you cater to dietary restrictions?',
                'answer' => 'Yes, we can accommodate most dietary requirements including vegetarian, vegan, halal, and basic food allergies. Please inform us of any dietary restrictions during booking so we can arrange appropriate meals. Some remote locations may have limited options.'
            ],
            [
                'question' => 'What about transportation and group size?',
                'answer' => 'Transportation is by private air-conditioned vehicle (MPV for 1-3 guests, Toyota Hiace Van for 4-11 guests) with professional driver. For Bromo, we use private 4WD jeeps. Group sizes are typically small (2-11 people) for personalized service and safety.'
            ],
            [
                'question' => 'What languages do the guides speak?',
                'answer' => 'All our guides are experienced and speak English fluently. For groups of 2-3 guests, you\'ll have a driver-guide. For 4+ guests, we provide separate local guides at each main destination for more detailed explanations and cultural insights.'
            ],
            [
                'question' => 'What benefits are there for large groups?',
                'answer' => '<strong>Group Benefits:</strong> 18+ pax: 1 person travels free of charge (FOC). 35+ pax: 2 people travel FOC. 50+ pax: 3 people travel FOC, plus a 5% discount on the total price.'
            ],
            [
                'question' => 'What is your safety record?',
                'answer' => 'The company has a 100% safety record. The team consists of dedicated and respectful local crew who provide extra care for children. Immediate assistance is provided in case of medical issues. A nurse visit can be arranged to obtain the Ijen health certificate for a fee of IDR 30,000-50,000.'
            ]
        ];        
        return $result;
        });
        return $package;

    }


    function jsonSource(){
        // return $this->packageDetailJson();
        $customer = Booking::with(['bookingDetail','user.country'])->where('status', 'booked')->where('agent_id',2)->where('travel_date_start','like','%'.date('Y-m').'%')->orderBy('travel_date_start','asc')->get()->map(function ($booking) {
            $tshirtSizes = [];
            if ($booking->bookingDetail[0]->xss != 0) {
                array_push($tshirtSizes, "XSS x " . $booking->bookingDetail[0]->xss);
            }
            if ($booking->bookingDetail[0]->xxs != 0) {
                array_push($tshirtSizes, "XXS x " . $booking->bookingDetail[0]->xxs);
            }
            if ($booking->bookingDetail[0]->xs != 0) {
                array_push($tshirtSizes, "XS x " . $booking->bookingDetail[0]->xs);
            }
            if ($booking->bookingDetail[0]->s != 0) {
                array_push($tshirtSizes, "S x " . $booking->bookingDetail[0]->s);
            }
            if ($booking->bookingDetail[0]->m != 0) {
                array_push($tshirtSizes, "M x " . $booking->bookingDetail[0]->m);
            }
            if ($booking->bookingDetail[0]->l != 0) {
                array_push($tshirtSizes, "L x " . $booking->bookingDetail[0]->l);
            }
            if ($booking->bookingDetail[0]->xl != 0) {
                array_push($tshirtSizes, "XL x " . $booking->bookingDetail[0]->xl);
            }
            if ($booking->bookingDetail[0]->xxl != 0) {
                array_push($tshirtSizes, "XXL x " . $booking->bookingDetail[0]->xxl);
            }
            if ($booking->bookingDetail[0]->xxxl != 0) {
                array_push($tshirtSizes, "XXXL x " . $booking->bookingDetail[0]->xxxl);
            }
            $tshirtSize = implode(', ', $tshirtSizes);

            return [
                "customer_id" => $booking->user->id,
                "name" => $booking->user->name,
                "email" => $booking->user->email,
                "phone" => $booking->user->phone,
                "country" => $booking->user->country ? $booking->user->country->long_name : null,
                "t_shirt_size" => $tshirtSize,
                "dietary_restrictions" => $booking->special_requirements,
                "trip_media_url" => $booking->media_link
            ];
        });

        $crewMember = GuideDriver::orderBy('name','asc')->get()->map(function ($crew) {
            $recapEscort = BookGuideDriver::where('guide_id', $crew->id)->where('guide_ijen', '0')->where('start_date', 'like', date('Y-m')."%")->count();
            $recapIjen = BookGuideDriver::where('guide_id', $crew->id)->where('guide_ijen', '0')->where('start_date', 'like', date('Y-m')."%")->count();

            return [
                "crew_member_id" => $crew->id,
                "name" => $crew->name,
                "phone" => $crew->phone,
                "type" => $crew->is_driver ? "Driver" : "Guide",
                "photo_url" => $crew->photo ? 'https://javavolcano-touroperator.com/assets/img/guide/' . $crew->photo : 'https://javavolcano-touroperator.com/assets/img/guide/default.jpg',
                "tags" => $crew->tags,
                "monthly_escorts_recap" => $recapEscort,
                "monthly_ijen_escorts_recap" => $recapIjen
            ];
        });

        $hotels = Hotel::with(['roomConfigurations','roomHotel'])->whereIn('id',[34,11,33,6])->get()->map(function ($hotel) {
            $groupedByPax = $hotel->roomConfigurations->groupBy('pax');
            $facilities = $hotel->facilities == '' ? '[]' : $hotel->facilities;
            eval("\$facilitiesArray = $facilities;");
            return [
                "hotel_id" => $hotel->id,
                "name" => $hotel->name,
                "location" => $hotel->address,
                'facilities' => $facilitiesArray,
                "url" => $hotel->map_url,
                "banner_image_url" => "https://javavolcano-touroperator.com/assets/img/hotels/".$hotel->banner,
                "room_types" => $hotel->roomHotel->map(function ($room) {
                    return [
                        'room_type_id' => "ROOM-".str_replace(" ","-",strtoupper($room->room_name)),
                        'name' => $room->room_name,
                        'price' => $room->rate,
                    ];
                }),
                'lodging_rules' => $groupedByPax->map(function ($configs, $pax) {
                    return [
                        'pax' => (int)$pax,
                        'configuration' => $configs->pluck('room.room_name')->unique()->values()->toArray()
                    ];
                })->values()->toArray()
            ];
        });

        $vehicles = Car::whereIn('id', [1, 2, 5, 21, 24, 25])->get()->map(function ($car) {
            return [
                'vehicle_type_id' => $car->id,
                'name' => $car->name,
                'rate' => $car->price,
                'capacity' => $car->start_pax." ".($car->end_pax == 0 ? 'Pax Above' : ($car->start_pax == $car->end_pax ? "Pax" : " - ".$car->end_pax." Pax")),
            ];
        });

        $crewRoles = CrewRole::where('order_channel_id', 1)->get()->map(function ($role) {
            return [
                'crew_role_id' => $role->id,
                'name' => $role->role,
                'rate' => $role->rate,
            ];
        });

        $destinations = Destination::with(['gallery','destinationDetail','activity' => function($query){
                $query->where('is_default_jvto','1');
            }])->whereIn('id', [1, 2, 7, 6, 9])->get()->map(function ($destination) {
            return [
                "destination_id" => $destination->id,
                "name" => $destination->name,
                "thumbnail_url" => "https://javavolcano-touroperator.com/assets/img/destinations/" . $destination->gallery->image,
                "description" => $destination->description,
                "weather_by_season" => $destination->destinationDetail->weather_by_season,
                "rainfall_intensity" => $destination->destinationDetail->rainfall_intensity,
                "trail_details" => $destination->destinationDetail->trail_details,
                "required_gear" => $destination->destinationDetail->required_gear,
                "difficulty_level" => $destination->destinationDetail->difficulty_level,
                "environmental_factors" => $destination->destinationDetail->environmental_factors,
                "physical_requirements" => $destination->destinationDetail->physical_requirements,
                "main_attractions" => $destination->destinationDetail->main_attractions,
                "best_time_to_visit" => $destination->destinationDetail->best_time_to_visit,
                "tips_for_visitors" => $destination->destinationDetail->tips_for_visitors,
                "activities" => $destination->activity->map(function ($activity) {
                    return [
                        'activity_id' => "ACT-".str_replace(" ","-",strtoupper($activity->name)),
                        'name' => $activity->name,
                        'unit' => $activity->unit,
                        'price' => (int)$activity->price,
                    ];
                })
            ];
        });

            return $customer;
            // return $crewMember;
            // return $hotels;
            // return $vehicles;
            // return $crewRoles;
            // return $destinations;
    }

    function details($id)
    {
        $booking = Booking::with(['user.country', 'bookingDetail.package.itinerary' => function ($query) {
            $query->with(['itineraryDetail' => function ($q) {
                $q->orderBy('no', 'asc')->with('activity.activityCategory');
            }]);
        }, 'bookingPayment', 'participant'])->where('id', $id)->first();
        $itinerary = BookingItinerary::with('activityStart.destination.activityDestination')
            ->where('booking_id', $id)
            ->get()
            ->map(function ($query) use ($booking) {
                $night = $query->day - 1;
                $todayYMD = date('Y-m-d', strtotime($booking->travel_date_start . " +$night days"));
                $today = date('d F Y', strtotime($booking->travel_date_start . " +$night days"));
                $activity = $query->activityStart && $query->activityStart->destination ? ($query->activityStart->destination->activityDestination ? $query->activityStart->destination->activityDestination->name : $query->activityStart->destination->name) : null;

                if (!$activity) {
                    $activities = [
                        'day' => $query->day,
                        'date' => $today,
                        'itinerary' => $query->itinerary,
                        'activity' => $activity,
                        'activity_start_id' => $query->activity_start_id,
                        'activity_end_id' => $query->activity_end_id,
                        'other_booking' => []
                    ];
                    return $activities;
                }

                // Query pertama: mendapatkan booking_itinerary
                $otherBookings = BookingItinerary::select('id', 'booking_id', 'day')
                    ->with([
                        'booking' => function ($q) {
                            $q->select('id', 'user_id', 'total_pax')
                                ->with(['user' => function ($qq) {
                                    $qq->select('id', 'name');
                                }]);
                        }
                    ])
                    ->where('activity_start_id', $query->activity_start_id)
                    ->where('booking_id', '!=', $query->booking_id)
                    ->whereHas('booking', function ($q) use ($todayYMD) {
                        $q->whereRaw("DATE_ADD(travel_date_start, INTERVAL (booking_itineraries.day - 1) DAY) = ?", [$todayYMD]);
                    })
                    ->get();

                // Query kedua: mendapatkan book_hotel untuk setiap booking_itinerary
                foreach ($otherBookings as $booking) {
                    if ($booking->booking) {
                        $hotels = BookHotel::select('id', 'booking_id', 'hotel_id')
                            ->where('booking_id', $booking->booking_id)
                            ->with([
                                'hotel' => function ($q) {
                                    $q->select('id', 'name');
                                }
                            ])
                            ->whereHas('bookingItinerary', function ($q) use ($booking) {
                                $q->where('day', $booking->day - 1);
                            })
                            ->get();

                        $booking->booking->book_hotel = $hotels;
                    }
                }


                return [
                    'day' => $query->day,
                    'date' => $today,
                    'itinerary' => $query->itinerary,
                    'activity' => $activity,
                    'activity_start_id' => $query->activity_start_id,
                    'activity_end_id' => $query->activity_end_id,
                    'other_booking' => $otherBookings
                ];
            });
        // return $itinerary;
        $bookHotel = BookHotel::with(['bookingItinerary', 'hotel', 'bookRoom.roomHotel'])->where('booking_id', $id)->get()->map(function ($query) use ($booking) {
            $night = $query->bookingItinerary->day - 1;
            return [
                'day' => $query->bookingItinerary->day,
                'hotel_id' => $query->hotel->id,
                'hotel' => $query->hotel->name,
                'check_in' => date('d F Y', strtotime($booking->travel_date_start . " +$night days")),
                'rooms' => $query->bookRoom->map(function ($q) {
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
        $car = BookCar::with('car')->where('booking_id', $id)->get()->map(function ($query) use (&$cars) {
            array_push($cars, $query->car->name);
            return $query;
        });

        $driver = BookGuideDriver::with('person')->where('booking_id', $id)->where('type', 'driver')->get()->map(function ($query) use (&$drivers) {
            array_push($drivers, $query->person->name);
            return $query;
        });

        $escort = BookGuideDriver::with('person')->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '0')->get()->map(function ($query) use (&$escorts) {
            array_push($escorts, $query->person->name);
            return $query;
        });

        $ijen = BookGuideDriver::with('person')->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '1')->get()->map(function ($query) use (&$ijens) {
            array_push($ijens, $query->person->name);
            return $query;
        });

        if ($booking->agent_id == 1) {
            $channel = 'TWT';
        } else if ($booking->agent_id == 2 && $booking->booking_category_id != 3) {
            $channel = 'JVTO';
        } else if ($booking->agent_id == 2 && $booking->booking_category_id == 3) {
            $channel = 'KLOOK';
        }

        $invoiceLinks = [];
        if ($channel == 'JVTO') {
            array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/" . $booking->id);
            if ($booking->book_add_on_total != 0) {
                array_push($invoiceLinks, "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/" . $booking->id . "?addon=true");
            }
        } else {
            $attachmentType = $channel == 'TWT' ? 6 : 7;
            $bookingDocument = BookingDocument::where('booking_id', $booking->id)->where('attachment_type_id', $attachmentType)->first();
            if ($bookingDocument) {
                $invoiceLinks = [
                    '/preview-file?title=Invoice ' . $booking->user->name . '&url=https://new-backoffice.javavolcano-touroperator.com/assets/customer-document/' . $bookingDocument->file,
                ];
            }
        }

        $tshirt = [];
        if ($booking->bookingDetail[0]->xss) {
            array_push($tshirt, "XSS: " . $booking->bookingDetail[0]->xss);
        }
        if ($booking->bookingDetail[0]->xxs) {
            array_push($tshirt, "XXS: " . $booking->bookingDetail[0]->xxs);
        }
        if ($booking->bookingDetail[0]->xs) {
            array_push($tshirt, "XS: " . $booking->bookingDetail[0]->xs);
        }
        if ($booking->bookingDetail[0]->s) {
            array_push($tshirt, "S: " . $booking->bookingDetail[0]->s);
        }
        if ($booking->bookingDetail[0]->m) {
            array_push($tshirt, "M: " . $booking->bookingDetail[0]->m);
        }
        if ($booking->bookingDetail[0]->l) {
            array_push($tshirt, "L: " . $booking->bookingDetail[0]->l);
        }
        if ($booking->bookingDetail[0]->xl) {
            array_push($tshirt, "XL: " . $booking->bookingDetail[0]->xl);
        }
        if ($booking->bookingDetail[0]->xxl) {
            array_push($tshirt, "XXL: " . $booking->bookingDetail[0]->xxl);
        }
        if ($booking->bookingDetail[0]->xxxl) {
            array_push($tshirt, "XXXL: " . $booking->bookingDetail[0]->xxxl);
        }
        $tshirts = implode(", ", $tshirt);

        $package_information = [];
        if ($channel != 'TWT' && $booking->bookingDetail[0]->package) {
            $package_information = $booking->bookingDetail[0]->package->itinerary->map(function ($query, $index) use ($booking) {
                // Get total days to identify first and last day
                $totalDays = $booking->bookingDetail[0]->package->itinerary->count();

                // Get the details for the current day
                $details = $query->itineraryDetail->map(function ($q) {
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
                if ($query->day == 1) {
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
                if ($query->day == $totalDays) {
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
        $cekAddOnPaid = BookingPayment::where('booking_id', $id)->where('is_add_on', '1')->count();

        if ($booking->balance == 0) {
            $lastPayment = BookingPayment::where('booking_id', $booking->id)
                ->orderBy('id', 'asc')  // Or use created_at if that's more appropriate
                ->first();

            $count = BookingPayment::where('booking_id', $booking->id)->count();

            if ($count == 1) {
                $dp = BookingPayment::where('booking_id', $booking->id)->sum('nominal');
            } else {
                // Then sum all payments except the one with that ID
                $dp = BookingPayment::where('booking_id', $booking->id)
                    ->when($lastPayment, function ($query) use ($lastPayment) {
                        return $query->where('id', '!=', $lastPayment->id);
                    })
                    ->sum('nominal');
            }
        } else {
            $dp = $booking->balance;
        }
        $profit = $dp - $booking->expense_internal_total;


        $details = [
            'payment_method' => PaymentMethod::get()->map(function ($data) {
                return [
                    'value' => $data->id,
                    'label' => $data->name,
                ];
            }),
            'client_information' => [
                'client_id' => $booking->user->id,
                'client_name' => $booking->user->name,
                'contact_number' => $booking->user->phone,
                'email_address' => $booking->user->email,
                'nationality' => $booking->user->country ? $booking->user->country->long_name : '-',
                'media_link' => $booking->media_link,
                'portal' => $channel != 'TWT' ? 'https://javavolcano-touroperator.com/bookings/details/' . $booking->url : null,
                'participants' => $booking->participant
            ],
            'booking_information' => [
                'id' => $booking->id,
                'booking_id' => $channel . "-" . $booking->id,
                'booking_reference_id' => $channel == 'JVTO' ? $booking->booking_code : $booking->invoice_code_origin,
                'order_channel' => $channel,
                'package_id' => $channel != 'TWT' && $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package_id : '-',
                'tour_package' => $channel != 'TWT' && $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->package_code . " | " . $booking->bookingDetail[0]->package->name : '-',
                'number_of_participants' => $booking->total_pax,
                'travel_date' => date('d F Y', strtotime($booking->travel_date_start)),
                'booking_date' => date('d F Y', strtotime($booking->booking_date)),
                'tshirt' => $tshirts,
                'pickup' => [
                    'location' => $booking->meeting_point ? $booking->meeting_point : '-',
                    'arrival' => $booking->meeting_point_arrival ? $booking->meeting_point_arrival : '-',
                    'location_value' => $booking->meeting_point_value ? $booking->meeting_point_value : '-',
                    'time' => $booking->pickup_time ? date('H:i', strtotime($booking->pickup_time)) : '-',
                ],
                'drop' => [
                    'location' => $booking->drop_point ? $booking->drop_point : '-',
                    'arrival' => $booking->drop_point_arrival ? $booking->drop_point_arrival : '-',
                    'location_value' => $booking->drop_point_value ? $booking->drop_point_value : '-',
                    'time' => $booking->drop_time ? date('H:i', strtotime($booking->drop_time)) : '-',
                ],
                'special_requirements' => $booking->special_requirements,
                'notes' => $booking->note,
                'url' => $booking->url,
                'is_buy_isic'  => $booking->is_buy_isic,
                'is_buy_isic_complete_form'  => $booking->is_buy_isic_complete_form,
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
                'outstanding_payment_link' => $booking->outstanding_payment_link,
                'add_on_only' => $cekAddOnPaid == 0 ? $booking->book_add_on_total : 0,
                'paymentMethod' =>  $booking->outstanding_payment_method ? strtoupper($booking->outstanding_payment_method) : $booking->outstanding_payment_method,
                'invoice' => [
                    'total' => $booking->grand_total + $booking->book_add_on_total,
                    'invoiceLink' => $invoiceLinks,
                ],
                'expense' => [
                    'total' => $booking->expense_internal_total,
                    'crew_expense' => $booking->total_expense_crew,
                    'debt_expense' => $booking->total_expense_debt,
                    'expenseLink' => $booking->expense_file_internal ? $booking->expense_file_internal : '/finance/expense-manager/' . $booking->id . '/edit',
                    'target' => '_blank'
                ],
                'profit' =>  $profit,
                'payment_history' => $booking->bookingPayment->map(function ($payment) use ($booking) {
                    return [
                        'id' => $payment->id,
                        'nominal' => $payment->nominal,
                        'paymentMethod' => $payment->paymentMethod->name,
                        'description' => $payment->description,
                        'reference' => $payment->reference,
                        'receipt' => "https://javavolcano-touroperator.com/backoffice/invoice/view-receipt/" . $booking->id . "/partial/" . $payment->id,
                        'date' => date('d M y H:i', strtotime($payment->created_at)),
                    ];
                }),

            ],
        ];
        // return $details;
        return Inertia::render('Schedule/Details', ['initialData' => $details]);
    }

    function bookingList(Request $request)
    {
        return Inertia::render('Schedule/BookingList');
    }

    function bookingAnalist(Request $request)
    {

        $data['filter'] = [
            'month' => $request->month ? $request->month : date('m'),
            'year' => $request->year ? $request->year : date('Y'),
            'channel' => $request->channel ? $request->channel : 'all',
            'hotel' => $request->hotel ? $request->hotel : '',
            'activity' => $request->activity ? $request->activity : '',
            'activeTab' => $request->activeTab ? $request->activeTab : 'all-reports',
        ];

        $data['destination'] = Destination::whereRaw('id in(1,2,7)')->get(['id', 'name']);
        $data['hotel'] = Hotel::whereRaw('id in(1,10,11,34)')->get(['id', 'name']);
        $last_month_year = date('Y-m', strtotime($data['filter']['year'] . "-" . $data['filter']['month'] . "-01 -1 month"));

        $data['total_booking_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id', 2)->where('booking_category_id', 3);
            }
        }
        $data['total_booking_current_month'] = $data['total_booking_current_month']->count();

        $data['total_booking_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id', 2)->where('booking_category_id', 3);
            }
        }
        $data['total_booking_last_month'] = $data['total_booking_last_month']->count();


        if ($data['total_booking_last_month'] > 0) {
            $data['total_booking_percentage_change'] = round(($data['total_booking_current_month'] - $data['total_booking_last_month']) / $data['total_booking_last_month'] * 100);
        } else {
            $data['total_booking_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if ($data['total_booking_percentage_change'] == 0) {
            $data['total_booking_percentage_change'] = "";
            $data['total_booking_percentage_change_trend'] = "same";
        } else if ($data['total_booking_percentage_change'] < 0) {
            $data['total_booking_percentage_change'] = $data['total_booking_percentage_change'] . "%";
            $data['total_booking_percentage_change_trend'] = "down";
        } else {
            $data['total_booking_percentage_change'] = "+" . $data['total_booking_percentage_change'] . "%";
            $data['total_booking_percentage_change_trend'] = "up";
        }

        $data['total_invoice_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
            ->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id', 2)->where('booking_category_id', 3);
            }
        }
        $data['total_invoice_current_month'] = $data['total_invoice_current_month']->sum('grand_total');

        $data['total_expense_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
            ->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id', 2)->where('booking_category_id', 3);
            }
        }
        $data['total_expense_current_month'] = $data['total_expense_current_month']->sum('expense_internal_total');

        $data['total_invoice_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
            ->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id', 2)->where('booking_category_id', 3);
            }
        }
        $data['total_invoice_last_month'] = $data['total_invoice_last_month']->sum('grand_total');

        $data['total_expense_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
            ->where('status', 'booked');
        if ($data['filter']['channel'] != 'all') {
            if ($data['filter']['channel'] == 'twt') {
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id', 1);
            } else if ($data['filter']['channel'] == 'jvto') {
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else {
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id', 2)->where('booking_category_id', 3);
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

        if ($data['total_invoice_percentage_change'] == 0) {
            $data['total_invoice_percentage_change'] = "";
            $data['total_invoice_percentage_change_trend'] = "same";
        } else if ($data['total_invoice_percentage_change'] < 0) {
            $data['total_invoice_percentage_change'] = $data['total_invoice_percentage_change'] . "%";
            $data['total_invoice_percentage_change_trend'] = "down";
        } else {
            $data['total_invoice_percentage_change'] = "+" . $data['total_invoice_percentage_change'] . "%";
            $data['total_invoice_percentage_change_trend'] = "up";
        }
        $data['total_invoice_current_month'] = "IDR " . number_format($data['total_invoice_current_month'], 0, ',', '.');

        if ($data['total_profit_last_month'] > 0) {
            $data['total_profit_percentage_change'] = round(($data['total_profit_current_month'] - $data['total_profit_last_month']) / $data['total_profit_last_month'] * 100);
        } else {
            $data['total_profit_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if ($data['total_profit_percentage_change'] == 0) {
            $data['total_profit_percentage_change'] = "";
            $data['total_profit_percentage_change_trend'] = "same";
        } else if ($data['total_profit_percentage_change'] < 0) {
            $data['total_profit_percentage_change'] = $data['total_profit_percentage_change'] . "%";
            $data['total_profit_percentage_change_trend'] = "down";
        } else {
            $data['total_profit_percentage_change'] = "+" . $data['total_profit_percentage_change'] . "%";
            $data['total_profit_percentage_change_trend'] = "up";
        }
        $data['total_profit_current_month'] = "IDR " . number_format($data['total_profit_current_month'], 0, ',', '.');

        $year = $data['filter']['year'];
        $month = $data['filter']['month'];
        $data['report']['data_hotel'] = [];
        $data['report']['data_hotel']['book_hotel'] = [];
        $data['report']['data_tshirt'] = [];
        $data['report']['data_activity'] = [];

        if ($request->activeTab == 'accommodations') {
            $getBookHotel = BookHotel::with([
                'bookRoom.roomHotel',
                'booking.user',
                'bookingItinerary',
            ])
                ->where('hotel_id', $data['filter']['hotel'])
                ->whereHas('booking', function ($query) use ($year, $month) {
                    $query->where('travel_date_start', 'like', "%$year-$month%");
                });
            if ($data['filter']['channel'] != 'all') {
                if ($data['filter']['channel'] == 'twt') {
                    $getBookHotel->whereHas('booking', function ($query) {
                        $query->where('agent_id', 1);
                    });
                } else if ($data['filter']['channel'] == 'jvto') {
                    $getBookHotel->whereHas('booking', function ($query) {
                        $query->where('agent_id', 2)->where('booking_category_id', '!=', 3);
                    });
                } else {
                    $getBookHotel->whereHas('booking', function ($query) {
                        $query->where('agent_id', 2)->where('booking_category_id', 3);
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
            } elseif ($request->activity == '2') {
                $data['report']['data_activity']['data_ijen'] = $this->getIjenData($year, $month, $data['filter']['channel']);
            } elseif ($request->activity == '7') {
                $data['report']['data_activity']['data_tumpak_sewu'] = $this->getTumpakSewuData($year, $month, $data['filter']['channel']);
            }
        }

        if ($request->activeTab == 't-shirts') {
            $data['report']['data_tshirt'] = $this->getTshirt($year, $month, $data['filter']['channel']);
        }

        // return $data['report']['data_tshirt'];

        return Inertia::render('Schedule/BookingAnalist', ['data' => $data, 'total' => 1000]);
    }

    function getTshirt($year, $month, $channel)
    {

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
            } elseif ($channel == 'jvto') {
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $get_tshirt->get();
    }

    function getBromoData($year, $month, $channel)
    {
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

    function updateBookingNote(Request $request)
    {
        $booking = Booking::find($request->booking_id);
        $booking->note = $request->note;
        $booking->note_category_id = $request->category_id;
        $booking->save();

        return back()->with('message', 'Note updated successfully');
    }
    // Fungsi getDataPlotting dengan parameter array
    function getDataPlotting($params)
    {
        $bookingId = $params['id'];
        $orderChannel = $params['order_channel'] != 'all' ? $params['order_channel'] : '';
        $booking = Booking::findOrFail($bookingId);
        $start_date = $booking->travel_date_start;
        $end_date = $booking->is_shuttle == '1'
            ? Carbon::parse($booking->travel_date_end)->subDay()->toDateString()
            : $booking->travel_date_end;
        $at_ijen = $booking->at_bondowoso;

        // Subquery to check availability and get booking info for other bookings
        $availabilitySubquery = BookGuideDriver::select('guide_id', 'book_guide_drivers.booking_id', 'users.name as user_name', 'book_guide_drivers.start_date', 'book_guide_drivers.end_date')
            ->join('bookings', 'book_guide_drivers.booking_id', '=', 'bookings.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->where('book_guide_drivers.booking_id', '!=', $bookingId)
            ->where(function ($query) use ($start_date, $end_date) {
                $query->whereBetween('book_guide_drivers.start_date', [$start_date, $end_date])
                    ->orWhereBetween('book_guide_drivers.end_date', [$start_date, $end_date])
                    ->orWhere(function ($q) use ($start_date, $end_date) {
                        $q->where('book_guide_drivers.start_date', '<=', $start_date)
                            ->where('book_guide_drivers.end_date', '>=', $end_date);
                    });
            })
            ->whereColumn('book_guide_drivers.guide_id', 'guide_drivers.id')
            ->orderBy('book_guide_drivers.start_date')
            ->limit(1);

        // Subquery to check if guide/driver is plotted for current booking
        $currentBookingSubquery = BookGuideDriver::select('guide_id', 'guide_ijen')
            ->where('booking_id', $bookingId)
            ->whereColumn('guide_id', 'guide_drivers.id');

        // Query for drivers
        $data['driver'] = GuideDriver::select('id', 'name', 'garage_id', 'tags', 'new_role')
            ->selectSub($availabilitySubquery->select('booking_id'), 'conflicting_booking_id')
            ->selectSub($availabilitySubquery->select('users.name'), 'conflicting_user_name')
            ->selectSub($availabilitySubquery->select('start_date'), 'conflicting_start_date')
            ->selectSub($availabilitySubquery->select('end_date'), 'conflicting_end_date')
            ->selectRaw('CASE
                WHEN EXISTS (' . $currentBookingSubquery->toSql() . ') THEN "Terplotting"
                WHEN EXISTS (' . $availabilitySubquery->toSql() . ') THEN "Tidak Tersedia"
                ELSE "Tersedia"
            END as status')
            ->mergeBindings($currentBookingSubquery->getQuery())
            ->mergeBindings($availabilitySubquery->getQuery())
            ->where('is_driver', '1')
            ->where('tags', 'like', "%$orderChannel%")
            ->get()
            ->map(function ($driver) use ($bookingId) {
                if ($driver->status == 'Terplotting') {
                    $driver->schedule_info = "Terplotting untuk Booking ID: {$bookingId}";
                } elseif ($driver->status == 'Tidak Tersedia' && $driver->conflicting_booking_id) {
                    $driver->schedule_info = "({$driver->conflicting_start_date} - {$driver->conflicting_end_date}) " .
                        "Customer: {$driver->conflicting_user_name}";
                }
                unset($driver->conflicting_booking_id, $driver->conflicting_user_name, $driver->conflicting_start_date, $driver->conflicting_end_date);
                return $driver;
            });

        // Query untuk guide (sama seperti sebelumnya)
        $data['guide'] = GuideDriver::select('id', 'name', 'tags', 'new_role')
            ->selectSub($availabilitySubquery->select('booking_id'), 'conflicting_booking_id')
            ->selectSub($availabilitySubquery->select('users.name'), 'conflicting_user_name')
            ->selectSub($availabilitySubquery->select('start_date'), 'conflicting_start_date')
            ->selectSub($availabilitySubquery->select('end_date'), 'conflicting_end_date')
            ->selectSub($availabilitySubquery->select('guide_ijen'), 'guide_ijen')
            ->selectSub(
                BookGuideDriver::select('guide_ijen')
                    ->where('booking_id', $bookingId)
                    ->whereColumn('guide_id', 'guide_drivers.id')
                    ->limit(1),
                'current_guide_ijen'
            )
            ->selectRaw('CASE
                WHEN EXISTS (
                    SELECT 1 FROM book_guide_drivers
                    WHERE booking_id = ? AND guide_id = guide_drivers.id
                ) THEN "Terplotting"
                WHEN EXISTS (' . $availabilitySubquery->toSql() . ') THEN "Tidak Tersedia"
                ELSE "Tersedia"
            END as status', [$bookingId])
            ->mergeBindings($availabilitySubquery->getQuery())
            ->where('is_driver', '0')
            ->where('tags', 'like', "%$orderChannel%")
            ->get()
            ->map(function ($guide) use ($bookingId, $at_ijen) {
                $guide->dynamic_roles = ['Escort', 'Ijen'];
                $checkIjen = BookGuideDriver::whereRaw("'$at_ijen' between start_date and end_date")->where('guide_id', $guide->id)->count();
                if ($guide->status == 'Terplotting') {
                    $guideType = $guide->current_guide_ijen == '1' ? 'Ijen Guide' : 'Escort Guide';
                    $guide->schedule_info = "Terplotting untuk Booking ID: {$bookingId} ({$guideType})";
                    $guide->guide_ijen = $guide->current_guide_ijen;
                } elseif ($guide->status == 'Tidak Tersedia' && $guide->conflicting_booking_id) {
                    // if($guide->guide_ijen == '1' && $guide->conflicting_start_date != $at_ijen){
                    if (($guide->guide_ijen == '1' && $guide->conflicting_start_date != $at_ijen)) {
                        $guide->status = 'Tersedia';
                        $guide->schedule_info = 'Tersedia';
                        $guide->dynamic_roles = ['Ijen'];
                    } else if (($guide->guide_ijen == '0' && $at_ijen > $guide->conflicting_end_date)) {
                        if ($checkIjen == 0) {
                            $guide->status = 'Tersedia';
                            $guide->schedule_info = 'Tersedia';
                            $guide->dynamic_roles = ['Ijen'];
                        } else {
                            $guide->schedule_info = "({$guide->conflicting_start_date} - {$guide->conflicting_end_date}) " .
                                "Customer: {$guide->conflicting_user_name}";
                        }
                    } else {
                        $guide->schedule_info = "({$guide->conflicting_start_date} - {$guide->conflicting_end_date}) " .
                            "Customer: {$guide->conflicting_user_name}";
                    }
                } else {
                    $guide->schedule_info = "Tersedia";
                }
                unset($guide->conflicting_booking_id, $guide->conflicting_user_name,  $guide->current_guide_ijen);
                return $guide;
            });

        // Query for cars
        $carAvailabilitySubquery = BookCar::select('car_id', 'book_cars.booking_id', 'users.name as user_name', 'book_cars.start_date', 'book_cars.end_date')
            ->join('bookings', 'book_cars.booking_id', '=', 'bookings.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->where('book_cars.booking_id', '!=', $bookingId)
            ->where(function ($query) use ($start_date, $end_date) {
                $query->whereBetween('book_cars.start_date', [$start_date, $end_date])
                    ->orWhereBetween('book_cars.end_date', [$start_date, $end_date])
                    ->orWhere(function ($q) use ($start_date, $end_date) {
                        $q->where('book_cars.start_date', '<=', $start_date)
                            ->where('book_cars.end_date', '>=', $end_date);
                    });
            })
            ->whereColumn('book_cars.car_id', 'cars.id')
            ->orderBy('book_cars.start_date')
            ->limit(1);

        $currentCarBookingSubquery = BookCar::select('car_id')
            ->where('booking_id', $bookingId)
            ->whereColumn('car_id', 'cars.id');

        $data['car'] = Car::select('id', 'name', 'garage_id', 'start_pax', 'end_pax')
            ->selectSub($carAvailabilitySubquery->select('booking_id'), 'conflicting_booking_id')
            ->selectSub($carAvailabilitySubquery->select('users.name'), 'conflicting_user_name')
            ->selectSub($carAvailabilitySubquery->select('start_date'), 'conflicting_start_date')
            ->selectSub($carAvailabilitySubquery->select('end_date'), 'conflicting_end_date')
            ->selectRaw('CASE
                WHEN EXISTS (' . $currentCarBookingSubquery->toSql() . ') THEN "Terplotting"
                WHEN EXISTS (' . $carAvailabilitySubquery->toSql() . ') THEN "Tidak Tersedia"
                ELSE "Tersedia"
            END as status')
            ->mergeBindings($currentCarBookingSubquery->getQuery())
            ->mergeBindings($carAvailabilitySubquery->getQuery())
            ->get()
            ->map(function ($car) use ($bookingId) {
                if ($car->status == 'Terplotting') {
                    $car->schedule_info = "Terplotting untuk Booking ID: {$bookingId}";
                } elseif ($car->status == 'Tidak Tersedia' && $car->conflicting_booking_id) {
                    $car->schedule_info = "({$car->conflicting_start_date} - {$car->conflicting_end_date}) " .
                        "Customer: {$car->conflicting_user_name}";
                }
                unset($car->conflicting_booking_id, $car->conflicting_user_name, $car->conflicting_start_date, $car->conflicting_end_date);
                return $car;
            });

        return $data;
    }

    // Fungsi autoPlotting yang memanggil getDataPlotting
    function autoPlotting(Request $request)
    {
        $bookingId = $request->booking_id;
        $orderChannel = strtoupper($request->order_channel);

        // Ambil data booking
        $booking = Booking::select('id', 'travel_date_start', 'travel_date_end', 'user_id', 'total_pax')
            ->with(['user' => function ($query) {
                $query->select('id', 'name');
            }])
            ->where('id', $bookingId)
            ->first();

        // Buat array parameter untuk getDataPlotting
        $params = [
            'id' => $bookingId,
            'order_channel' => $orderChannel != '' ? $orderChannel : 'all'
        ];

        // Panggil fungsi getDataPlotting
        $data = $this->getDataPlotting($params);

        // Filter driver berdasarkan total_pax
        $driverOptions = [];
        if ($booking->total_pax <= 3) {
            // Untuk <= 3 pax, gunakan Driver cum guide
            foreach ($data['driver'] as $driver) {
                if ($driver['new_role'] == 'Driver cum guide' && $driver['status'] == 'Tersedia') {
                    $driverOptions[] = $driver;
                }
            }
        } else {
            // Untuk > 3 pax, gunakan driver dengan id 9 (GARAGE)
            foreach ($data['driver'] as $driver) {
                if ($driver['id'] == 9) {
                    // GARAGE driver selalu tersedia bahkan jika statusnya 'Tidak Tersedia'
                    $driver['status'] = 'Tersedia (Auto-selected for large groups)';
                    $driverOptions[] = $driver;
                    break;
                }
            }
        }

        return [
            'order_channel' => $orderChannel,
            'booking' => $booking,
            'driver_options' => $driverOptions,
            'data' => $data,
        ];
    }
    // Fungsi untuk melakukan autoplotting secara massal dengan prioritas driver dan guide
    function massAutoPlotting(Request $request)
    {
        // Ambil semua booking bulan Juni 2025 dengan urutan prioritas (tanpa limit)
        $bookings = Booking::where('travel_date_start', '>=', '2025-06-01')
            ->where('travel_date_start', '<', '2025-07-01')
            ->where(function ($query) {
                // Prioritas urutan order channel
                $query->where('agent_id', 1) // TWT
                    ->orWhere(function ($q) {
                        $q->where('agent_id', 2)
                            ->where('booking_category_id', '!=', 3); // JVTO
                    })
                    ->orWhere(function ($q) {
                        $q->where('agent_id', 2)
                            ->where('booking_category_id', 3); // KLOOK
                    });
            })
            ->orderByRaw("CASE 
                                   WHEN agent_id = 1 THEN 1
                                   WHEN agent_id = 2 AND booking_category_id != 3 THEN 2
                                   WHEN agent_id = 2 AND booking_category_id = 3 THEN 3
                                   ELSE 4
                                   END")
            ->orderBy('travel_date_start')
            ->with('user')
            ->get();

        $results = [];

        // Inisialisasi array untuk melacak jumlah trip masing-masing crew beserta nama
        $driverTrips = [];
        $guideTrips = [];

        // Array untuk melacak plotting yang dilakukan dalam proses simulasi ini
        $simulatedDriverPlottings = [];
        $simulatedGuidePlottings = [];

        foreach ($bookings as $booking) {
            // Tentukan order channel berdasarkan agent_id dan booking_category_id
            if ($booking->agent_id == 2 && $booking->booking_category_id == 3) {
                $orderChannel = 'KLOOK';
            } elseif ($booking->agent_id == 2) {
                $orderChannel = 'JVTO';
            } else {
                $orderChannel = 'TWT';
            }

            // Tentukan tanggal awal dan akhir trip untuk driver
            $tripStartDate = $booking->travel_date_start;
            $tripEndDate = $booking->is_shuttle == '1'
                ? Carbon::parse($booking->travel_date_end)->subDay()->toDateString()
                : $booking->travel_date_end;

            // Buat parameter untuk getDataPlotting
            $params = [
                'id' => $booking->id,
                'order_channel' => $orderChannel
            ];

            // Panggil fungsi getDataPlotting
            $data = $this->getDataPlotting($params);

            // ==== PLOTTING DRIVER ====
            $selectedDriver = null;
            $allAvailableDrivers = [];
            $driverConflictInfo = null;

            // Logika berbeda berdasarkan jumlah penumpang
            if ($booking->total_pax <= 3) {
                // Array untuk menyimpan driver yang tersedia, dikelompokkan berdasarkan role
                $availableDriversByRole = [
                    'Driver cum guide' => [],
                    'Only Driver' => [],
                    'Outsource' => []
                ];

                // Untuk <= 3 pax, cari driver berdasarkan prioritas role
                foreach ($data['driver'] as $driver) {
                    $driverId = $driver['id'];

                    // Cek apakah driver tersedia menurut data
                    $isAvailable = $driver['status'] == 'Tersedia';

                    // Cek konflik dengan plotting yang telah dilakukan dalam simulasi
                    $hasConflict = false;
                    if (isset($simulatedDriverPlottings[$driverId])) {
                        foreach ($simulatedDriverPlottings[$driverId] as $plot) {
                            // Cek apakah ada overlap tanggal
                            $plotStart = $plot['start_date'];
                            $plotEnd = $plot['end_date'];

                            if (
                                // Booking baru mulai di tengah plotting yang ada
                                ($tripStartDate >= $plotStart && $tripStartDate <= $plotEnd) ||
                                // Booking baru berakhir di tengah plotting yang ada
                                ($tripEndDate >= $plotStart && $tripEndDate <= $plotEnd) ||
                                // Booking baru melingkupi plotting yang ada
                                ($tripStartDate <= $plotStart && $tripEndDate >= $plotEnd)
                            ) {
                                $hasConflict = true;
                                break;
                            }
                        }
                    }

                    // Hanya pertimbangkan driver yang tersedia dan tidak memiliki konflik
                    if ($isAvailable && !$hasConflict) {
                        $role = $driver['new_role'] ?? 'Unknown'; // Default jika tidak ada role

                        // Tambahkan jumlah trip yang sudah dihitung
                        $driver['trip_count'] = isset($driverTrips[$driverId]['count']) ? $driverTrips[$driverId]['count'] : 0;

                        // Kelompokkan driver berdasarkan role
                        if ($role == 'Driver cum guide') {
                            $availableDriversByRole['Driver cum guide'][] = $driver;
                        } elseif ($role == 'Only Driver') {
                            $availableDriversByRole['Only Driver'][] = $driver;
                        } elseif ($role == 'Outsource') {
                            $availableDriversByRole['Outsource'][] = $driver;
                        }

                        // Tambahkan ke daftar semua driver tersedia
                        $allAvailableDrivers[] = $driver;
                    }
                }

                // Pilih driver berdasarkan prioritas role dan jumlah trip
                // Cek setiap role sesuai prioritas
                foreach (['Driver cum guide', 'Only Driver', 'Outsource'] as $role) {
                    if (!empty($availableDriversByRole[$role])) {
                        // Jika ada driver dengan role ini, urutkan berdasarkan jumlah trip
                        usort($availableDriversByRole[$role], function ($a, $b) {
                            return $a['trip_count'] - $b['trip_count'];
                        });

                        // Pilih driver dengan jumlah trip terkecil dari role ini
                        $selectedDriver = $availableDriversByRole[$role][0];
                        break; // Keluar dari loop setelah menemukan driver
                    }
                }
            } else {
                // Untuk > 3 pax, SELALU gunakan driver dengan id 9 (GARAGE) meskipun ada konflik
                foreach ($data['driver'] as $driver) {
                    if ($driver['id'] == 9) {
                        $driverId = $driver['id'];

                        // Cek konflik untuk informasi saja, bukan untuk menentukan ketersediaan
                        $hasConflict = false;
                        if (isset($simulatedDriverPlottings[$driverId])) {
                            foreach ($simulatedDriverPlottings[$driverId] as $plot) {
                                // Cek apakah ada overlap tanggal
                                $plotStart = $plot['start_date'];
                                $plotEnd = $plot['end_date'];

                                if (
                                    ($tripStartDate >= $plotStart && $tripStartDate <= $plotEnd) ||
                                    ($tripEndDate >= $plotStart && $tripEndDate <= $plotEnd) ||
                                    ($tripStartDate <= $plotStart && $tripEndDate >= $plotEnd)
                                ) {
                                    $hasConflict = true;
                                    $driverConflictInfo = [
                                        'booking_id' => $plot['booking_id'],
                                        'start_date' => $plotStart,
                                        'end_date' => $plotEnd
                                    ];
                                    break;
                                }
                            }
                        }

                        // GARAGE driver selalu tersedia bahkan jika ada konflik
                        $driver['status'] = $hasConflict
                            ? 'Tersedia (Konflik, tapi tetap digunakan untuk > 3 pax)'
                            : 'Tersedia (Auto-selected for large groups)';

                        $driver['trip_count'] = isset($driverTrips[$driverId]['count']) ? $driverTrips[$driverId]['count'] : 0;
                        $selectedDriver = $driver;
                        $allAvailableDrivers[] = $driver;

                        // Tambahkan informasi konflik jika ada
                        if ($hasConflict) {
                            $selectedDriver['conflict_info'] = $driverConflictInfo;
                        }

                        break; // Keluar dari loop setelah menemukan GARAGE
                    }
                }
            }

            // Jika driver terpilih, update jumlah trip dan catat plotting
            if ($selectedDriver) {
                $driverId = $selectedDriver['id'];

                // Update jumlah trip
                if (!isset($driverTrips[$driverId])) {
                    $driverTrips[$driverId] = [
                        'name' => $selectedDriver['name'],
                        'role' => $selectedDriver['new_role'] ?? 'Unknown',
                        'count' => 0
                    ];
                }
                $driverTrips[$driverId]['count']++;

                // Update trip_count di selectedDriver
                $selectedDriver['trip_count'] = $driverTrips[$driverId]['count'];

                // Catat plotting untuk pengecekan konflik selanjutnya
                if (!isset($simulatedDriverPlottings[$driverId])) {
                    $simulatedDriverPlottings[$driverId] = [];
                }
                $simulatedDriverPlottings[$driverId][] = [
                    'booking_id' => $booking->id,
                    'start_date' => $tripStartDate,
                    'end_date' => $tripEndDate
                ];
            }

            // ==== PLOTTING GUIDE ====
            $selectedEscortGuide = null;
            $selectedIjenGuide = null;
            $allAvailableGuides = [];

            // Menentukan apakah perlu escort guide berdasarkan pax dan driver yang dipilih
            $needEscortGuide = false;
            $needSecondEscortGuide = false;
            if ($booking->total_pax > 3) {
                // Selalu perlu escort guide untuk > 3 pax
                $needEscortGuide = true;

                // Untuk TWT dengan pax >= 12, butuh 2 escort guide
                if ($orderChannel == 'TWT' && $booking->total_pax >= 12) {
                    $needSecondEscortGuide = true;
                }
            } else if ($selectedDriver && ($selectedDriver['new_role'] == 'Only Driver' || $selectedDriver['new_role'] == 'Outsource')) {
                // Perlu escort guide jika driver adalah Only Driver atau Outsource meskipun pax <= 3
                $needEscortGuide = true;
            }

            // Cek apakah perlu guide ijen berdasarkan keberadaan nilai di at_bondowoso dan aturan JVTO & KLOOK
            $needIjenGuide = false;
            $ijenDate = null;

            if (!empty($booking->at_bondowoso)) {
                // Default: perlu guide ijen jika ada nilai at_bondowoso
                $needIjenGuide = true;
                $ijenDate = $booking->at_bondowoso;

                // Revisi aturan: untuk jvto & klook jika kurang dari 6 pax
                if ($orderChannel != 'TWT' && $booking->total_pax < 6) {
                    // Jika driver adalah 'Driver cum guide', tetap butuh ijen guide
                    // Jika driver bukan 'Driver cum guide', tidak perlu ijen guide
                    if ($selectedDriver && $selectedDriver['new_role'] != 'Driver cum guide') {
                        $needIjenGuide = false;
                    }
                }
            }

            // Jika perlu escort guide, cari berdasarkan prioritas
            if ($needEscortGuide) {
                // Array untuk menyimpan guide yang tersedia, dikelompokkan berdasarkan role
                $availableGuidesByRole = [
                    'Escort Guide (Senior)' => [],
                    'Escort Guide (Junior)' => []
                ];

                foreach ($data['guide'] as $guide) {
                    $guideId = $guide['id'];

                    // Cek apakah guide tersedia dan bisa menjadi escort guide
                    $isAvailable = $guide['status'] == 'Tersedia';
                    $isEscortGuide = false;

                    if (isset($guide['dynamic_roles']) && in_array('Escort', $guide['dynamic_roles'])) {
                        $isEscortGuide = true;
                    }

                    // Cek konflik dengan plotting yang telah dilakukan dalam simulasi
                    $hasConflict = false;
                    if (isset($simulatedGuidePlottings[$guideId])) {
                        foreach ($simulatedGuidePlottings[$guideId] as $plot) {
                            // Cek tipe plotting
                            if ($plot['type'] == 'Escort') {
                                // Cek apakah ada overlap tanggal
                                $plotStart = $plot['start_date'];
                                $plotEnd = $plot['end_date'];

                                if (
                                    ($tripStartDate >= $plotStart && $tripStartDate <= $plotEnd) ||
                                    ($tripEndDate >= $plotStart && $tripEndDate <= $plotEnd) ||
                                    ($tripStartDate <= $plotStart && $tripEndDate >= $plotEnd)
                                ) {
                                    $hasConflict = true;
                                    break;
                                }
                            } else if ($plot['type'] == 'Ijen') {
                                // Jika guide sudah dijadwalkan sebagai ijen guide pada tanggal dalam rentang trip ini
                                $plotIjenDate = $plot['ijen_date'];
                                if ($plotIjenDate >= $tripStartDate && $plotIjenDate <= $tripEndDate) {
                                    $hasConflict = true;
                                    break;
                                }
                            }
                        }
                    }

                    // Hanya pertimbangkan guide yang tersedia, bisa menjadi escort, dan tidak memiliki konflik
                    if ($isAvailable && $isEscortGuide && !$hasConflict) {
                        $role = $guide['new_role'] ?? 'Unknown'; // Default jika tidak ada role

                        // Tambahkan jumlah trip total dan per tipe
                        if (isset($guideTrips[$guideId])) {
                            $guide['trip_count'] = $guideTrips[$guideId]['count'];
                            $guide['escort_count'] = $guideTrips[$guideId]['escort_count'];
                            $guide['ijen_count'] = $guideTrips[$guideId]['ijen_count'];
                        } else {
                            $guide['trip_count'] = 0;
                            $guide['escort_count'] = 0;
                            $guide['ijen_count'] = 0;
                        }

                        // Kelompokkan guide berdasarkan role
                        if (strpos($role, 'Senior') !== false) {
                            $availableGuidesByRole['Escort Guide (Senior)'][] = $guide;
                        } elseif (strpos($role, 'Junior') !== false) {
                            $availableGuidesByRole['Escort Guide (Junior)'][] = $guide;
                        }

                        // Tambahkan ke daftar semua guide tersedia
                        $allAvailableGuides[] = $guide;
                    }
                }

                // Pilih escort guide berdasarkan prioritas role dan jumlah trip dengan rasio 2:1
                if (!empty($availableGuidesByRole['Escort Guide (Senior)']) || !empty($availableGuidesByRole['Escort Guide (Junior)'])) {
                    $seniorGuides = $availableGuidesByRole['Escort Guide (Senior)'];
                    $juniorGuides = $availableGuidesByRole['Escort Guide (Junior)'];

                    // Urutkan guide berdasarkan jumlah trip escort
                    if (!empty($seniorGuides)) {
                        usort($seniorGuides, function ($a, $b) {
                            return $a['escort_count'] - $b['escort_count'];
                        });
                    }

                    if (!empty($juniorGuides)) {
                        usort($juniorGuides, function ($a, $b) {
                            return $a['escort_count'] - $b['escort_count'];
                        });
                    }

                    // Tentukan guide dengan jumlah trip terendah di masing-masing kategori
                    $lowestSeniorGuide = !empty($seniorGuides) ? $seniorGuides[0] : null;
                    $lowestJuniorGuide = !empty($juniorGuides) ? $juniorGuides[0] : null;

                    // Cek apakah driver adalah Only Driver atau Outsource
                    $requiresSeniorGuide = $selectedDriver && ($selectedDriver['new_role'] == 'Only Driver' || $selectedDriver['new_role'] == 'Outsource');

                    if ($requiresSeniorGuide && $lowestSeniorGuide) {
                        // Jika driver adalah Only Driver atau Outsource, selalu gunakan Senior Guide jika tersedia
                        $selectedEscortGuide = $lowestSeniorGuide;
                    } else if ($orderChannel != 'TWT') {
                        // Untuk JVTO dan KLOOK: Gunakan rasio 2:1
                        // Aturan: gunakan junior guide jika semua senior guide memiliki setidaknya 2x trip dibandingkan junior
                        if ($lowestSeniorGuide && $lowestJuniorGuide) {
                            if ($lowestSeniorGuide['escort_count'] >= 2 * $lowestJuniorGuide['escort_count']) {
                                $selectedEscortGuide = $lowestJuniorGuide;
                            } else {
                                $selectedEscortGuide = $lowestSeniorGuide;
                            }
                        } else if ($lowestSeniorGuide) {
                            $selectedEscortGuide = $lowestSeniorGuide;
                        } else if ($lowestJuniorGuide) {
                            $selectedEscortGuide = $lowestJuniorGuide;
                        }
                    } else {
                        // Untuk TWT: Selalu prioritaskan Senior Guide dulu
                        if ($lowestSeniorGuide) {
                            $selectedEscortGuide = $lowestSeniorGuide;
                        } else if ($lowestJuniorGuide) {
                            $selectedEscortGuide = $lowestJuniorGuide;
                        }
                    }
                }
            }

            // Jika perlu escort guide kedua (untuk TWT dengan pax >= 12)
            $selectedSecondEscortGuide = null;
            if ($needSecondEscortGuide) {
                // Jika escort guide pertama adalah Senior Guide, maka escort guide kedua adalah Junior Guide
                if ($selectedEscortGuide && strpos($selectedEscortGuide['new_role'], 'Senior') !== false) {
                    // Pilih Junior Guide dengan jumlah trip terendah
                    if (!empty($juniorGuides)) {
                        // Filter out the guides that have conflicts
                        $availableJuniorGuides = [];
                        foreach ($juniorGuides as $guide) {
                            $guideId = $guide['id'];
                            $hasConflict = false;

                            // Cek konflik dengan plotting yang telah dilakukan dalam simulasi
                            if (isset($simulatedGuidePlottings[$guideId])) {
                                foreach ($simulatedGuidePlottings[$guideId] as $plot) {
                                    // Cek tipe plotting
                                    if ($plot['type'] == 'Escort') {
                                        // Cek apakah ada overlap tanggal
                                        $plotStart = $plot['start_date'];
                                        $plotEnd = $plot['end_date'];

                                        if (
                                            ($tripStartDate >= $plotStart && $tripStartDate <= $plotEnd) ||
                                            ($tripEndDate >= $plotStart && $tripEndDate <= $plotEnd) ||
                                            ($tripStartDate <= $plotStart && $tripEndDate >= $plotEnd)
                                        ) {
                                            $hasConflict = true;
                                            break;
                                        }
                                    } else if ($plot['type'] == 'Ijen') {
                                        // Jika guide sudah dijadwalkan sebagai ijen guide pada tanggal dalam rentang trip ini
                                        $plotIjenDate = $plot['ijen_date'];
                                        if ($plotIjenDate >= $tripStartDate && $plotIjenDate <= $tripEndDate) {
                                            $hasConflict = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (!$hasConflict) {
                                $availableJuniorGuides[] = $guide;
                            }
                        }

                        if (!empty($availableJuniorGuides)) {
                            usort($availableJuniorGuides, function ($a, $b) {
                                return $a['escort_count'] - $b['escort_count'];
                            });

                            $selectedSecondEscortGuide = $availableJuniorGuides[0];
                        }
                    }
                }
                // Jika escort guide pertama adalah Junior Guide atau tidak ada, maka escort guide kedua adalah Senior Guide
                else {
                    // Pilih Senior Guide dengan jumlah trip terendah
                    if (!empty($seniorGuides)) {
                        // Filter out the guides that have conflicts
                        $availableSeniorGuides = [];
                        foreach ($seniorGuides as $guide) {
                            $guideId = $guide['id'];
                            $hasConflict = false;

                            // Cek konflik dengan plotting yang telah dilakukan dalam simulasi
                            if (isset($simulatedGuidePlottings[$guideId])) {
                                foreach ($simulatedGuidePlottings[$guideId] as $plot) {
                                    // Cek tipe plotting
                                    if ($plot['type'] == 'Escort') {
                                        // Cek apakah ada overlap tanggal
                                        $plotStart = $plot['start_date'];
                                        $plotEnd = $plot['end_date'];

                                        if (
                                            ($tripStartDate >= $plotStart && $tripStartDate <= $plotEnd) ||
                                            ($tripEndDate >= $plotStart && $tripEndDate <= $plotEnd) ||
                                            ($tripStartDate <= $plotStart && $tripEndDate >= $plotEnd)
                                        ) {
                                            $hasConflict = true;
                                            break;
                                        }
                                    } else if ($plot['type'] == 'Ijen') {
                                        // Jika guide sudah dijadwalkan sebagai ijen guide pada tanggal dalam rentang trip ini
                                        $plotIjenDate = $plot['ijen_date'];
                                        if ($plotIjenDate >= $tripStartDate && $plotIjenDate <= $tripEndDate) {
                                            $hasConflict = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (!$hasConflict) {
                                $availableSeniorGuides[] = $guide;
                            }
                        }

                        if (!empty($availableSeniorGuides)) {
                            usort($availableSeniorGuides, function ($a, $b) {
                                return $a['escort_count'] - $b['escort_count'];
                            });

                            $selectedSecondEscortGuide = $availableSeniorGuides[0];
                        }
                    }
                }

                // Update jumlah trip untuk escort guide kedua
                if ($selectedSecondEscortGuide) {
                    $guideId = $selectedSecondEscortGuide['id'];

                    // Update jumlah trip
                    if (!isset($guideTrips[$guideId])) {
                        $guideTrips[$guideId] = [
                            'name' => $selectedSecondEscortGuide['name'],
                            'role' => $selectedSecondEscortGuide['new_role'] ?? 'Unknown',
                            'count' => 0,
                            'escort_count' => 0,
                            'ijen_count' => 0
                        ];
                    }
                    $guideTrips[$guideId]['count']++;
                    $guideTrips[$guideId]['escort_count']++;

                    // Update trip_count di selectedSecondEscortGuide
                    $selectedSecondEscortGuide['trip_count'] = $guideTrips[$guideId]['count'];
                    $selectedSecondEscortGuide['escort_count'] = $guideTrips[$guideId]['escort_count'];
                    $selectedSecondEscortGuide['ijen_count'] = $guideTrips[$guideId]['ijen_count'];

                    // Catat plotting untuk pengecekan konflik selanjutnya
                    if (!isset($simulatedGuidePlottings[$guideId])) {
                        $simulatedGuidePlottings[$guideId] = [];
                    }
                    $simulatedGuidePlottings[$guideId][] = [
                        'booking_id' => $booking->id,
                        'start_date' => $tripStartDate,
                        'end_date' => $tripEndDate,
                        'type' => 'Escort'
                    ];
                }
            }

            // Jika perlu guide ijen, cari berdasarkan prioritas
            if ($needIjenGuide) {
                // Array untuk menyimpan guide yang tersedia untuk Ijen
                $availableIjenGuides = [];
                $localIjenGuide = null;

                foreach ($data['guide'] as $guide) {
                    $guideId = $guide['id'];

                    // Cek apakah guide tersedia dan bisa menjadi ijen guide
                    $isAvailable = $guide['status'] == 'Tersedia';
                    $isIjenGuide = false;
                    $isLocalGuide = false;

                    if (isset($guide['dynamic_roles']) && in_array('Ijen', $guide['dynamic_roles'])) {
                        $isIjenGuide = true;
                    }

                    // Cek apakah ini adalah Local Ijen Guide
                    if ($guide['name'] == 'Local Ijen') {
                        $isLocalGuide = true;
                    }

                    // Cek konflik dengan plotting yang telah dilakukan dalam simulasi
                    $hasConflict = false;
                    if (!$isLocalGuide && isset($simulatedGuidePlottings[$guideId])) {
                        foreach ($simulatedGuidePlottings[$guideId] as $plot) {
                            // Untuk Ijen Guide, kita hanya memeriksa konflik pada tanggal Ijen spesifik
                            if ($plot['type'] == 'Ijen' && $plot['ijen_date'] == $ijenDate) {
                                $hasConflict = true;
                                break;
                            }
                            // Untuk Escort Guide, kita memeriksa apakah tanggal Ijen berada dalam rentang tanggal escort
                            else if ($plot['type'] == 'Escort') {
                                $plotStart = $plot['start_date'];
                                $plotEnd = $plot['end_date'];

                                if ($ijenDate >= $plotStart && $ijenDate <= $plotEnd) {
                                    $hasConflict = true;
                                    break;
                                }
                            }
                        }
                    }

                    // Pastikan escort guide dan ijen guide tidak crew yang sama
                    if (
                        $selectedEscortGuide &&
                        $guideId == $selectedEscortGuide['id']
                    ) {
                        $hasConflict = true; // Tandai sebagai konflik jika sama dengan escort guide
                    }

                    // Tambahkan jumlah trip total dan per tipe
                    if (isset($guideTrips[$guideId])) {
                        $guide['trip_count'] = $guideTrips[$guideId]['count'];
                        $guide['escort_count'] = $guideTrips[$guideId]['escort_count'];
                        $guide['ijen_count'] = $guideTrips[$guideId]['ijen_count'];
                    } else {
                        $guide['trip_count'] = 0;
                        $guide['escort_count'] = 0;
                        $guide['ijen_count'] = 0;
                    }

                    // Untuk Local Ijen Guide, selalu tersedia meskipun ada konflik
                    if ($isLocalGuide) {
                        $localIjenGuide = $guide;
                    }
                    // Untuk guide lain, hanya pertimbangkan yang tersedia, bisa menjadi ijen guide, dan tidak memiliki konflik
                    else if ($isAvailable && $isIjenGuide && !$hasConflict) {
                        $availableIjenGuides[] = $guide;
                    }
                }

                // Jika ada guide Ijen yang tersedia, pilih berdasarkan jumlah trip
                if (!empty($availableIjenGuides)) {
                    // Urutkan berdasarkan jumlah trip ijen
                    usort($availableIjenGuides, function ($a, $b) {
                        // Prioritaskan berdasarkan jumlah trip ijen
                        if ($a['ijen_count'] != $b['ijen_count']) {
                            return $a['ijen_count'] - $b['ijen_count'];
                        }
                        // Jika sama, pertimbangkan jumlah trip total
                        return $a['trip_count'] - $b['trip_count'];
                    });

                    // Pilih guide dengan jumlah trip terkecil
                    $selectedIjenGuide = $availableIjenGuides[0];
                }
                // Jika tidak ada yang tersedia, gunakan Local Ijen Guide
                else if ($localIjenGuide) {
                    $selectedIjenGuide = $localIjenGuide;
                }
            }

            // Jika escort guide terpilih, update jumlah trip dan catat plotting
            if ($selectedEscortGuide) {
                $guideId = $selectedEscortGuide['id'];

                // Update jumlah trip
                if (!isset($guideTrips[$guideId])) {
                    $guideTrips[$guideId] = [
                        'name' => $selectedEscortGuide['name'],
                        'role' => $selectedEscortGuide['new_role'] ?? 'Unknown',
                        'count' => 0,
                        'escort_count' => 0,
                        'ijen_count' => 0
                    ];
                }
                $guideTrips[$guideId]['count']++;
                $guideTrips[$guideId]['escort_count']++;

                // Update trip_count di selectedEscortGuide
                $selectedEscortGuide['trip_count'] = $guideTrips[$guideId]['count'];
                $selectedEscortGuide['escort_count'] = $guideTrips[$guideId]['escort_count'];
                $selectedEscortGuide['ijen_count'] = $guideTrips[$guideId]['ijen_count'];

                // Catat plotting untuk pengecekan konflik selanjutnya
                if (!isset($simulatedGuidePlottings[$guideId])) {
                    $simulatedGuidePlottings[$guideId] = [];
                }
                $simulatedGuidePlottings[$guideId][] = [
                    'booking_id' => $booking->id,
                    'start_date' => $tripStartDate,
                    'end_date' => $tripEndDate,
                    'type' => 'Escort'
                ];
            }

            // Jika ijen guide terpilih, update jumlah trip dan catat plotting
            if ($selectedIjenGuide) {
                $guideId = $selectedIjenGuide['id'];

                // Update jumlah trip
                if (!isset($guideTrips[$guideId])) {
                    $guideTrips[$guideId] = [
                        'name' => $selectedIjenGuide['name'],
                        'role' => $selectedIjenGuide['new_role'] ?? 'Unknown',
                        'count' => 0,
                        'escort_count' => 0,
                        'ijen_count' => 0
                    ];
                }
                $guideTrips[$guideId]['count']++;
                $guideTrips[$guideId]['ijen_count']++;

                // Update trip_count di selectedIjenGuide
                $selectedIjenGuide['trip_count'] = $guideTrips[$guideId]['count'];
                $selectedIjenGuide['escort_count'] = $guideTrips[$guideId]['escort_count'];
                $selectedIjenGuide['ijen_count'] = $guideTrips[$guideId]['ijen_count'];

                // Catat plotting untuk pengecekan konflik selanjutnya
                if (!isset($simulatedGuidePlottings[$guideId])) {
                    $simulatedGuidePlottings[$guideId] = [];
                }
                $simulatedGuidePlottings[$guideId][] = [
                    'booking_id' => $booking->id,
                    'ijen_date' => $ijenDate,
                    'type' => 'Ijen'
                ];
            }

            // Tambahkan ke hasil
            $results[] = [
                'booking_id' => $booking->id,
                'customer_name' => $booking->user->name,
                'travel_dates' => $booking->travel_date_start . ' s/d ' . $booking->travel_date_end,
                'driver_dates' => $tripStartDate . ' s/d ' . $tripEndDate,
                'ijen_date' => $needIjenGuide ? $ijenDate : null,
                'is_shuttle' => $booking->is_shuttle == '1' ? 'Ya' : 'Tidak',
                'total_pax' => $booking->total_pax,
                'agent_id' => $booking->agent_id,
                'booking_category_id' => $booking->booking_category_id,
                'order_channel' => $orderChannel,
                'need_escort_guide' => $needEscortGuide,
                'need_second_escort_guide' => $needSecondEscortGuide, // Added this field
                'need_ijen_guide' => $needIjenGuide,
                'selected_driver' => $selectedDriver,
                'selected_escort_guide' => $selectedEscortGuide,
                'selected_second_escort_guide' => $selectedSecondEscortGuide,
                'selected_ijen_guide' => $selectedIjenGuide,
                'available_drivers' => count($allAvailableDrivers),
                'driver_options' => array_map(function ($driver) {
                    return [
                        'id' => $driver['id'],
                        'name' => $driver['name'],
                        'new_role' => $driver['new_role'] ?? 'Unknown',
                        'trip_count' => $driver['trip_count'],
                        'conflict_info' => isset($driver['conflict_info']) ? $driver['conflict_info'] : null
                    ];
                }, $allAvailableDrivers),
                'guide_options' => array_map(function ($guide) {
                    $availableRoles = [];
                    if (isset($guide['dynamic_roles'])) {
                        if (in_array('Escort', $guide['dynamic_roles'])) {
                            $availableRoles[] = 'Escort Guide';
                        }
                        if (in_array('Ijen', $guide['dynamic_roles'])) {
                            $availableRoles[] = 'Ijen Guide';
                        }
                    }

                    return [
                        'id' => $guide['id'],
                        'name' => $guide['name'],
                        'new_role' => $guide['new_role'] ?? 'Unknown',
                        'available_roles' => $availableRoles,
                        'available_as' => !empty($availableRoles) ? implode(' & ', $availableRoles) : 'Unknown',
                        'trip_count' => $guide['trip_count'] ?? 0,
                        'escort_count' => $guide['escort_count'] ?? 0,
                        'ijen_count' => $guide['ijen_count'] ?? 0,
                        'trip_details' => sprintf(
                            'Total: %d (Escort: %d, Ijen: %d)',
                            $guide['trip_count'] ?? 0,
                            $guide['escort_count'] ?? 0,
                            $guide['ijen_count'] ?? 0
                        )
                    ];
                }, $allAvailableGuides),
                'current_driver_trips' => $driverTrips,
                'current_guide_trips' => $guideTrips
            ];
        }

        // Modifikasi struktur $guideTrips untuk output
        foreach ($guideTrips as $guideId => &$guideInfo) {
            $guideInfo['trip_details'] = sprintf(
                'Total: %d (Escort: %d, Ijen: %d)',
                $guideInfo['count'],
                $guideInfo['escort_count'],
                $guideInfo['ijen_count']
            );
        }

        // Urutkan driver trips dan guide trips berdasarkan jumlah trip untuk laporan
        uasort($driverTrips, function ($a, $b) {
            return $b['count'] - $a['count']; // Urutan dari terbanyak ke tersedikit
        });

        uasort($guideTrips, function ($a, $b) {
            return $b['count'] - $a['count']; // Urutan dari terbanyak ke tersedikit
        });

        // Persiapkan data schedule
        $schedules = [];
        foreach ($results as $result) {
            // Tentukan driver yang dipilih
            $selectedDriver = $result['selected_driver'] ? $result['selected_driver']['name'] : "(No Crew Available)";
            // Tentukan escort guide yang dipilih
            $selectedEscortGuide = '-';
            if ($result['need_escort_guide']) {
                if ($result['selected_escort_guide']) {
                    $selectedEscortGuide = $result['selected_escort_guide']['name'];
                } else {
                    $selectedEscortGuide = "(No Crew Available)";
                }
            }

            $selectedSecondEscortGuide = '-';
            if (isset($result['need_second_escort_guide']) && $result['need_second_escort_guide']) {
                if ($result['selected_second_escort_guide']) {
                    $selectedSecondEscortGuide = $result['selected_second_escort_guide']['name'];
                } else {
                    $selectedSecondEscortGuide = "(No Crew Available)";
                }
            }

            // Tentukan ijen guide yang dipilih
            $selectedIjenGuide = '-';
            if ($result['need_ijen_guide']) {
                if ($result['selected_ijen_guide']) {
                    $selectedIjenGuide = $result['selected_ijen_guide']['name'];
                } else {
                    $selectedIjenGuide = "(No Crew Available)";
                }
            }

            // Parse tanggal dari string format
            $dateRange = explode(' s/d ', $result['travel_dates']);
            $startDate = trim($dateRange[0]);
            $endDate = trim($dateRange[1]);

            // Hitung durasi (dalam hari)
            $duration = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1; // +1 karena termasuk hari terakhir

            $schedules[] = [
                'booking_id' => $result['booking_id'],
                'customer' => $result['customer_name'],
                'num_of_pax' => $result['total_pax'],
                'duration' => $duration,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_shuttle' => $result['is_shuttle'],
                'driver' => $selectedDriver,
                'escort_guide' => $selectedEscortGuide,
                'second_escort_guide' => $selectedSecondEscortGuide,
                'ijen_guide' => $selectedIjenGuide,
                'order_channel' => $result['order_channel']
            ];
        }
        // Urutkan schedule berdasarkan tanggal awal
        usort($schedules, function ($a, $b) {
            return strtotime($a['start_date']) - strtotime($b['start_date']);
        });


        return [
            'total_processed' => count($results),
            'final_driver_trips' => $driverTrips,
            'final_guide_trips' => $guideTrips,
            'simulation_driver_plottings' => $simulatedDriverPlottings,
            'simulation_guide_plottings' => $simulatedGuidePlottings,
            'schedules' => $schedules,
            'results' => $results
        ];
    }
    public function plotting(Request $request)
    {
        try {
            DB::beginTransaction();

            $booking = Booking::with('user')->where('id', $request->booking_id)->first();

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
                    $bookCar->end_date = date('Y-m-d', strtotime($booking->travel_date_end . " -1 days"));
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
                    $bookDriver->end_date = date('Y-m-d', strtotime($booking->travel_date_end . " -1 days"));
                } else {
                    $bookDriver->duration = $day;
                    $bookDriver->end_date = $booking->travel_date_end;
                }
                $bookDriver->save();

                $getCrew = GuideDriver::where('id', $value)->first();
                if ($getCrew && $getCrew->phone) {
                    $this->reminderPlotting([
                        'crew' => $getCrew->name,
                        'customer' => $booking->user->name,
                        'travel_date_start' => date('d M Y', strtotime($booking->travel_date_start)),
                        'duration' => $booking->package_duration . " Hari",
                        'phone' => $getCrew->phone
                    ]);
                }
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
                    $bookDriver->end_date = date('Y-m-d', strtotime($booking->travel_date_end . " -1 days"));
                } else {
                    $bookDriver->duration = $day;
                    $bookDriver->end_date = $booking->travel_date_end;
                }
                $bookDriver->save();

                $getCrew = GuideDriver::where('id', $value)->first();
                if ($getCrew && $getCrew->phone) {
                    $this->reminderPlotting([
                        'crew' => $getCrew->name,
                        'customer' => $booking->user->name,
                        'travel_date_start' => date('d M Y', strtotime($booking->travel_date_start)),
                        'duration' => $booking->package_duration . " Hari",
                        'phone' => $getCrew->phone
                    ]);
                }
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

                    $getCrew = GuideDriver::where('id', $value)->first();
                    if ($getCrew && $getCrew->phone) {
                        $this->reminderPlotting([
                            'is_ijen' => true,
                            'crew' => $getCrew->name,
                            'customer' => $booking->user->name,
                            'travel_date_start' => date('d M Y', strtotime($booking->travel_date_start)),
                            'duration' => $booking->package_duration . " Hari",
                            'ijen_date' => date('d M Y', strtotime($booking->at_bondowoso)),
                            'phone' => $getCrew->phone
                        ]);
                    }
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
    function reminderPlotting($data)
    {
        // $dataSending = array();
        // $dataSending["api_key"] = config('wa.wa_api_key');
        // $dataSending["number_key"] = config('wa.wa_number_key');
        // $isIjen = isset($data['is_ijen']) ? $data['is_ijen'] : false;
        // $guideIjen = $isIjen ? " sebagai *Ijen Guide*" : "";
        // $dateAtIjen = isset($data['ijen_date']) && $data['is_ijen'] ? "\r\n*Tanggal Ijen:* ".date('d M Y', strtotime($data['ijen_date'])) : "";
        // $dataSending["message"] = "*Hai ".$data['crew']."*,\r\Kamu sudah dijadwalkan".$guideIjen." untuk trip berikut:\r\n\r\n*Customer:* ".$data['customer']."\r\n*Tanggal Trip:* ".$data['travel_date_start']."\r\n*Durasi Trip:* ".$data['duration'].$dateAtIjen."\r\n\r\n📱 Check detailnya di:\r\nhttps://crew-portal.javavolcano-touroperator.com/";
        // $dataSending["phone_no"] = $data['phone'];


        // $curl = curl_init();
        // curl_setopt_array($curl, array(
        //     CURLOPT_URL => 'https://api.watzap.id/v1/send_message',
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_ENCODING => '',
        //     CURLOPT_MAXREDIRS => 10,
        //     CURLOPT_TIMEOUT => 0,
        //     CURLOPT_FOLLOWLOCATION => true,
        //     CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        //     CURLOPT_CUSTOMREQUEST => 'POST',
        //     CURLOPT_POSTFIELDS => json_encode($dataSending),
        //     CURLOPT_HTTPHEADER => array(
        //         'Content-Type: application/json'
        //     ),
        // ));
        // $response = curl_exec($curl);
        // curl_close($curl);
        // $res = json_decode($response);
    }
    function previewFile()
    {
        return view('preview-file');
    }
    function googleCalendar()
    {
        config(['google-calendar.calendar_id' => env('GOOGLE_CALENDAR_ID')]);

        // --- Data dari gambar ---
        $bookingId = 'KLOOK-1053';
        $guestName = 'NASA ZLI RAHMAT';
        // ... (data lainnya bisa dimasukkan ke variabel juga)

        // 1. Buat instance Event baru
        $event = new Event;

        // 2. Mengatur Informasi Dasar (Judul)
        $event->name = "Trip $bookingId: $guestName (Surabaya - Ijen - Bromo)";

        // 3. Mengatur Waktu & Jadwal
        $event->startDate = Carbon::create(2025, 6, 1);
        $event->endDate = Carbon::create(2025, 6, 5);
        $event->allDay = true;

        // 4. Mengatur Deskripsi Acara (Sama seperti sebelumnya)
        $description = "<b>--- DETAIL PERJALANAN ---</b>" .
            "<br><b>ID Booking:</b> $bookingId" .
            // ... (sisa deskripsi lengkap seperti jawaban sebelumnya)
            "<br>... (dan seterusnya)";
        $event->description = $description;

        // 5. LOGIKA UNTUK KATEGORI & LABEL (Bagian Baru)
        $colorId = null; // Nilai default

        if (str_contains($bookingId, 'JVTO')) {
            $colorId = '9'; // Biru Blueberry
        } elseif (str_contains($bookingId, 'KLOOK')) {
            $colorId = '6'; // Oranye Tangerine
        } elseif (str_contains($bookingId, 'TWT')) {
            $colorId = '5'; // Kuning Banana
        }

        // Terapkan colorId jika label ditemukan
        if ($colorId) {
            $event->colorId = $colorId;
        }

        // 6. Simpan acara ke Google Calendar
        $newEvent = $event->save();

        // 7. Tampilkan hasil untuk konfirmasi
        echo "Acara perjalanan untuk $guestName dengan kategori $bookingId berhasil dibuat!";
        dd($newEvent);
    }
}
