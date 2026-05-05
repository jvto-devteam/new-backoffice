<?php

namespace App\Http\Controllers;

use App\Models\AddOn;
use App\Models\BookAddOn;
use App\Models\GoogleBill;
use App\Models\BookCar;
use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookGuideDriver;
use App\Models\BookHotel;
use App\Models\BookHotelMeal;
use App\Models\Booking;
use App\Models\BookingItinerary;
use App\Models\BookingPayment;
use App\Models\BookOthersActivity;
use App\Models\BookRoomHotel;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\DebtPayment;
use App\Models\DebtPaymentDetail;
use App\Models\DestinationActivity;
use App\Models\ExpenseAdditional;
use App\Models\ExpenseRefund;
use App\Models\Hotel;
use App\Models\Itinerary;
use App\Models\ItineraryDestination;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\TwtInvoice;
use App\Models\TwtInvoiceBooking;
use App\Models\TwtInvoicePayment;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PDF;
use Illuminate\Support\Str;


class FinanceController extends Controller
{
    function index(Request $request)
    {
        $month = $request->month ? $request->month : date('m');
        $year = $request->year ? $request->year : date('Y');

        $booking = Booking::select('id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'agent_id', 'booking_category_id', 'booking_date', 'package_duration', 'invoice_code_origin', 'url', 'expense_internal_total')->with(['user' => function ($query) {
            $query->select('id', 'name');
        }, 'bookingDetail' => function ($query) {
            $query->select('id', 'package_id', 'booking_id')->with(['package' => function ($q) {
                $q->select('id', 'name', 'duration_id')->with('duration');
            }]);
            // ->whereLike('travel_date_start','%'.$year.'-'.$month.'%')
        }, 'guideDriver.person'])->where('status', 'booked')->where('travel_date_start', '>=', '2025-04-01')->orderBy('travel_date_start', 'asc')->get()->map(function ($query) {
            $channel = $query->agent_id == 1 ? 'TWT' : ($query->booking_category_id == 3 ? 'KLOOK' : 'JVTO');
            $night = $query->package_duration - 1;
            $totalDebt = 0;

            $bookRoom = BookHotel::select('id', 'booking_id', 'hotel_id', 'b', 'l', 'd', 'is_paid', 'is_debt')->with(['hotel' => function ($q) {
                $q->select('id', 'name', 'lunch_rate', 'dinner_rate');
            }, 'bookRoom' => function ($q) {
                $q->select('id', 'book_hotel_id', 'room_hotel_id', 'quantity', 'subtotal')->with(['roomHotel' => function ($q) {
                    $q->select('id', 'room_name', 'rate');
                }]);
            }, 'bookHotelMeal']);
            $bookRoom = $bookRoom->where('booking_id', $query->id)
                ->get()->map(function ($q) use (&$totalDebt) {
                    if ($q->is_debt == '1') {
                        $totalDebt += $q->bookRoom->sum('subtotal');
                        if ($q->bookHotelMeal) {
                            $totalDebt += $q->bookHotelMeal->sum('subtotal');
                        }
                    }
                    return [
                        'hotel' => $q->hotel->name,
                        'is_debt' => $q->is_debt == '1' ? 'YES' : 'NO',
                        'rooms' => $q->bookRoom->map(function ($room) {
                            return [
                                'room' => $room->roomHotel->room_name,
                                'quantity' => $room->quantity,
                                'price' => $room->subtotal / $room->quantity,
                                'subtotal' => $room->subtotal,
                            ];
                        }),
                        'meals' => $q->bookHotelMeal->map(function ($meals) {
                            return [
                                'meals' => $meals->meals,
                                'quantity' => $meals->qty,
                                'price' => $meals->price,
                                'subtotal' => $meals->subtotal,
                            ];
                        })
                    ];
                });

            $destinations = BookDestinationActivity::select('id', 'destination_id', 'destination_activity_id', 'qty', 'price', 'subtotal', 'status_paid', 'is_debt')->with(['destination' => function ($q) {
                $q->select('id', 'name');
            }, 'destinationActivity' => function ($q) {
                $q->select('id', 'name', 'unit');
            }]);

            $destinations = $destinations->where('booking_id', $query->id)->get()
                ->groupBy(fn($item) => $item->destination->name) // Grouping sebelum mapping
                ->map(function ($items) use (&$totalDebt) {
                    return $items->map(function ($q) use (&$totalDebt) {
                        if ($q->is_debt == '1') {
                            $totalDebt += $q->subtotal;
                        }
                        return [
                            'item' => $q->destinationActivity->name,
                            'quantity' => $q->qty,
                            'price' => $q->price,
                            'subtotal' => $q->subtotal,
                            'is_debt' => $q->is_debt == '1' ? 'YES' : 'NO',
                        ];
                    });
                });

            $resources['transport'] = BookCarActivity::with(['car' => function ($q) {
                $q->select('id', 'name');
            }]);
            $resources['transport'] = $resources['transport']->where('booking_id', $query->id)
                ->get()->map(function ($q) use (&$totalDebt) {
                    if ($q->is_debt == '1') {
                        $totalDebt += $q->subtotal;
                    }
                    return [
                        'item' => $q->car->name,
                        'quantity' => $q->qty,
                        'price' => $q->price,
                        'subtotal' => $q->subtotal,
                        'is_debt' => $q->is_debt == '1' ? 'YES' : 'NO',
                    ];
                });

            $resources['crew'] = BookCrewActivity::with(['crewRole' => function ($q) {
                $q->select('id', 'role');
            }]);

            $resources['crew'] = $resources['crew']->where('booking_id', $query->id)
                ->get()->map(function ($q) use (&$totalDebt) {
                    if ($q->is_debt == '1') {
                        $totalDebt += $q->subtotal;
                    }
                    return [
                        'item' => $q->crewRole->role,
                        'quantity' => $q->qty,
                        'price' => $q->price,
                        'subtotal' => $q->subtotal,
                        'is_debt' => $q->is_debt == '1' ? 'YES' : 'NO',
                    ];
                });

            $others = BookOthersActivity::with('othersActivity')
                ->where('booking_id', $query->id);

            $others = $others->get()->map(function ($q) use (&$totalDebt) {
                if ($q->is_debt == '1') {
                    $totalDebt += $q->subtotal;
                }
                return [
                    'item' => $q->othersActivity->name,
                    'quantity' => $q->qty,
                    'price' => $q->price,
                    'subtotal' => $q->subtotal,
                    'is_debt' => $q->is_debt == '1' ? 'YES' : 'NO',
                ];
            });

            // $update = Booking::find($query->id);
            // $update->expense_crew_total = $query->expense_internal_total-$totalDebt;
            // $update->total_debt = $totalDebt;
            // $update->save();

            return [
                'id' => $channel . "-" . $query->id,
                'name' => $query->user->name,
                'total_pax' => $query->total_pax,
                'package' => $query->bookingDetail[0]->package ? $query->bookingDetail[0]->package->name : $query->package_duration . "Days " . $night . " Nights Package",
                'travel_date' => date('d F Y', strtotime($query->travel_date_start)),
                'crews' => $query->guideDriver->map(function ($q) {
                    return [
                        'name' => $q->person->name,
                        'role' => $q->type == 'driver' ? 'Driver' : ($q->guide_ijen == '1' ? 'Guide Ijen' : 'Escort Guide'),
                    ];
                }),
                'total_invoice' => $query->grand_total + $query->book_add_on_total,
                'total_expense' => $query->expense_internal_total,
                'total_crew_expense' => $query->expense_internal_total - $totalDebt,
                'total_debt' => $totalDebt,
                'expenses' => [
                    'accommodations' => $bookRoom,
                    'activities' => $destinations,
                    'resources' => $resources,
                    'others' => $others
                ]
            ];
        });

        return $booking;
    }
    function invoiceManager(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->get('start_date') ? $request->get('start_date') : date('Y-m-01');
        $endDate = $request->get('end_date') ? $request->get('end_date') : date('Y-m-t');
        $package = $request->input('package');
        $channel = $request->input('channel');
        $perPage = 3;
        $query = Booking::select('id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'payment', 'balance', 'booking_category_id')->with(['user.country', 'bookingDetail' => function ($q) {
            $q->select('id', 'package_id', 'booking_id')->with('package', function ($qq) {
                $qq->select('id', 'name', 'package_code');
            });
        }, 'bookingPayment.paymentMethod', 'bookAddOn.addOn'])->where('status', 'booked')->where('agent_id', 2)->where('booking_category_id', '!=', '3')->orderBy('travel_date_start', 'asc');
        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('travel_date_start', [$startDate, $endDate]);
        }

        // Apply package filter
        if ($package) {
            $query->whereHas('bookingDetail', function ($q) use ($package) {
                $q->where('package_id', $package);
            });
        }
        // Apply channel filter
        if ($channel) {
            if ($channel == 'klook') {
                $query->where('booking_category_id', 3);
            } else {
                $query->where('booking_category_id', '!=', 3);
            }
        }

        $bookings = $query->get();
        $summary = [
            'bookings' => $bookings->count(),
            'grand_total' => $bookings->sum('grand_total') + $bookings->sum('book_add_on_total'),
            'paxs' => $bookings->sum('total_pax'),
            'paid' => $bookings->filter(function ($booking) {
                return $booking->booking_category_id != 3 && $booking->balance <= 0;
            })->count(),
            'dp_paid' => $bookings->filter(function ($booking) {
                return $booking->booking_category_id != 3 && $booking->payment > 0 && $booking->balance > 0;
            })->count(),
            'unpaid' => $bookings->filter(function ($booking) {
                return $booking->booking_category_id != 3 && $booking->payment == 0;
            })->count(),
        ];

        $booking = $query->paginate($perPage)
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'name' => $booking->user->name,
                    'channel' => $booking->booking_category_id == 3 ? 'KLOOK' : 'JVTO',
                    'package_code' => $booking->bookingDetail[0]->package->package_code ?? "-",
                    'package' => $booking->bookingDetail[0]->package->name ?? 'CUSTOM PACKAGE',
                    'numb_of_pax' => $booking->total_pax ?? 0,
                    'trip_date' => $booking->travel_date_start ?? '-',
                    'total_per_pax' => $booking->grand_total / $booking->total_pax,
                    'total' => $booking->grand_total,
                    'total_add_on' => $booking->book_add_on_total,
                    'grand_total' => $booking->grand_total + $booking->book_add_on_total,
                    'payment' => $booking->payment,
                    'balance' => $booking->balance,
                    'payment_status' => $booking->payment == 0 ? 'Unpaid' : ($booking->balance <= 0 ? 'Paid' : 'DP Paid'),
                    'booking_payment' => $booking->bookingPayment,
                    'add_on' => $booking->bookAddOn,
                ];
            });
        $packages = Package::where('is_publish', '1')->orWhere('package_platform', 'klook')->orderBy('package_code')->get(['id', 'package_code', 'name']);

        $filters = $request->only(['search', 'package', 'channel']);
        $filters['start_date'] = $startDate;
        $filters['end_date'] = $endDate;

        return Inertia::render('Finance/InvoiceManager', [
            'booking' => $booking,
            'summary' => $summary,
            'packages' => $packages,
            'filters' => $filters,
        ]);
    }
    private function getSummaryData($yearMonth, $channel = 'all', $dateType)
    {
        // Get all bookings for summary
        $lastYearMonth = date('Y-m', strtotime($yearMonth . "-01 -1 months"));

        $allBookingsQuery = Booking::with(['user', 'bookingDetail.package'])
            ->where('travel_date_start', 'like', '%' . $yearMonth . '%');

        if ($channel == 'jvto') {
            $allBookingsQuery = $allBookingsQuery->where('agent_id', 2)->where('booking_category_id', '!=', 3);
        } else if ($channel == 'klook') {
            $allBookingsQuery = $allBookingsQuery->where('agent_id', 2)->where('booking_category_id', 3);
        } else if ($channel == 'twt') {
            $allBookingsQuery = $allBookingsQuery->where('agent_id', 1);
        }

        $allBookings = $allBookingsQuery->where('status', 'booked')->get();

        // Calculate totals
        $totalBookings = $allBookings->count();

        // Total Paid - from paid payments
        $totalPaid = 0;
        $jvtoPaid = 0;
        $twtPaid = 0;
        $klookPaid = 0;
        if ($channel == 'jvto' || $channel == 'all') {
            if ($dateType == 'trip') {
                $jvtoPaid = BookingPayment::whereHas('booking', function ($booking) use ($yearMonth, $channel) {
                    $booking->where('travel_date_start', 'like', '%' . $yearMonth . '%');
                })->sum('nominal');
            } else {
                $jvtoPaid = BookingPayment::where('created_at', 'like', '%' . $yearMonth . '%')->sum('nominal');
            }
        }
        if ($channel == 'twt' || $channel == 'all') {
            if ($dateType == 'trip') {
                $twtPaid = TwtInvoiceBooking::whereHas('invoice.bookingItems.booking', function ($query) use ($yearMonth) {
                    $query->where('travel_date_start', 'like', '%' . $yearMonth . '%');
                })->sum('total_amount');
            } else {
                $twtPaid = TwtInvoiceBooking::whereHas('invoice.payments', function ($query) use ($yearMonth) {
                    $query->where('payment_date', 'like', '%' . $yearMonth . '%');
                })->sum('total_amount');
            }
        }
        if ($channel == 'klook' || $channel == 'all') {
            if ($dateType == 'payment') {
                $klookPaid = Booking::where('travel_date_start', 'like', '%' . $lastYearMonth . '%')
                    ->where('agent_id', 2)
                    ->where('booking_category_id', 3)
                    ->sum('grand_total');
            }
        }

        $totalPaid = $jvtoPaid + $twtPaid + $klookPaid;

        // Total Pending - from bookings with balance > 0
        $totalPending = 0;
        if ($channel == 'jvto' || $channel == 'all') {
            $totalPending += Booking::where('travel_date_start', 'like', '%' . $yearMonth . '%')
                ->where('agent_id', 2)
                ->where('booking_category_id', '!=', 3)
                ->where('status', 'booked')
                ->where('balance', '>', 0)
                ->sum('balance');
        }

        if ($channel == 'twt' || $channel == 'all') {
            $totalPending += Booking::where('travel_date_start', 'like', '%' . $yearMonth . '%')
                ->where('agent_id', 1)
                ->where('is_invoiced_twt', '0')
                ->sum('grand_total');
        }

        if ($channel == 'klook' || $channel == 'all') {
            $totalPending += Booking::where('travel_date_start', 'like', '%' . $yearMonth . '%')
                ->where('agent_id', 2)
                ->where('booking_category_id', 3)
                ->sum('grand_total');
        }

        // Total Debt
        $totalDebt = $allBookings->sum('total_expense_debt');

        // Total Expense
        $totalExpense = $allBookings->sum('expense_internal_total');

        return [
            'total_bookings' => $totalBookings,
            'total_paid' => (int)$totalPaid,
            'total_pending' => (int)$totalPending,
            'total_debt' => (int)$totalDebt,
            'total_expense' => (int)$totalExpense,
        ];
    }
    function financeManager(Request $request)
    {
        $tab = $request->tab ?? 'all';
        $channel = $request->channel ?? 'all';
        $yearMonth = $request->get('year_month') ? $request->get('year_month') : date('Y-m');
        $dateType = $request->date_type ?? 'payment';
        $lastYearMonth = date('Y-m', strtotime($yearMonth . "-01 -1 months"));
        $booking = [];
        if ($tab == 'all') {
            $booking = Booking::with(['user', 'bookingDetail.package'])->where('travel_date_start', 'like', '%' . $yearMonth . '%');
            if ($channel == 'jvto') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else if ($channel == 'klook') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', 3);
            } else if ($channel == 'twt') {
                $booking = $booking->where('agent_id', 1);
            }
            $booking = $booking->where('status', 'booked')->orderBy('travel_date_start', 'asc')->get()->map(function ($data) {
                $days = $data->package_duration;
                $nights = $days - 1;
                $per_pax = $data->grand_total / $data->total_pax;

                $channel = $data->agent_id == 1 ? 'TWT' : ($data->booking_category_id == 3 ? 'KLOOK' : 'JVTO');

                return [
                    'id' => $data->id,
                    'channel' => $channel,
                    'user' => [
                        'name' => $data->user->name,
                        'pax' => $data->total_pax,
                    ],
                    'package' => [
                        'duration' => $days . "D " . $nights . "N",
                        'package_name' => $data->bookingDetail[0]->package ? $data->bookingDetail[0]->package->name : ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                        'package_url' => $data->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/" . $data->bookingDetail[0]->package->new_slug : null,
                        'price_per_pax'  => (int)$per_pax,
                    ],
                    'booking' => [
                        'booking_date'  => $data->booking_date,
                        'booking_code' => $data->booking_code,
                        'travel_date_start'  => $data->travel_date_start,
                        'travel_date_end'  => $data->travel_date_end,
                        'grand_total'  => (int)$data->grand_total,
                        'pickup' => [
                            'meeting_point' => $data->meeting_point,
                            'meeting_point_arrival' => $data->meeting_point_arrival,
                            'meeting_point_value' => $data->meeting_point_value,
                            'pickup_time' => date("H:i", strtotime($data->pickup_time)),
                            'text' => $data->pickup
                        ],
                        'dropoff' => [
                            'drop_point' => $data->drop_point,
                            'drop_point_arrival' => $data->drop_point_arrival,
                            'drop_point_value' => $data->drop_point_value,
                            'drop_time' => date("H:i", strtotime($data->drop_time)),
                            'text' => $data->drop
                        ],

                    ],
                ];
            });
        } else if ($tab == 'paid') {

            $jvto = [];
            $twt = [];
            $klook = [];

            if ($channel == 'jvto' || $channel == 'all') {
                $jvto = BookingPayment::with(['booking.user', 'booking.bookingDetail.package', 'paymentMethod']);

                if ($dateType == 'trip') {
                    $jvto = $jvto->whereHas('booking', function ($booking) use ($yearMonth) {
                        $booking->where('travel_date_start', 'like', '%' . $yearMonth . '%');
                    });
                } else {
                    $jvto = $jvto->where('booking_payments.created_at', 'like', '%' . $yearMonth . '%');
                }
                $jvto = $jvto->join('bookings', 'bookings.id', '=', 'booking_payments.booking_id')
                    ->orderBy('bookings.travel_date_start', 'asc')
                    ->select('booking_payments.*')
                    ->orderBy('created_at', 'asc')->get()->map(function ($data) {
                        $countBefore = BookingPayment::where('booking_id', $data->booking_id)->where('id', '<=', $data->id)->count();
                        $days = $data->booking->package_duration;
                        $nights = $days - 1;
                        $per_pax = $data->booking->grand_total / $data->booking->total_pax;

                        return [
                            'id' => $data->id,
                            'channel' => 'JVTO',
                            'user' => [
                                'user' => $data->booking->user->name,
                                'pax' => $data->booking->total_pax,
                            ],
                            'package' => [
                                'duration' => $days . "D " . $nights . "N",
                                'package_name' => $data->booking->bookingDetail[0]->package ? $data->booking->bookingDetail[0]->package->name : ($data->booking->package_duration > 1 ? $data->booking->package_duration . "D " . ($data->booking->package_duration - 1) . "N Package" : $data->booking->package_duration . "D " . ($data->booking->package_duration) . "N Package"),
                                'package_url' => $data->booking->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/" . $data->booking->bookingDetail[0]->package->new_slug : null,
                                'price_per_pax'  => (int)$per_pax,
                            ],
                            'booking' => [
                                'booking_id' => $data->booking_id,
                                'booking_date' => $data->booking->booking_date,
                                'booking_code' => $data->booking->booking_code,
                                'travel_date_start'  => $data->booking->travel_date_start,
                                'travel_date_end'  => $data->booking->travel_date_end,
                                'grand_total'  => (int)$data->booking->grand_total,
                                'is_add_on' => $data->booking->book_add_on_total > 0 ? true : false,
                                'paid_at' => $data->created_at,
                            ],
                            'payment' => [
                                'id' => $data->id,
                                'nominal' => (int)$data->nominal,
                                'payment_method' => $data->paymentMethod->name,
                                'reference' => $data->reference,
                                'description' => $data->description,
                                'receipt' => str_replace('JVR', 'RCP', $data->booking->booking_code) . "/" . $countBefore,
                                'paid_at' => $data->created_at,
                            ]
                        ];
                    });
            }
            if ($channel == 'twt' || $channel == 'all') {
                $twt = TwtInvoiceBooking::with(['booking.user', 'invoice.payments' => function ($query) {
                    $query->orderBy('payment_date', 'asc');
                }]);
                if ($dateType == 'trip') {
                    $twt = $twt->whereHas('booking', function ($query) use ($yearMonth) {
                        $query->where('travel_date_start', 'like', '%' . $yearMonth . '%');
                    });
                } else {
                    $twt = $twt->whereHas('invoice.payments', function ($query) use ($yearMonth) {
                        $query->where('payment_date', 'like', '%' . $yearMonth . '%');
                    });
                }
                $twt = $twt->whereHas('invoice', function ($query) {
                    $query->where('status', '!=', 'unpaid');
                })->get()->sortBy(function ($item) {
                    return optional($item->invoice->payments->sortBy('payment_date')->last())->payment_date;
                })->values()->map(function ($data) {
                    $days = $data->booking->package_duration;
                    $nights = $days - 1;
                    $per_pax = $data->booking->grand_total / $data->booking->total_pax;

                    return [
                        'id' => $data->booking->id,
                        'channel' => 'TWT',
                        'user' => [
                            'user' => $data->booking->user->name,
                            'pax' => $data->booking->total_pax,
                        ],
                        'package' => [
                            'duration' => $days . "D " . $nights . "N",
                            'package_name' => ($data->booking->package_duration > 1 ? $data->booking->package_duration . "D " . ($data->booking->package_duration - 1) . "N Package" : $data->booking->package_duration . "D " . ($data->booking->package_duration) . "N Package"),
                            'package_url' => null,
                            'price_per_pax'  => (int)$per_pax,
                        ],
                        'booking' => [
                            'booking_id' => $data->booking->id,
                            'booking_date' => $data->booking->booking_date,
                            'booking_code' => $data->booking->invoice_code_origin,
                            'travel_date_start'  => $data->booking->travel_date_start,
                            'travel_date_end'  => $data->booking->travel_date_end,
                            'grand_total'  => (int)$data->booking->grand_total,
                            'is_add_on' => $data->booking->book_add_on_total > 0 ? true : false,
                            'paid_at' => $data->invoice->payments->first()->payment_date,
                        ],
                        'payment' => $data->invoice->payments->map(function ($payment) use ($data) {
                            $countPayment = TwtInvoicePayment::where('invoice_id', $data->invoice->id)->where('id', '<=', $payment->id)->count();
                            return [
                                'id' => $payment->id,
                                'nominal' => (int)$payment->amount,
                                'payment_method' => "TRANSFER",
                                'reference' => "https://twt.javavolcano-touroperator.com/storage/" . $payment->transaction_reference,
                                'description' => $payment->notes ?? "-",
                                'receipt' => $data->invoice->invoice_number,
                                'receipt_url' => "https://twt.javavolcano-touroperator.com/finance/invoices/" . $data->invoice->id,
                                'paid_at' => $payment->payment_date,
                            ];
                        })
                    ];
                });
            }
            if ($channel == 'klook' || $channel == 'all') {
                if ($dateType == 'payment') {
                    $klook = Booking::with('user')
                        ->where('travel_date_start', 'like', '%' . $lastYearMonth . '%')
                        ->where('agent_id', 2)
                        ->where('booking_category_id', 3)
                        ->orderBy('travel_date_start', 'asc')->get()->map(function ($data) use ($yearMonth) {
                            $days = $data->package_duration;
                            $nights = $days - 1;
                            $per_pax = $data->grand_total / $data->total_pax;

                            return [
                                'id' => $data->id,
                                'channel' => 'KLOOK',
                                'user' => [
                                    'user' => $data->user->name,
                                    'pax' => $data->total_pax,
                                ],
                                'package' => [
                                    'duration' => $days . "D " . $nights . "N",
                                    'package_name' => ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                                    'package_url' => null,
                                    'price_per_pax'  => (int)$per_pax,
                                ],
                                'booking' => [
                                    'booking_id' => $data->id,
                                    'booking_date' => $data->booking_date,
                                    'booking_code' => $data->invoice_code_origin,
                                    'travel_date_start'  => $data->travel_date_start,
                                    'travel_date_end'  => $data->travel_date_end,
                                    'grand_total'  => (int)$data->grand_total,
                                    'is_add_on' => $data->book_add_on_total > 0 ? true : false,
                                    'paid_at' => $yearMonth . "-05 00:00:00",
                                ],
                                'payment' => [
                                    'id' => null,
                                    'nominal' => (int)$data->grand_total,
                                    'payment_method' => "-",
                                    'reference' => "-",
                                    'description' => "-",
                                    'receipt' => "-",
                                    'paid_at' => $yearMonth . "-05 00:00:00",
                                ]
                            ];
                        });
                }
            }
            if ($channel == 'jvto') {
                $booking = $jvto->merge($twt)->merge($klook);
            } else if ($channel == 'twt') {
                $booking = $twt->merge($jvto)->merge($klook);
            } else if ($channel == 'klook') {
                if ($dateType == 'payment') {
                    $booking = $klook->merge($jvto)->merge($twt);
                } else {
                    $booking = [];
                }
            } else {
                $booking = $klook->merge($jvto)->merge($twt);
            }

            if (count($booking) > 0) {
                if ($dateType == 'trip') {
                    $booking = $booking->sortBy('booking.travel_date_start')->values();
                } else {
                    $booking = $booking->sortByDesc('booking.paid_at')->values();
                }
            }
        } else if ($tab == 'pending') {

            $jvto = [];
            $twt = [];
            $klook = [];

            if ($channel == 'jvto' || $channel == 'all') {
                $jvto = Booking::with(['user', 'bookingDetail.package'])->where('agent_id', 2)->where('booking_category_id', '!=', 3)
                    ->where('status', 'booked')
                    ->where('travel_date_start', 'like', '%' . $yearMonth . '%')
                    ->where('balance', '>', 0)->orderBy('travel_date_start', 'asc')->get();

                $jvto = $jvto->map(function ($data) {
                    $days = $data->package_duration;
                    $nights = $days - 1;
                    $per_pax = $data->grand_total / $data->total_pax;

                    return [
                        'id' => $data->id,
                        'channel' => 'JVTO',
                        'user' => [
                            'user' => $data->user->name,
                            'pax' => $data->total_pax,
                        ],
                        'package' => [
                            'duration' => $days . "D " . $nights . "N",
                            'package_name' => $data->bookingDetail[0]->package ? $data->bookingDetail[0]->package->name : ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                            'package_url' => $data->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/" . $data->bookingDetail[0]->package->new_slug : null,
                            'price_per_pax'  => (int)$per_pax,
                        ],
                        'booking' => [
                            'booking_id' => $data->booking_id,
                            'booking_date' => $data->booking_date,
                            'booking_code' => $data->booking_code,
                            'travel_date_start'  => $data->travel_date_start,
                            'travel_date_end'  => $data->travel_date_end,
                            'grand_total'  => (int)$data->grand_total,
                            'is_add_on' => $data->book_add_on_total > 0 ? true : false,
                        ],
                        'pending_payment' => [
                            'nominal' => (int)$data->balance,
                            'payment_method' => $data->outstanding_payment_method ?? "-",
                            'payment_method_link' => $data->outstanding_payment_method_link ?? "-",
                        ]
                    ];
                });
            }
            if ($channel == 'twt' || $channel == 'all') {
                $twt = Booking::with('user')
                    ->where('travel_date_start', 'like', '%' . $yearMonth . '%')
                    ->where('agent_id', 1)
                    ->where('is_invoiced_twt', '0')
                    ->orderBy('travel_date_start', 'asc')->get()->map(function ($data) {
                        $days = $data->package_duration;
                        $nights = $days - 1;
                        $per_pax = $data->grand_total / $data->total_pax;

                        return [
                            'id' => $data->id,
                            'channel' => 'TWT',
                            'user' => [
                                'user' => $data->user->name,
                                'pax' => $data->total_pax,
                            ],
                            'package' => [
                                'duration' => $days . "D " . $nights . "N",
                                'package_name' => ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                                'package_url' => null,
                                'price_per_pax'  => (int)$per_pax,
                            ],
                            'booking' => [
                                'booking_id' => $data->id,
                                'booking_date' => $data->booking_date,
                                'booking_code' => $data->invoice_code_origin,
                                'travel_date_start'  => $data->travel_date_start,
                                'travel_date_end'  => $data->travel_date_end,
                                'grand_total'  => (int)$data->grand_total,
                                'is_add_on' => $data->book_add_on_total > 0 ? true : false,
                            ],
                            'pending_payment' => [
                                'nominal' => (int)$data->grand_total,
                                'payment_method' => "-",
                                'payment_method_link' => "-",
                            ]
                        ];
                    });
            }
            if ($channel == 'klook' || $channel == 'all') {
                $klook = Booking::with('user')
                    ->where('travel_date_start', 'like', '%' . $yearMonth . '%')
                    ->where('agent_id', 2)
                    ->where('booking_category_id', 3)
                    ->orderBy('travel_date_start', 'asc')->get()->map(function ($data) {
                        $days = $data->package_duration;
                        $nights = $days - 1;
                        $per_pax = $data->grand_total / $data->total_pax;

                        return [
                            'id' => $data->id,
                            'channel' => 'KLOOK',
                            'user' => [
                                'user' => $data->user->name,
                                'pax' => $data->total_pax,
                            ],
                            'package' => [
                                'duration' => $days . "D " . $nights . "N",
                                'package_name' => ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                                'package_url' => null,
                                'price_per_pax'  => (int)$per_pax,
                            ],
                            'booking' => [
                                'booking_id' => $data->id,
                                'booking_date' => $data->booking_date,
                                'booking_code' => $data->invoice_code_origin,
                                'travel_date_start'  => $data->travel_date_start,
                                'travel_date_end'  => $data->travel_date_end,
                                'grand_total'  => (int)$data->grand_total,
                                'is_add_on' => $data->book_add_on_total > 0 ? true : false,
                            ],
                            'pending_payment' => [
                                'nominal' => (int)$data->grand_total,
                                'payment_method' => "-",
                                'payment_method_link' => "-",
                            ]
                        ];
                    });
            }
            if ($channel == 'jvto') {
                $booking = $jvto->merge($twt)->merge($klook);
            } else if ($channel == 'twt') {
                $booking = $twt->merge($jvto)->merge($klook);
            } else if ($channel == 'klook' || $channel == 'all') {
                $booking = $klook->merge($jvto)->merge($twt);
            }

            if (count($booking) > 0) {
                $booking = $booking->sortBy('booking.travel_date_start')->values();
            }
        } else if ($tab == 'debt') {
            $booking = Booking::with(['user', 'bookingDetail.package'])->where('travel_date_start', 'like', '%' . $yearMonth . '%');
            if ($channel == 'jvto') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else if ($channel == 'klook') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', 3);
            } else if ($channel == 'twt') {
                $booking = $booking->where('agent_id', 1);
            }
            $booking = $booking->where('status', 'booked')->get()->map(function ($data) {
                $days = $data->package_duration;
                $nights = $days - 1;
                $per_pax = $data->grand_total / $data->total_pax;

                $channel = $data->agent_id == 1 ? 'TWT' : ($data->booking_category_id == 3 ? 'KLOOK' : 'JVTO');

                return [
                    'id' => $data->id,
                    'channel' => $channel,
                    'user' => [
                        'name' => $data->user->name,
                        'pax' => $data->total_pax,
                    ],
                    'package' => [
                        'duration' => $days . "D " . $nights . "N",
                        'package_name' => $data->bookingDetail[0]->package ? $data->bookingDetail[0]->package->name : ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                        'package_url' => $data->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/" . $data->bookingDetail[0]->package->new_slug : null,
                        'price_per_pax'  => (int)$per_pax,
                    ],
                    'booking' => [
                        'booking_date'  => $data->booking_date,
                        'booking_code' => $data->booking_code,
                        'travel_date_start'  => $data->travel_date_start,
                        'travel_date_end'  => $data->travel_date_end,
                        'grand_total'  => (int)$data->grand_total,
                        'debt'  => (int)$data->total_expense_debt
                    ],
                ];
            });
        } else if ($tab == 'expense') {
            $booking = Booking::with(['user', 'bookingDetail.package'])->where('travel_date_start', 'like', '%' . $yearMonth . '%');
            if ($channel == 'jvto') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', '!=', 3);
            } else if ($channel == 'klook') {
                $booking = $booking->where('agent_id', 2)->where('booking_category_id', 3);
            } else if ($channel == 'twt') {
                $booking = $booking->where('agent_id', 1);
            }
            $booking = $booking->where('status', 'booked')->get()->map(function ($data) {
                $days = $data->package_duration;
                $nights = $days - 1;
                $per_pax = $data->grand_total / $data->total_pax;

                $channel = $data->agent_id == 1 ? 'TWT' : ($data->booking_category_id == 3 ? 'KLOOK' : 'JVTO');

                return [
                    'id' => $data->id,
                    'channel' => $channel,
                    'user' => [
                        'name' => $data->user->name,
                        'pax' => $data->total_pax,
                    ],
                    'package' => [
                        'duration' => $days . "D " . $nights . "N",
                        'package_name' => $data->bookingDetail[0]->package ? $data->bookingDetail[0]->package->name : ($data->package_duration > 1 ? $data->package_duration . "D " . ($data->package_duration - 1) . "N Package" : $data->package_duration . "D " . ($data->package_duration) . "N Package"),
                        'package_url' => $data->bookingDetail[0]->package ? "https://javavolcano-touroperator.com/" . $data->bookingDetail[0]->package->new_slug : null,
                        'price_per_pax'  => (int)$per_pax,
                    ],
                    'booking' => [
                        'booking_date'  => $data->booking_date,
                        'booking_code' => $data->booking_code,
                        'travel_date_start'  => $data->travel_date_start,
                        'travel_date_end'  => $data->travel_date_end,
                        'grand_total'  => (int)$data->grand_total,
                        'total_expense'  => (int)$data->expense_internal_total,
                        'crew_expense'  => (int)$data->total_expense_crew,
                    ],
                ];
            });
        }
        $summary = $this->getSummaryData($yearMonth, $channel, $dateType);
        //  return $booking;
        return Inertia::render('Finance/FinanceManager', [
            'booking' => $booking, // Array hasil dari controller
            'summary' => $summary,
            'filters' => [
                'tab' => $tab,
                'channel' => $channel,
                'year_month' => $yearMonth,
                'date_type' => $dateType,
            ],
        ]);
    }
    // function financeManager(Request $request){
    //     $yearMonth = $request->get('year_month') ? $request->get('year_month') : date('Y-m');
    //     $query = Booking::with(['user.country','bookingDetail' => function($q){
    //         $q->select('id','package_id','booking_id')->with('package',function($qq){
    //             $qq->select('id','name','package_code');
    //         });
    //     }, 'guideDriver'])->where('agent_id',2)->where('booking_category_id','!=',3)->where('travel_date_start','like','%'.$yearMonth.'%')->orderBy('travel_date_start','asc');

    //     $booking = $query->get()
    //         ->map(function($booking) {
    //             $night = $booking->package_duration-1;
    //             $channel = 'JVTO';
    //             $paid_date = null;
    //             if ($booking->balance == 0) {
    //                 $lastPayment = BookingPayment::where('booking_id', $booking->id)
    //                     ->orderBy('id', 'desc')  // Or use created_at if that's more appropriate
    //                     ->first();
    //                 $paid_date = $lastPayment ? $lastPayment->created_at : null;

    //                 // Then sum all payments except the one with that ID
    //                 $dp = BookingPayment::where('booking_id', $booking->id)
    //                     ->when($lastPayment, function ($query) use ($lastPayment) {
    //                         return $query->where('id', '!=', $lastPayment->id);
    //                     })
    //                     ->sum('nominal');
    //             } else {
    //                 $dp = $booking->dp;
    //             }

    //             if($booking->status != 'booked'){
    //                 $status = 'pending';
    //             }
    //             else{
    //                 if($booking->balance == 0){
    //                     $status = 'paid';
    //                 }
    //                 else{
    //                     $status = 'outstanding';
    //                 }
    //             }
    //             $grand_total = $booking->grand_total+$booking->book_add_on_total;
    //             $outstanding = $grand_total-$dp;
    //             return [
    //                 'id' => $booking->id,
    //                 'booking_id' => $channel."-".$booking->id,
    //                 'user_id' => $booking->user_id,
    //                 'name' => $booking->user->name,
    //                 'numb_of_pax' => $booking->total_pax ?? 0,
    //                 'duration' => $booking->package_duration."D ".$night."N",
    //                 'start_date' => $booking->travel_date_start ?? '-',
    //                 'end_date' => $booking->travel_date_end ?? '-',
    //                 'grand_total' => (int)$grand_total,
    //                 'deposit' => (int)$dp,
    //                 'final_payment' => (int)$outstanding,
    //                 'payment_method' => $booking->outstanding_payment_method,
    //                 'paid_date' => $paid_date ? date('d M Y', strtotime($paid_date)) : '-',
    //                 'expense' => (int)$booking->expense_internal_total,
    //                 'expense_paid' => (int)$booking->total_expense_paid,
    //                 'expense_debt' => (int)$booking->total_expense_debt,
    //                 'expense_crew' => (int)$booking->total_expense_crew,
    //                 'crews' => $booking->guideDriver->map(function($crew){
    //                     return [
    //                         'id' => $crew->person->id,
    //                         'name' => $crew->person->name,
    //                     ];
    //                 }),
    //                 'status' => $status,
    //             ];
    //         });

    //         return Inertia::render('Finance/FinanceManager', [
    //         'booking' => $booking,
    //         'filters' => [
    //             'year_month' => $yearMonth,
    //         ],
    //     ]);
    // }
    function editExpense($id)
    {
        $booking = Booking::select('id', 'user_id', 'total_pax', 'travel_date_start', 'travel_date_end', 'grand_total', 'agent_id', 'booking_category_id', 'booking_date', 'package_duration', 'invoice_code_origin', 'url', 'payment_proof_expense', 'note', 'balance')->with(['user' => function ($query) {
            $query->select('id', 'name');
        }, 'bookingDetail' => function ($query) {
            $query->select('id', 'package_id', 'booking_id')->with(['package' => function ($q) {
                $q->select('id', 'name', 'duration_id', 'url')->with('duration');
            }]);
        }, 'bookingPayment'])->where('id', $id)->first();

        $booking->trip_date = date('d M', strtotime($booking->travel_date_start)) . " - " . date('d M Y', strtotime($booking->travel_date_end));
        $pax = $booking->total_pax;
        $day = $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->duration->day : $booking->package_duration;
        $booking->duration_day = $day;

        $totalAccommodations = 0;
        $totalDestinations = 0;
        $totalOthers = 0;
        $totalResources = 0;

        $crew = BookGuideDriver::select('id', 'guide_id', 'type', 'guide_ijen')->with(['person' => function ($query) {
            $query->select('id', 'name');
        }])->where('booking_id', $id)->get();
        $car = BookCar::select('id', 'car_id')->with(['car' => function ($query) {
            $query->select('id', 'name');
        }])->where('booking_id', $id)->get();
        $booking->crew = $crew;
        $booking->car = $car;
        $bookRoom = BookHotel::select('id', 'booking_id', 'hotel_id', 'b', 'l', 'd', 'is_paid', 'is_debt', 'debt_payment_id')->with(['hotel' => function ($query) {
            $query->select('id', 'name', 'lunch_rate', 'dinner_rate');
        }, 'bookRoom' => function ($query) {
            $query->select('id', 'book_hotel_id', 'room_hotel_id', 'quantity', 'subtotal')->with(['roomHotel' => function ($q) {
                $q->select('id', 'room_name', 'rate');
            }]);
        }, 'bookHotelMeal'])->where('booking_id', $id)
            ->get()
            ->map(function ($booking) use ($pax, &$totalAccommodations) {
                if ($booking->l == '1') {
                    $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id', $booking->id)->where('meals', 'lunch')->first();
                    $lunchTotal = $cekBookHotelMeals && $cekBookHotelMeals->subtotal ? $cekBookHotelMeals->subtotal : 0;;
                    if (!$cekBookHotelMeals) {
                        $lunch = new BookHotelMeal;
                        $lunch->book_hotel_id = $booking->id;
                        $lunch->booking_id = $booking->booking_id;
                        $lunch->hotel_id = $booking->hotel_id;
                        $lunch->meals = 'lunch';
                        $lunch->qty = $pax;
                        $lunch->price = $booking->hotel->lunch_rate;
                        $lunch->subtotal = $pax * $booking->hotel->lunch_rate;
                        $lunch->save();
                        $lunchTotal = $lunch->subtotal;
                    }
                    $totalAccommodations += $lunchTotal;
                } else {
                    BookHotelMeal::where('book_hotel_id', $booking->id)->where('meals', 'lunch')->delete();
                }
                if ($booking->d == '1') {
                    $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id', $booking->id)->where('meals', 'dinner')->first();
                    $dinnerTotal = $cekBookHotelMeals && $cekBookHotelMeals->subtotal ? $cekBookHotelMeals->subtotal : 0;;

                    if (!$cekBookHotelMeals) {
                        $dinner = new BookHotelMeal;
                        $dinner->book_hotel_id = $booking->id;
                        $dinner->booking_id = $booking->booking_id;
                        $dinner->hotel_id = $booking->hotel_id;
                        $dinner->meals = 'dinner';
                        $dinner->qty = $pax;
                        $dinner->price = $booking->hotel->dinner_rate;
                        $dinner->subtotal = $pax * $booking->hotel->dinner_rate;
                        $dinner->save();

                        $dinnerTotal = $dinner->subtotal;
                    }
                    $totalAccommodations += $dinnerTotal;
                } else {
                    BookHotelMeal::where('book_hotel_id', $booking->id)->where('meals', 'dinner')->delete();
                }

                $booking->bookRoom->map(function ($room) use (&$totalAccommodations) {
                    if ($room->subtotal == null) {
                        $room->subtotal = $room->roomHotel->rate * $room->quantity;
                        $room->save();
                    }
                    $totalAccommodations += $room->subtotal;
                    return $room;
                });
                return $booking;
            });

        if ($booking->agent_id == 1) {
            $channel = 'twt';
            $booking->reference = $booking->invoice_code_origin;
        } else if ($booking->agent_id == 2) {
            if ($booking->booking_category_id == 3) {
                $channel = 'klook';
                $booking->reference = $booking->invoice_code_origin;
            } else {
                $booking->reference = "JVTO-" . $booking->id;
                $channel = 'jvto';
            }
        }
        $booking->channel = strtoupper($channel);

        $cekDestinations = BookDestinationActivity::where('booking_id', $id)->count();
        $cekOthers = BookOthersActivity::where('booking_id', $id)->count();
        $packageId = $booking->bookingDetail[0]->package_id;
        $agentId = $booking->agent_id;
        $bookinCategoryId = $booking->booking_category_id;

        if ($cekDestinations == 0) {
            $getDestinationActivities = Itinerary::with(['itineraryDestination.destination.activity' => function ($query) use ($agentId, $bookinCategoryId) {
                if ($agentId == 1) {
                    $query->where('is_default_twt', '1');
                } else if ($agentId == 2) {
                    if ($bookinCategoryId == 3) {
                        $query->where('is_default_klook', '1');
                    } else {
                        $query->where('is_default_jvto', '1');
                    }
                }
            }, 'itineraryDestination.secondDestination.activity' =>  function ($query) use ($agentId, $bookinCategoryId) {
                if ($agentId == 1) {
                    $query->where('is_default_twt', '1');
                } else if ($agentId == 2) {
                    if ($bookinCategoryId == 3) {
                        $query->where('is_default_klook', '1');
                    } else {
                        $query->where('is_default_jvto', '1');
                    }
                }
            }])->where('package_id', $packageId)->get()->map(function ($itinerary) use ($pax, $day, $id) {
                if (!empty($itinerary->itineraryDestination->destination->activity)) {
                    $itinerary->itineraryDestination->destination->activity->map(function ($activity) use ($itinerary, $pax, $day, $id) {
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
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty * $activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";
                        $bookDestinationActivity->save();
                    });
                }
                if (!empty($itinerary->itineraryDestination->secondDestination->activity)) {
                    $itinerary->itineraryDestination->secondDestination->activity->map(function ($activity) use ($itinerary, $pax, $day, $id) {
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
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty * $activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";
                        $bookDestinationActivity->save();
                    });
                }
            });
        }
        $destinations = BookDestinationActivity::select('id', 'destination_id', 'destination_activity_id', 'qty', 'price', 'subtotal', 'status_paid', 'is_debt', 'debt_payment_id')->with(['destination' => function ($query) {
            $query->select('id', 'name');
        }, 'destinationActivity' => function ($query) {
            $query->select('id', 'name', 'unit');
        }])->where('booking_id', $id)->get()

            ->map(function ($activity) use (&$totalDestinations) { // Gunakan reference
                $totalDestinations += $activity->subtotal;
                return $activity;
            })
            ->groupBy(fn($item) => $item->destination->name);

        if ($cekOthers == 0) {
            $getOthers = OthersActivity::where('is_default', '1')->get()->map(function ($others) use ($id, $pax, $day) {
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
                $insertOthers->subtotal = $insertOthers->qty * $others->price;
                $insertOthers->status_paid = 'unpaid';
                $insertOthers->save();
            });
        }

        $others = BookOthersActivity::with('othersActivity')
            ->where('booking_id', $id)
            ->get()
            ->map(function ($other) use (&$totalOthers) { // Gunakan reference
                $totalOthers += $other->subtotal;
                return $other;
            });

        $cekCar = CarConfiguration::with(['crewJvtoRole', 'crewTwtRole', 'crewKlookRole'])->where('pax', $pax);
        $isCarExist = false;
        if ($booking->agent_id == 1) {
            $cekCar = $cekCar->whereNotNull('crew_twt_role_id');
            $isCarExist = true;
        } else if ($booking->agent_id == 2) {
            $isCarExist = true;
            if ($booking->booking_category_id == 3) {
                $cekCar = $cekCar->whereNotNull('crew_klook_role_id');
            } else {
                $cekCar = $cekCar->whereNotNull('crew_jvto_role_id');
            }
        }

        if ($isCarExist) {
            $cekCar = $cekCar->first();

            $cekCarActivities = BookCarActivity::where('booking_id', $id)->count();
            if ($cekCarActivities == 0 && $cekCar) {
                $insertCar = new BookCarActivity;
                $insertCar->booking_id = $id;
                $insertCar->car_id = $cekCar->car_id;
                $insertCar->qty = $day;
                $insertCar->price = $cekCar->price;
                $insertCar->subtotal = $insertCar->qty * $insertCar->price;
                $insertCar->status_paid = 'unpaid';
                $insertCar->save();
            }
        }

        $resources['cars'] = BookCarActivity::with(['car' => function ($query) {
            $query->select('id', 'name');
        }])
            ->where('booking_id', $id)
            ->get()
            ->map(function ($car) use (&$totalResources) { // Gunakan reference
                $totalResources += $car->subtotal;
                return $car;
            });

        $resources['crews'] = BookCrewActivity::with(['crewRole' => function ($query) {
            $query->select('id', 'role');
        }])
            ->where('booking_id', $id)
            ->get()
            ->map(function ($crew) use (&$totalResources) { // Gunakan reference
                $totalResources += $crew->subtotal;
                return $crew;
            });
        $bookAddOn = BookAddOn::with(['addOn' => function ($query) {
            $query->select('id', 'add_on', 'price', 'is_transport', 'type_transport');
        }])->where('booking_id', $id)->get()->map(function ($addOn) {
            return [
                'id' => $addOn->id,
                'add_on_id' => $addOn->add_on_id,
                'name' => $addOn->addOn->is_transport == '1' ? "Transport to " . ucwords(strtolower($addOn->addOn->add_on)) . " (" . ucfirst($addOn->addOn->type_transport) . ")" : $addOn->addOn->add_on,
                'qty' => $addOn->qty,
                'price' => (int)$addOn->price_expense,
                'subtotal' => $addOn->qty * $addOn->price_expense,
                'is_debt'  => '0',
                'debt_payment_id' => null,
                'status_paid' => 'unpaid',
            ];
        });
        $listForNewItems['destinations'] = DestinationActivity::with(['destination' => function ($query) {
            $query->select('id', 'name');
        }])->select('id', 'destination_id', 'name', 'price');
        if ($channel == 'twt') {
            $orderChannelID = 2;
        } else if ($channel == 'jvto') {
            $orderChannelID = 1;
        } else if ($channel == 'klook') {
            $orderChannelID = 3;
        }
        $listForNewItems['destinations'] = $listForNewItems['destinations']->get()->groupBy(fn($item) => $item->destination->name);
        $listForNewItems['others'] = OthersActivity::get();
        $listForNewItems['cars'] = Car::whereIn('id', [1, 2, 4, 5, 14, 24, 7, 25])->get();
        $listForNewItems['crews'] = CrewRole::where('order_channel_id', $orderChannelID)->get();
        $listForNewItems['add_on'] = AddOn::get()->map(function ($data) {
            return [
                'id' => $data->id,
                'name' => $data->is_transport == '1' ? "Transport to " . ucwords(strtolower($data->add_on)) . " (" . ucfirst($data->type_transport) . ")" : $data->add_on,
                'price' => (int)$data->price,
            ];
        });

        $additionalRequests = ExpenseAdditional::with('crew')->where('booking_id', $id)
            ->get()
            ->map(function ($query) {
                return [
                    'id' => $query->id,
                    'item' => $query->item,
                    'qty' => $query->qty,
                    'request_by' => $query->request_by,
                    'request_date' => $query->request_date,
                    'price' => (int)$query->price,
                    'subtotal' => (int)$query->subtotal,
                    'image' => $query->image,
                    'bill' => $query->bill,
                    'submit_date' => $query->submit_date,
                    'submit_by' => $query->crew->name ?? null,
                ];
            });

        $expenseRefund = ExpenseRefund::where('booking_id', $id)->orderBy('id', 'desc')->get()->map(function ($query) {
                return [
                    'id' => $query->id,
                    'item' => $query->item,
                    'refund_to' => $query->refund_to ?? 'office',
                    'proof_image' => $query->proof_image,
                    'price' => $query->price,
                    'qty' => $query->qty,
                    'subtotal' => $query->subtotal,
                    'status' => $query->status,
                ];
        });

        // return [
        //     'additionalRequests' => $additionalRequests,
        //     'expenseRefund' => $expenseRefund,

        // ];
        
        
        return Inertia::render('Finance/EditExpenseManager', [
            'additionalRequests' => $additionalRequests,
            'expenseRefund' => $expenseRefund,
            'booking' => $booking,
            'accommodations' => $bookRoom,
            'destinations' => $destinations,
            'resources' => $resources,
            'others' => $others,
            'addOn' => $bookAddOn,
            'listForNewItems' => $listForNewItems,
            'paymentHistory' => $booking->bookingPayment->map(function ($payment) use ($booking) {
                return [
                    'id' => $payment->id,
                    'nominal' => $payment->nominal,
                    'paymentMethod' => $payment->paymentMethod->name,
                    'description' => $payment->description,
                    'reference' => $payment->reference,
                    'receipt' => "https://legacy.javavolcano-touroperator.com/backoffice/invoice/view-receipt/" . $booking->id . "/partial/" . $payment->id,
                    'date' => date('d M y H:i', strtotime($payment->created_at)),
                ];
            })
        ]);
    }
    function updateExpense(Request $request)
    {
        // return  dd($request->summary);
        $booking = Booking::where('id', $request->booking_id)->first();
        // Accommodation updates (unchanged)
        if ($request->accommodations) {
            foreach ($request->accommodations as $key => $value) {
                $bookHotel = BookHotel::find($value['hotel_id']);
                $bookHotel->is_paid = $value['is_paid'];
                $bookHotel->is_debt = $value['is_debt'];
                if ($bookHotel->is_paid == '1') {
                    $bookHotel->paid_at = date('Y-m-d H:i:s');
                } else {
                    $bookHotel->paid_at = null;
                }
                $bookHotel->save();

                if (count($request->accommodations[$key]['rooms']) != 0) {
                    foreach ($request->accommodations[$key]['rooms'] as $index => $val) {
                        $bookRoom = BookRoomHotel::find($val['id']);
                        $bookRoom->quantity = $val['quantity'];
                        $bookRoom->subtotal = $val['quantity'] * $val['rate'];
                        $bookRoom->save();
                    }
                }

                if (count($request->accommodations[$key]['meals']) != 0) {
                    foreach ($request->accommodations[$key]['meals'] as $index => $val) {
                        $bookHotelMeals = BookHotelMeal::find($val['id']);
                        $bookHotelMeals->qty = $val['qty'];
                        $bookHotelMeals->price = $val['price'];
                        $bookHotelMeals->subtotal = $val['qty'] * $val['price'];
                        $bookHotelMeals->save();
                    }
                }
            }
        }

        // Destination Activities - Granular updates
        if ($request->destinations) {
            // Delete items marked for deletion
            if (!empty($request->destinations['deleted'])) {
                BookDestinationActivity::whereIn('id', $request->destinations['deleted'])->delete();
            }

            // Update modified items
            if (!empty($request->destinations['modified'])) {
                foreach ($request->destinations['modified'] as $item) {
                    $bookDestinationActivity = BookDestinationActivity::find($item['id']);
                    if ($bookDestinationActivity) {
                        $bookDestinationActivity->qty = $item['quantity'];
                        $bookDestinationActivity->price = $item['price'];
                        $bookDestinationActivity->subtotal = $item['quantity'] * $item['price'];
                        $bookDestinationActivity->status_paid = $item['status_paid'];
                        if ($bookDestinationActivity->status_paid == 'paid') {
                            $bookDestinationActivity->paid_date = date('Y-m-d');
                        }
                        $bookDestinationActivity->is_debt = $item['is_debt'];
                        $bookDestinationActivity->save();
                    }
                }
            }

            // Insert new items
            if (!empty($request->destinations['new'])) {
                foreach ($request->destinations['new'] as $item) {
                    // Check if we need to create a new destination activity
                    $destinationActivityId = $item['destination_activity_id'] ?? null;

                    if (empty($destinationActivityId) && isset($item['name'])) {
                        // Create new destination activity
                        $destinationActivity = new DestinationActivity;
                        $destinationActivity->destination_id = $item['destination_id'];
                        $destinationActivity->name = $item['name'];
                        $destinationActivity->destination_activity_code = '';
                        $destinationActivity->unit = 'no';
                        $destinationActivity->formula = '1';
                        $destinationActivity->price = $item['price'];
                        $destinationActivity->is_default_jvto = '0';
                        $destinationActivity->is_default_klook = '0';
                        $destinationActivity->is_default_twt = '0';
                        $destinationActivity->save();

                        // Assign the ID to a local variable
                        $destinationActivityId = $destinationActivity->id;
                    }

                    // Create the booking association
                    $bookDestinationActivity = new BookDestinationActivity;
                    $bookDestinationActivity->booking_id = $request->booking_id;
                    $bookDestinationActivity->destination_id = $item['destination_id'];
                    $bookDestinationActivity->destination_activity_id = $destinationActivityId;
                    $bookDestinationActivity->qty = $item['quantity'];
                    $bookDestinationActivity->price = $item['price'];
                    $bookDestinationActivity->subtotal = $item['quantity'] * $item['price'];
                    $bookDestinationActivity->status_paid = $item['status_paid'];
                    if ($bookDestinationActivity->status_paid == 'paid') {
                        $bookDestinationActivity->paid_date = date('Y-m-d');
                    }
                    $bookDestinationActivity->is_debt = $item['is_debt'];
                    $bookDestinationActivity->save();
                }
            }
        }

        // Others Activities - Granular updates
        if ($request->others) {
            // Delete items marked for deletion
            if (!empty($request->others['deleted'])) {
                BookOthersActivity::whereIn('id', $request->others['deleted'])->delete();
            }

            // Update modified items
            if (!empty($request->others['modified'])) {
                foreach ($request->others['modified'] as $item) {
                    $bookOthersActivity = BookOthersActivity::find($item['id']);
                    if ($bookOthersActivity) {
                        $bookOthersActivity->qty = $item['quantity'];
                        $bookOthersActivity->price = $item['price'];
                        $bookOthersActivity->subtotal = $item['quantity'] * $item['price'];
                        $bookOthersActivity->status_paid = $item['status_paid'];
                        if ($bookOthersActivity->status_paid == 'paid') {
                            $bookOthersActivity->paid_date = date('Y-m-d');
                        }
                        $bookOthersActivity->is_debt = $item['is_debt'];
                        $bookOthersActivity->save();
                    }
                }
            }

            // Insert new items
            if (!empty($request->others['new'])) {
                foreach ($request->others['new'] as $item) {
                    // Check if we need to create a new activity
                    $othersActivityId = $item['others_activity_id'] ?? null;

                    if (empty($othersActivityId)) {
                        $othersActivity = new OthersActivity;
                        $othersActivity->name = $item['name'] ?? 'Unnamed Activity';
                        $othersActivity->other_activity_code = '';
                        $othersActivity->unit = 'no';
                        $othersActivity->formula = '1';
                        $othersActivity->price = $item['price'];
                        $othersActivity->is_default = '0';
                        $othersActivity->save();

                        // Use the newly created ID
                        $othersActivityId = $othersActivity->id;
                    }

                    $bookOthersActivity = new BookOthersActivity;
                    $bookOthersActivity->booking_id = $request->booking_id;
                    $bookOthersActivity->others_activity_id = $othersActivityId;
                    $bookOthersActivity->qty = $item['quantity'];
                    $bookOthersActivity->price = $item['price'];
                    $bookOthersActivity->subtotal = $item['quantity'] * $item['price'];
                    $bookOthersActivity->status_paid = $item['status_paid'];
                    if ($bookOthersActivity->status_paid == 'paid') {
                        $bookOthersActivity->paid_date = date('Y-m-d');
                    }
                    $bookOthersActivity->is_debt = $item['is_debt'];
                    $bookOthersActivity->save();
                }
            }
        }

        // Car Activities - Granular updates
        if ($request->resources['cars']) {
            // Delete items marked for deletion
            if (!empty($request->resources['cars']['deleted'])) {
                BookCarActivity::whereIn('id', $request->resources['cars']['deleted'])->delete();
            }

            // Update modified items
            if (!empty($request->resources['cars']['modified'])) {
                foreach ($request->resources['cars']['modified'] as $item) {
                    $bookCarActivity = BookCarActivity::find($item['id']);
                    if ($bookCarActivity) {
                        $bookCarActivity->qty = $item['quantity'];
                        $bookCarActivity->price = $item['price'];
                        $bookCarActivity->subtotal = $item['quantity'] * $item['price'];
                        $bookCarActivity->status_paid = $item['status_paid'];
                        if ($bookCarActivity->status_paid == 'paid') {
                            $bookCarActivity->paid_date = date('Y-m-d');
                        }
                        $bookCarActivity->is_debt = $item['is_debt'];
                        $bookCarActivity->save();
                    }
                }
            }

            // Insert new items
            if (!empty($request->resources['cars']['new'])) {
                foreach ($request->resources['cars']['new'] as $item) {
                    $bookCarActivity = new BookCarActivity;
                    $bookCarActivity->booking_id = $request->booking_id;
                    $bookCarActivity->car_id = $item['car_id'];
                    $bookCarActivity->qty = $item['quantity'];
                    $bookCarActivity->price = $item['price'];
                    $bookCarActivity->subtotal = $item['quantity'] * $item['price'];
                    $bookCarActivity->status_paid = $item['status_paid'];
                    if ($bookCarActivity->status_paid == 'paid') {
                        $bookCarActivity->paid_date = date('Y-m-d');
                    }
                    $bookCarActivity->is_debt = $item['is_debt'];
                    $bookCarActivity->save();
                }
            }
        }

        // Crew Activities - Granular updates
        if ($request->resources['crews']) {
            // Delete items marked for deletion
            if (!empty($request->resources['crews']['deleted'])) {
                BookCrewActivity::whereIn('id', $request->resources['crews']['deleted'])->delete();
            }

            // Update modified items
            if (!empty($request->resources['crews']['modified'])) {
                foreach ($request->resources['crews']['modified'] as $item) {
                    $bookCrewActivity = BookCrewActivity::find($item['id']);
                    if ($bookCrewActivity) {
                        $bookCrewActivity->qty = $item['quantity'];
                        $bookCrewActivity->price = $item['price'];
                        $bookCrewActivity->subtotal = $item['quantity'] * $item['price'];
                        $bookCrewActivity->status_paid = $item['status_paid'];
                        if ($bookCrewActivity->status_paid == 'paid') {
                            $bookCrewActivity->paid_date = date('Y-m-d');
                        }
                        $bookCrewActivity->is_debt = $item['is_debt'];
                        $bookCrewActivity->save();
                    }
                }
            }

            // Insert new items
            if (!empty($request->resources['crews']['new'])) {
                foreach ($request->resources['crews']['new'] as $item) {
                    $bookCrewActivity = new BookCrewActivity;
                    $bookCrewActivity->booking_id = $request->booking_id;
                    $bookCrewActivity->crew_role_id = $item['crew_role_id'];
                    $bookCrewActivity->qty = $item['quantity'];
                    $bookCrewActivity->price = $item['price'];
                    $bookCrewActivity->subtotal = $item['quantity'] * $item['price'];
                    $bookCrewActivity->status_paid = $item['status_paid'];
                    if ($bookCrewActivity->status_paid == 'paid') {
                        $bookCrewActivity->paid_date = date('Y-m-d');
                    }
                    $bookCrewActivity->is_debt = $item['is_debt'];
                    $bookCrewActivity->save();
                }
            }
        }
        if (!empty($request->addOns)) {
            $this->handleAddOnUpdates($booking->id, $request->addOns);
        }

        // ✅ CORRECTED: Update booking summary data
        if (!$booking->expense_file_internal) {
            $booking->expense_internal_total = $request->summary['totalAmount'];     // Total keseluruhan
            $booking->total_expense_paid = $request->summary['paidAmount'];         // Yang sudah dibayar  
            $booking->total_expense_crew = $request->summary['unpaidAmount'];       // ✅ Net Total = Yang perlu dibayar sekarang
            $booking->total_expense_debt = $request->summary['debtAmount'];         // Yang ditunda (Pay Later)
            $booking->total_expense_balance = 0; // Deprecated field
            $booking->save();
        }
        return back()->with('message', 'Expense saved successfully');
    }
    private function handleAddOnUpdates($bookingId, $addOnsData)
    {
        // Handle deleted add ons
        if (!empty($addOnsData['deleted'])) {
            BookAddOn::whereIn('id', $addOnsData['deleted'])->delete();
        }

        // Handle modified add ons
        if (!empty($addOnsData['modified'])) {
            foreach ($addOnsData['modified'] as $addOnData) {
                $bookAddOn = BookAddOn::find($addOnData['id']);
                if ($bookAddOn) {
                    $bookAddOn->update([
                        'qty' => $addOnData['quantity'],
                        'price_expense' => $addOnData['price'],
                        'is_debt' => $addOnData['is_debt'],
                        'status_paid' => $addOnData['status_paid'],
                    ]);
                }
            }
        }

        // Handle new add ons
        if (!empty($addOnsData['new'])) {
            foreach ($addOnsData['new'] as $addOnData) {
                // If it's a completely new add on (not from existing list)
                if (empty($addOnData['add_on_id'])) {
                    // Create new AddOn master data first
                    $newAddOn = AddOn::create([
                        'add_on' => $addOnData['name'],
                        'price' => $addOnData['price'],
                        'is_transport' => '0',
                        'type_transport' => null,
                    ]);
                    $addOnId = $newAddOn->id;
                } else {
                    $addOnId = $addOnData['add_on_id'];
                }

                // Create BookAddOn record
                BookAddOn::create([
                    'booking_id' => $bookingId,
                    'add_on_id' => $addOnId,
                    'qty' => $addOnData['quantity'],
                    'price_expense' => $addOnData['price'],
                ]);
            }
        }
    }
    // function updateExpense(Request $request){
    //     // return  dd($request->all());
    //     $booking = Booking::where('id',$request->booking_id)->first();
    //     if($request->accommodations){
    //         foreach ($request->accommodations as $key => $value) {
    //             $bookHotel = BookHotel::find($value['hotel_id']);
    //             $bookHotel->is_paid = $value['is_debt'] == '0' ? '1' : '0';
    //             $bookHotel->is_debt = $value['is_debt'];
    //             if($bookHotel->is_paid == '1'){
    //                 $bookHotel->paid_at = date('Y-m-d H:i:s');
    //             }
    //             else{
    //                 $bookHotel->paid_at = null;
    //             }
    //             $bookHotel->save();
    //             if(count($request->accommodations[$key]['rooms']) != 0){
    //                 foreach ($request->accommodations[$key]['rooms'] as $index => $val) {
    //                     $bookRoom = BookRoomHotel::find($val['id']);
    //                     $bookRoom->quantity = $val['quantity'];
    //                     $bookRoom->subtotal = $val['quantity']*$val['rate'];
    //                     $bookRoom->save();
    //                 }
    //             }     

    //             if(count($request->accommodations[$key]['meals']) != 0){
    //                 foreach ($request->accommodations[$key]['meals'] as $index => $val) {
    //                     $bookHotelMeals = BookHotelMeal::find($val['id']);
    //                     $bookHotelMeals->qty = $val['qty'];
    //                     $bookHotelMeals->price = $val['price'];
    //                     $bookHotelMeals->subtotal = $val['qty']*$val['price'];
    //                     $bookHotelMeals->save();
    //                 }
    //             }                

    //         }
    //     }

    //     if($request->destinations){
    //         BookDestinationActivity::where('booking_id',$request->booking_id)->delete();
    //         foreach ($request->destinations as $key => $value) {
    //             foreach ($value['activities'] as $index => $val) {
    //                 // Verificar si necesitamos crear una nueva actividad de destino
    //                 $destinationActivityId = $val['destination_activity_id'] ?? null;

    //                 if(empty($destinationActivityId)){
    //                     // Crear nueva actividad de destino
    //                     $destinationActivity = new DestinationActivity;
    //                     $destinationActivity->destination_id = $val['destination_id'];
    //                     $destinationActivity->name = $val['name'];
    //                     $destinationActivity->destination_activity_code = '';
    //                     $destinationActivity->unit = 'no';
    //                     $destinationActivity->formula = '1';
    //                     $destinationActivity->price = $val['price'];
    //                     $destinationActivity->is_default_jvto = '0';
    //                     $destinationActivity->is_default_klook = '0';
    //                     $destinationActivity->is_default_twt = '0';
    //                     $destinationActivity->save();

    //                     // Asignar el ID a una variable local
    //                     $destinationActivityId = $destinationActivity->id;
    //                 }

    //                 // Crear la asociación con la reserva
    //                 $bookDestinationActivity = new BookDestinationActivity;
    //                 $bookDestinationActivity->booking_id = $request->booking_id;
    //                 $bookDestinationActivity->destination_id = $val['destination_id'];
    //                 $bookDestinationActivity->destination_activity_id = $destinationActivityId;
    //                 $bookDestinationActivity->qty = $val['quantity'];
    //                 $bookDestinationActivity->price = $val['price'];
    //                 $bookDestinationActivity->subtotal = $val['quantity']*$val['price'];
    //                 $bookDestinationActivity->status_paid = $val['is_debt'] == '0' ? 'paid' : 'unpaid';
    //                 if($bookDestinationActivity->status_paid == 'paid'){
    //                     $bookDestinationActivity->paid_date = date('Y-m-d');
    //                 }
    //                 $bookDestinationActivity->is_debt = $val['is_debt'];
    //                 $bookDestinationActivity->save();
    //             }
    //         }
    //     }

    //     if($request->others){
    //         BookOthersActivity::where('booking_id',$request->booking_id)->delete();
    //         foreach ($request->others as $key => $value) {
    //             // Primero, asegúrate de tener un others_activity_id válido
    //             $othersActivityId = $value['others_activity_id'] ?? null;

    //             // Si no hay ID o el item es nuevo, crea una nueva actividad
    //             if(empty($othersActivityId)){
    //                 $othersActivity = new OthersActivity;
    //                 $othersActivity->name = $value['name'] ?? 'Unnamed Activity';
    //                 $othersActivity->other_activity_code = '';
    //                 $othersActivity->unit = 'no';
    //                 $othersActivity->formula = '1';
    //                 $othersActivity->price = $value['price'];
    //                 $othersActivity->is_default = '0';
    //                 $othersActivity->save();

    //                 // Usa directamente el ID recién creado
    //                 $othersActivityId = $othersActivity->id;
    //             }

    //             $bookOthersActivity = new BookOthersActivity;
    //             $bookOthersActivity->booking_id = $request->booking_id;
    //             $bookOthersActivity->others_activity_id = $othersActivityId; // Usa la variable local
    //             $bookOthersActivity->qty = $value['quantity'];
    //             $bookOthersActivity->price = $value['price'];
    //             $bookOthersActivity->subtotal = $value['quantity']*$value['price'];
    //             $bookOthersActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
    //             if($bookOthersActivity->status_paid == 'paid'){
    //                 $bookOthersActivity->paid_date = date('Y-m-d');
    //             }
    //             $bookOthersActivity->is_debt = $value['is_debt'];
    //             $bookOthersActivity->save();
    //         }
    //     }
    //     if($request->resources['cars']){
    //         BookCarActivity::where('booking_id',$request->booking_id)->delete();
    //         foreach ($request->resources['cars'] as $key => $value) {
    //             $bookCarActivity = new BookCarActivity;
    //             $bookCarActivity->booking_id = $request->booking_id;
    //             $bookCarActivity->car_id = $value['car_id'];
    //             $bookCarActivity->qty = $value['quantity'];
    //             $bookCarActivity->price = $value['price'];
    //             $bookCarActivity->subtotal = $value['quantity']*$value['price'];
    //             $bookCarActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
    //             if($bookCarActivity->status_paid == 'paid'){
    //                 $bookCarActivity->paid_date = date('Y-m-d');
    //             }
    //             $bookCarActivity->is_debt = $value['is_debt'];
    //             $bookCarActivity->save();
    //         }
    //     }

    //     BookCrewActivity::where('booking_id',$request->booking_id)->delete();
    //     foreach ($request->resources['crews'] as $key => $value) {
    //         $bookCrewActivity = new BookCrewActivity;
    //         $bookCrewActivity->booking_id = $request->booking_id;
    //         $bookCrewActivity->crew_role_id = $value['crew_role_id'];
    //         $bookCrewActivity->qty = $value['quantity'];
    //         $bookCrewActivity->price = $value['price'];
    //         $bookCrewActivity->subtotal = $value['quantity']*$value['price'];
    //         $bookCrewActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
    //         if($bookCrewActivity->status_paid == 'paid'){
    //             $bookCrewActivity->paid_date = date('Y-m-d');
    //         }
    //         $bookCrewActivity->is_debt = $value['is_debt'];
    //         $bookCrewActivity->save();
    //     }

    //     if(!$booking->expense_file_internal){
    //         $booking->expense_internal_total = $request->summary['totalAmount'];
    //         $booking->total_expense_crew = $request->summary['paidAmount'];
    //         $booking->total_expense_balance = 0;
    //         $booking->total_expense_debt = $request->summary['debtAmount'];
    //         $booking->save();
    //     }
    //     return back()->with('message', 'Expense saved successfully');
    // }
    function downloadExpense($id)
    {
        $booking = Booking::select('id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'agent_id', 'booking_category_id', 'booking_date', 'package_duration')->with(['user' => function ($query) {
            $query->select('id', 'name');
        }])->where('id', $id)->first();
        $booking = [
            'customer_name' => $booking->user->name,
            'travel_date_start' => date('d F Y', strtotime($booking->travel_date_start)),
            'total_pax' => $booking->total_pax,
            'duration' => $booking->package_duration . " Days " . ($booking->package_duration == 1 ? 1 : $booking->package_duration - 1) . " Nights",
            'total_invoice' => $booking->grand_total + $booking->book_add_on_total
        ];

        $option = request()->segment(4);

        $bookRoom = BookHotel::select('id', 'booking_id', 'hotel_id', 'b', 'l', 'd', 'is_paid', 'is_debt')->with(['hotel' => function ($query) {
            $query->select('id', 'name', 'lunch_rate', 'dinner_rate');
        }, 'bookRoom' => function ($query) {
            $query->select('id', 'book_hotel_id', 'room_hotel_id', 'quantity', 'subtotal')->with(['roomHotel' => function ($q) {
                $q->select('id', 'room_name', 'rate');
            }]);
        }, 'bookHotelMeal']);
        if ($option == 'pay-later') {
            $bookRoom = $bookRoom->where('is_debt', '1');
        } else if ($option == 'paid') {
            $bookRoom = $bookRoom->where('is_paid', '1');
        }
        $bookRoom = $bookRoom->where('booking_id', $id)
            ->get()->map(function ($query) {
                return [
                    'hotel' => $query->hotel->name,
                    'is_debt' => $query->is_debt,
                    'is_paid' => $query->is_paid,
                    'rooms' => $query->bookRoom->map(function ($room) {
                        return [
                            'room' => $room->roomHotel->room_name,
                            'quantity' => $room->quantity,
                            'price' => $room->subtotal / $room->quantity,
                            'subtotal' => $room->subtotal,
                        ];
                    }),
                    'meals' => $query->bookHotelMeal->map(function ($meals) {
                        return [
                            'meals' => $meals->meals,
                            'quantity' => $meals->qty,
                            'price' => $meals->price,
                            'subtotal' => $meals->subtotal,
                        ];
                    })
                ];
            });

        $destinations = BookDestinationActivity::select('id', 'destination_id', 'destination_activity_id', 'qty', 'price', 'subtotal', 'status_paid', 'is_debt')->with(['destination' => function ($query) {
            $query->select('id', 'name');
        }, 'destinationActivity' => function ($query) {
            $query->select('id', 'name', 'unit');
        }]);

        if ($option == 'pay-later') {
            $destinations = $destinations->where('is_debt', '1');
        } else if ($option == 'paid') {
            $destinations = $destinations->where('status_paid', 'paid');
        }

        $destinations = $destinations->where('booking_id', $id)->get()
            ->groupBy(fn($item) => $item->destination->name) // Grouping sebelum mapping
            ->map(function ($items) {
                return $items->map(function ($query) {
                    return [
                        'item' => $query->destinationActivity->name,
                        'quantity' => $query->qty,
                        'price' => $query->price,
                        'subtotal' => $query->subtotal,
                        'is_debt' => $query->is_debt,
                        'status_paid' => $query->status_paid,
                    ];
                });
            });
        $resources['cars'] = BookCarActivity::with(['car' => function ($query) {
            $query->select('id', 'name');
        }]);
        if ($option == 'pay-later') {
            $resources['cars'] = $resources['cars']->where('is_debt', '1');
        } else if ($option == 'paid') {
            $resources['cars'] = $resources['cars']->where('status_paid', 'paid');
        }

        $resources['cars'] = $resources['cars']->where('booking_id', $id)
            ->get()->map(function ($query) {
                return [
                    'item' => $query->car->name,
                    'quantity' => $query->qty,
                    'price' => $query->price,
                    'subtotal' => $query->subtotal,
                    'is_debt' => $query->is_debt,
                    'status_paid' => $query->status_paid,
                ];
            });

        $resources['crews'] = BookCrewActivity::with(['crewRole' => function ($query) {
            $query->select('id', 'role');
        }]);
        if ($option == 'pay-later') {
            $resources['crews'] = $resources['crews']->where('is_debt', '1');
        } else if ($option == 'paid') {
            $resources['crews'] = $resources['crews']->where('status_paid', 'paid');
        }

        $resources['crews'] = $resources['crews']->where('booking_id', $id)
            ->get()->map(function ($query) {
                return [
                    'item' => $query->crewRole->role,
                    'quantity' => $query->qty,
                    'price' => $query->price,
                    'subtotal' => $query->subtotal,
                    'is_debt' => $query->is_debt,
                    'status_paid' => $query->status_paid,
                ];
            });

        $others = BookOthersActivity::with('othersActivity')
            ->where('booking_id', $id);
        if ($option == 'pay-later') {
            $others = $others->where('is_debt', '1');
        } else if ($option == 'paid') {
            $others = $others->where('status_paid', 'paid');
        }

        $others = $others->get()->map(function ($query) {
            return [
                'item' => $query->othersActivity->name,
                'quantity' => $query->qty,
                'price' => $query->price,
                'subtotal' => $query->subtotal,
                'is_debt' => $query->is_debt,
                'status_paid' => $query->status_paid,
            ];
        });
        $addOns = BookAddOn::with(['addOn' => function ($query) {
            $query->select('id', 'add_on', 'price', 'is_transport', 'type_transport');
        }]);

        if ($option == 'pay-later') {
            $addOns = $addOns->where('is_debt', '1');
        } else if ($option == 'paid') {
            $addOns = $addOns->where('status_paid', 'paid');
        }

        $addOns = $addOns->where('booking_id', $id)->get()->map(function ($query) {
            return [
                'item' => $query->addOn->is_transport == '1'
                    ? "Transport to " . ucwords(strtolower($query->addOn->add_on)) . " (" . ucfirst($query->addOn->type_transport) . ")"
                    : $query->addOn->add_on,
                'quantity' => $query->qty,
                'price' => $query->price_expense,
                'subtotal' => $query->qty * $query->price_expense,
                'is_debt' => $query->is_debt ?? '0',
                'status_paid' => $query->status_paid ?? 'unpaid',
            ];
        });
        $drivers = [];
        $escorts = [];
        $ijens = [];
        $data = [
            'title' => ucwords(str_replace('-', ' ', $option)) . " Expense",
            'option' => $option,
            'booking' => $booking,
            'accommodations' => $bookRoom,
            'destinations' => $destinations,
            'resources' => $resources,
            'others' => $others,
            'addOns' => $addOns,
            'plotting' => [
                'drivers' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'driver')->get()->each(function ($query) use (&$drivers) {
                    $drivers[] = $query->person->name;
                }) ? implode(', ', $drivers) : '',

                'escorts' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '0')->get()->each(function ($query) use (&$escorts) {
                    $escorts[] = $query->person->name;
                }) ? implode(', ', $escorts) : '',

                'ijens' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '1')->get()->each(function ($query) use (&$ijens) {
                    $ijens[] = $query->person->name;
                }) ? implode(', ', $ijens) : '',
            ]
        ];
        if (request()->segment(4) == 'crew' && request()->preview) {
            return view('exports/expense', $data);
        } 
        else if(request()->segment(5) == 'api'){
            return response()->json($data);
        }
        else {
            $pdf = PDF::loadView('exports/expense', $data);
            $name = Str::slug($booking['customer_name']);
            // Opsional: Set paper size dan orientation
            $pdf->setPaper('A4', 'portrait');
            return $pdf->download($option . '-expense-' . $name . '.pdf');
        }
    }
    function settlement()
    {
        $booking = Booking::where('status', '')->get();
    }
    function receivableIncome(Request $request)
    {
        $startDate = $request->start_date ? $request->start_date : date('Y-m-01');
        $endDate = $request->end_date ? $request->end_date : date('Y-m-t');
        $jvto = BookingPayment::with(['paymentMethod', 'booking.user'])->whereBetween('created_at', [$startDate, $endDate])->orderBy('created_at', 'asc')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'source' => 'JVTO',
                'booking_code' => $query->booking->booking_code,
                'date' => date('d F Y', strtotime($query->created_at)),
                'customer' => $query->booking->user->name,
                'booking_id' => $query->booking_id,
                'payment_method_id' => $query->payment_method_id,
                'payment_method' => $query->paymentMethod->name,
                'reference' => $query->reference,
                'description' => $query->is_add_on == '1' ? $query->description . " (Add On)" : $query->description,
                'nominal' => (int)$query->nominal,
                'status' => 'PAID',
            ];
        });
        $others = Booking::where('status', 'booked')
            ->whereBetween('travel_date_start', [$startDate, $endDate])
            ->where(function ($query) {
                $query->where('agent_id', 2)
                    ->where('booking_category_id', 3)
                    ->orWhere('agent_id', 1);
            })
            ->get()
            ->map(function ($query) {
                // Determine the source based on agent_id
                $source = $query->agent_id == 2 ? 'KLOOK' : 'TWT';

                return [
                    'id' => $query->id,
                    'source' => $source,
                    'booking_code' => $query->invoice_code_origin,
                    'date' => date('d F Y', strtotime($query->travel_date_start)),
                    'customer' => $query->user->name,
                    'booking_id' => $query->id,
                    'payment_method_id' => $query->payment_method_vendor_id,
                    'payment_method' => $query->is_vendor_paid == '1' ? $query->paymentMethodVendor->name : '-',
                    'reference' => $query->is_vendor_paid == '1' ? $query->is_vendor_paid_reference : '-',
                    'description' => $source,
                    'nominal' => (int)$query->grand_total,
                    'status' => $query->is_vendor_paid == '1' ? 'PAID' : 'UNPAID',
                ];
            });
        $paymentMethod = PaymentMethod::get();
        $filters = $request->only(['search', 'source', 'status', 'payment_method']);
        $filters['start_date'] = $startDate;
        $filters['end_date'] = $endDate;
        $payment = $others->merge($jvto)->sortBy('date')->values();
        if (!empty($filters)) {
            $payment = $payment->filter(function ($item) use ($filters) {
                $keep = true;

                // Filter by search term (case-insensitive search in customer name and booking code)
                if (!empty($filters['search'])) {
                    $searchTerm = strtolower($filters['search']);
                    $customerName = strtolower($item['customer']);
                    $bookingCode = strtolower($item['booking_code']);

                    if (strpos($customerName, $searchTerm) == false && strpos($bookingCode, $searchTerm) == false) {
                        $keep = false;
                    }
                }

                // Filter by source (KLOOK, TWT, JVTO)
                if (!empty($filters['source']) && $item['source'] !== $filters['source']) {
                    $keep = false;
                }

                // Filter by status (PAID, UNPAID)
                if (!empty($filters['status']) && $item['status'] !== $filters['status']) {
                    $keep = false;
                }

                // Filter by payment method
                if (!empty($filters['payment_method']) && $item['payment_method_id'] != $filters['payment_method']) {
                    $keep = false;
                }

                // Date filtering is already handled in the initial database queries

                return $keep;
            })->values(); // Reset array keys after filtering
        }

        return Inertia::render('Finance/ReceivableIncome', ['payments' => $payment, 'filters' => $filters, 'paymentMethod' => $paymentMethod]);
    }
    function profitabilityReport(Request $request)
    {
        $monthParam = $request->month ? $request->month : date('m');
        $month = $request->month ? date('Y-' . $request->month) : date('Y-m');
        $getJvto = Booking::where('status', 'booked')
            ->where('agent_id', 2)
            ->where('booking_category_id', '!=', 3)
            ->where('travel_date_start', 'like', $month . '%')
            ->get();

        $jvto['totalRevenue'] = $getJvto->sum(function ($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $jvto['totalOperational'] = $getJvto->sum('expense_internal_total');
        $jvto['totalProfit'] = $jvto['totalRevenue'] - $jvto['totalOperational'];
        $jvto['profitPercentage'] = $jvto['totalRevenue'] > 0
            ? round(($jvto['totalProfit'] / $jvto['totalRevenue']) * 100, 2)
            : 0;
        $jvto['color'] = "#0EA5E9";
        $jvto['bgColor'] = "#F0F9FF";
        $jvto['icon'] = "https://legacy.javavolcano-touroperator.com/assets/img/download.png";
        $jvto['description'] = "Japan Volcano Tour Operator";
        $jvto['name'] = "JVTO";

        $getKlook = Booking::where('status', 'booked')
            ->where('agent_id', 2)
            ->where('booking_category_id', 3)
            ->where('travel_date_start', 'like', $month . '%')
            ->get();

        $klook['totalRevenue'] = $getKlook->sum(function ($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $klook['totalOperational'] = $getKlook->sum('expense_internal_total');
        $klook['totalProfit'] = $klook['totalRevenue'] - $klook['totalOperational'];
        $klook['profitPercentage'] = $klook['totalRevenue'] > 0
            ? round(($klook['totalProfit'] / $klook['totalRevenue']) * 100, 2)
            : 0;
        $klook['color'] = "#10B981";
        $klook['bgColor'] = "#ECFDF5";
        $klook['icon'] = "https://img.involve.asia/ia_background/803_ULo2708G.png";
        $klook['description'] = "Online Travel Booking Platform";
        $klook['name'] = "Klook";


        $getTwt = Booking::where('status', 'booked')
            ->where('agent_id', 1)
            ->where('travel_date_start', 'like', $month . '%')
            ->get();

        $twt['totalRevenue'] = $getTwt->sum(function ($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $twt['totalOperational'] = $getTwt->sum('expense_internal_total');
        $twt['totalProfit'] = $twt['totalRevenue'] - $twt['totalOperational'];
        $twt['profitPercentage'] = $twt['totalRevenue'] > 0
            ? round(($twt['totalProfit'] / $twt['totalRevenue']) * 100, 2)
            : 0;
        $twt['color'] = "#F59E0B";
        $twt['bgColor'] = "#FFFBEB";
        $twt['icon'] = "https://static.wixstatic.com/media/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png/v1/fit/w_2500,h_1330,al_c/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png";
        $twt['description'] = "The Window Travel";
        $twt['name'] = "TWT";


        $data = [$jvto, $klook, $twt];

        return Inertia::render('Finance/ProfitabilityReport', ['data' => $data, 'month' => $monthParam]);
    }

    function payableReport(Request $request)
    {
        $month = $request->month ? $request->month : date('Y-m');
        $vendor = Vendor::with('vendorCategory')->orderBy('vendor_category_id', 'asc')->get()->map(function ($query) use ($month) {
            $data = [];
            $total = 0;
            switch ($query->vendor_category_id) {
                case 1:
                    $data = BookRoomHotel::with(['booking.user', 'bookingItinerary', 'bookHotel.bookHotelMeal'])
                        ->whereHas('bookHotel.hotel', function ($q) use ($query) {
                            $q->where('vendor_id', $query->id);
                        })
                        ->whereHas('booking', function ($q) use ($month) {
                            $q->whereHas('bookingItinerary', function ($subQ) use ($q, $month) {
                                $subQ->whereRaw("DATE_FORMAT(DATE_ADD(bookings.travel_date_start, INTERVAL (booking_itineraries.day-1) DAY), '%Y-%m') = ?", [$month]);
                            });
                        })
                        ->get();
                    $total = $data->sum(function ($item) {
                        return $item->subtotal + $item->bookHotel->bookHotelMeal->sum('subtotal');
                    });
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
            }
            return [
                'id' => $query->id,
                'name' => $query->name,
                'category' => $query->vendorCategory->name,
                'total' => $total,
                'status' => 'paid',
                // 'data' => $data
            ];
        });
        return [
            'vendor' => $vendor
        ];
        return Inertia::render('Finance/PayableReport');
    }
    function payableReportIndex(Request $request)
    {
        // Get filter parameters with defaults
        $month = $request->month ? $request->month : date('m');
        $year = $request->year ? $request->year : date('Y');
        $vendorId = $request->vendor ? $request->vendor : null;

        // Query for debt payments
        $query = DebtPayment::with(['vendor', 'paymentMethod', 'details'])
            ->whereMonth('payment_date', $month)
            ->whereYear('payment_date', $year)
            ->orderBy('payment_date', 'desc');

        // Apply vendor filter if provided
        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }

        // Execute query
        $payments = $query->get();

        // Map payments data for display
        $paymentsData = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'payment_number' => $payment->payment_number,
                'payment_date' => $payment->payment_date->format('d M Y'),
                'vendor_name' => $payment->vendor->name,
                'vendor_category' => $payment->vendor->vendorCategory->name,
                'payment_method' => $payment->paymentMethod->name,
                'total_amount' => $payment->total_amount,
                'payment_proof' => $payment->payment_proof,
                'formatted_amount' => 'Rp ' . number_format($payment->total_amount, 0, ',', '.'),
                'item_count' => $payment->details->count(),
                'item_type' => $payment->item_type,
            ];
        });

        // Get vendors for filter
        $vendors = Vendor::with('vendorCategory')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'name' => $query->name,
                'category_id' => $query->vendorCategory->id,
                'category' => $query->vendorCategory->name,
            ];
        })->groupBy('category');

        // Summary calculations
        $summary = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('total_amount'),
            'formatted_total' => 'Rp ' . number_format($payments->sum('total_amount'), 0, ',', '.'),
            'by_category' => $payments->groupBy('item_type')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'amount' => $group->sum('total_amount'),
                    'formatted_amount' => 'Rp ' . number_format($group->sum('total_amount'), 0, ',', '.')
                ];
            }),
        ];

        // Filter data
        $filters = [
            'month' => $month,
            'year' => $year,
            'vendor' => $vendorId,
        ];

        return Inertia::render('Finance/PayableReportIndex', [
            'data' => [
                'payments' => $paymentsData,
                'vendors' => $vendors,
                'filters' => $filters,
                'summary' => $summary,
            ]
        ]);
    }
    function payableReportCreate(Request $request)
    {
        $data['paymentMethods'] = PaymentMethod::whereIn('id', [1, 6])->orderBy('name', 'asc')->get();
        $data['vendors'] = Vendor::with('vendorCategory')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'name' => $query->name,
                'category_id' => $query->vendorCategory->id,
                'category' => $query->vendorCategory->name,
            ];
        })->groupBy('category');
        $data['filters']['vendor'] = $request->vendor ? $request->vendor : '';
        $data['filters']['year'] = $request->year ? $request->year : date('Y');
        $data['filters']['month'] = $request->month ? $request->month : date('m');
        $getNo = DebtPayment::whereLike('payment_date', date('Y-m') . '%')->orderBy('id', 'desc')->first();
        if (!$getNo) {
            $paymentNo = '0001';
        } else {
            $paymentNo = explode('/', $getNo->payment_number);
            $paymentNo = (int)$paymentNo[4];
            $paymentNo = (int)$paymentNo + 1;
            $paymentNo = str_pad($paymentNo, 4, '0', STR_PAD_LEFT);
        }

        $data['paymentNo'] = "JVR/PAY/" . date('m/y') . '/' . $paymentNo;


        if ($data['filters']['vendor']) {
            $getCategory = Vendor::where('id', $data['filters']['vendor'])->first();
            if ($getCategory->vendor_category_id == 1) {
                $bookHotel = BookHotel::with([
                    'bookRoom.roomHotel',
                    'booking.user',
                    'bookingItinerary',
                    'hotel'
                ])
                    ->where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('hotel', function ($query) use ($data) {
                        $query->where('vendor_id', $data['filters']['vendor']);
                    })
                    ->whereHas('booking', function ($query) use ($data) {
                        $query->where('travel_date_start', 'like', "%" . $data['filters']['year'] . "-" . $data['filters']['month'] . "%");
                    })->get()->map(function ($query) {
                        $night = $query->bookingItinerary->day - 1;
                        return [
                            'id' => $query->id,
                            'booking_id' => $query->booking_id,
                            'day'  => $query->bookingItinerary->day,
                            'customer' => $query->booking->user->name,
                            'channel'  => $query->booking->agent_id == 1 ? 'TWT' : ($query->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                            'pax' => $query->booking->total_pax,
                            'travel_date_start' => $query->booking->travel_date_start,
                            'travel_date' => date('d M', strtotime($query->booking->travel_date_start)) . " - " . date('d M Y', strtotime($query->booking->travel_date_end)),
                            'duration' => $query->booking->bookingDetail[0]->package ? $query->booking->bookingDetail[0]->package->duration->day . "D " . $query->booking->bookingDetail[0]->package->duration->night . "N" : $query->booking->package_duration . "D " . ($query->booking->package_duration == 1 ? 1 : $query->booking->package_duration - 1) . "N",
                            'check_in' => date('d M Y', strtotime($query->booking->travel_date_start . " +$night days")),
                            'rooms' => $query->bookRoom->map(function ($room) {
                                return [
                                    'room' => $room->roomHotel->room_name,
                                    'quantity' => $room->quantity,
                                    'price' => $room->subtotal / $room->quantity,
                                    'subtotal' => $room->subtotal,
                                ];
                            }),
                            'room_total' => $query->bookRoom->sum('subtotal'),
                            'meals' => $query->bookHotelMeal->map(function ($meals) {
                                return [
                                    'meals' => ucfirst($meals->meals),
                                    'quantity' => $meals->qty,
                                    'price' => $meals->price,
                                    'subtotal' => $meals->subtotal,
                                ];
                            }),
                            'meals_total' => $query->bookHotelMeal->sum('subtotal'),
                            'total' => $query->bookRoom->sum('subtotal') + $query->bookHotelMeal->sum('subtotal'),
                        ];
                    });
                $bookHotel = $bookHotel->sortBy(function ($item) {
                    $plusDay = $item['day'] - 1;
                    $checkIn = date('Y-m-d', strtotime($item['travel_date_start'] . " +$plusDay days"));
                    return $checkIn;
                });

                $data['debts'] = $bookHotel->values();
            } else if ($getCategory->vendor_category_id == 2) {
                $bookDestinationActivity = BookDestinationActivity::with(['destinationActivity', 'booking.bookingDetail.package', 'booking.user'])
                    ->where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('destinationActivity', function ($query) use ($data) {
                        $query->where('vendor_id', $data['filters']['vendor']);
                    })
                    ->whereHas('booking', function ($query) use ($data) {
                        $query->where('travel_date_start', 'like', "%" . $data['filters']['year'] . "-" . $data['filters']['month'] . "%");
                    })
                    ->get();

                if (count($bookDestinationActivity) > 0 && $bookDestinationActivity[0]->destinationActivity->destination_id == 1) {
                    $bookDestinationActivity = $bookDestinationActivity->groupBy(function ($item) {
                        return $item->booking_id; // grup berdasarkan booking
                    });
                    $bookDestinationActivity = $bookDestinationActivity->map(function ($value) {
                        $first = $value->first();
                        $bookingId = $first->booking_id;
                        $destinationId = $first->destination_id;
                        $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                            $query->where('destination_id', $destinationId);
                        })->first();
                        $activityDate = null;
                        $activityDateRaw = null;
                        if ($getActiviyDate) {
                            $activityDate = date('d F Y', strtotime($first->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                            $activityDateRaw = date('Y-m-d', strtotime($first->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                        }

                        $no_of_pax = $value->where('destination_activity_id', 1)->sum('qty');
                        $bromo_ticket = $value->where('destination_activity_id', 1)->sum('subtotal');
                        $bromo_jeep_unit = $value->whereNotIn('destination_activity_id', [1])->sum('qty');
                        $bromo_jeep = $value->whereNotIn('destination_activity_id', [1])->sum('subtotal');
                        $total = $value->sum('subtotal');
                        $hotelName = optional(
                            $first->booking->bookHotel->firstWhere('hotel.destination_id', 1)
                        )->hotel->name ?? '';


                        return [
                            'id' => $first->id,
                            'booking_id' => $first->booking_id,
                            'customer' => $first->booking->user->name,
                            'channel'  => $first->booking->agent_id == 1 ? 'TWT' : ($first->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                            'pax' => $first->booking->total_pax,
                            'travel_date_start' => $first->booking->travel_date_start,
                            'travel_date' => date('d M', strtotime($first->booking->travel_date_start)) . " - " . date('d M Y', strtotime($first->booking->travel_date_end)),
                            'duration' => $first->booking->bookingDetail[0]->package ? $first->booking->bookingDetail[0]->package->duration->day . "D " . $first->booking->bookingDetail[0]->package->duration->night . "N" : $first->booking->package_duration . "D " . ($first->booking->package_duration == 1 ? 1 : $first->booking->package_duration - 1) . "N",
                            'guest' => $first->booking->user->name,
                            'travel_date' => date('d F Y', strtotime($first->booking->travel_date_start)),
                            'activity_date' => $activityDate,
                            'activity_date_raw' => $activityDateRaw,
                            'bromo_ticket' => $bromo_ticket,
                            'jeep_unit' => $bromo_jeep_unit,
                            'bromo_jeep' => $bromo_jeep,
                            'hotel_name' => $hotelName,
                            'amount' => $total,
                        ];
                    });
                } else {
                    $bookDestinationActivity = $bookDestinationActivity->map(function ($value) {
                        $bookingId = $value->booking_id;
                        $destinationId = $value->destination_id;
                        $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                            $query->where('destination_id', $destinationId);
                        })->first();
                        $activityDate = null;
                        $activityDateRaw = null;
                        if ($getActiviyDate) {
                            $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                            $activityDateRaw = date('Y-m-d', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                        } else {
                            if ($destinationId == 6) {
                                $destinationId = 1;

                                $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                                    $query->where('destination_id', $destinationId);
                                })->first();
                                $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                                $activityDateRaw = date('Y-m-d', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                            } else if ($destinationId == 9) {
                                $destinationId = 2;

                                $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                                    $query->where('destination_id', $destinationId);
                                })->first();
                                $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                                $activityDateRaw = date('Y-m-d', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                            }
                        }

                        return [
                            'id' => $value->id,
                            'booking_id' => $value->booking_id,
                            'customer' => $value->booking->user->name,
                            'channel'  => $value->booking->agent_id == 1 ? 'TWT' : ($value->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                            'pax' => $value->booking->total_pax,
                            'travel_date_start' => $value->booking->travel_date_start,
                            'travel_date' => date('d M', strtotime($value->booking->travel_date_start)) . " - " . date('d M Y', strtotime($value->booking->travel_date_end)),
                            'duration' => $value->booking->bookingDetail[0]->package ? $value->booking->bookingDetail[0]->package->duration->day . "D " . $value->booking->bookingDetail[0]->package->duration->night . "N" : $value->booking->package_duration . "D " . ($value->booking->package_duration == 1 ? 1 : $value->booking->package_duration - 1) . "N",
                            'guest' => $value->booking->user->name,
                            'travel_date' => date('d F Y', strtotime($value->booking->travel_date_start)),
                            'item' => $value->destinationActivity->name,
                            'activity_date' => $activityDate,
                            'activity_date_raw' => $activityDateRaw,
                            'qty' => $value->qty,
                            'rate' => $value->price,
                            'amount' => $value->subtotal,
                        ];
                    });
                }

                $bookDestinationActivity = $bookDestinationActivity->filter(function ($item) use ($data) {
                    return $item['activity_date_raw'] >= $data['filters']['year'] . "-" . $data['filters']['month'] . "-01" && $item['activity_date_raw'] <= $data['filters']['year'] . "-" . $data['filters']['month'] . "-31";
                })
                    ->sortBy('activity_date_raw')->values();

                $data['debts'] = $bookDestinationActivity;
            } else if ($getCategory->vendor_category_id == 3) {
                $bookCar = BookCarActivity::with(['booking.user', 'booking.bookingDetail.package', 'car'])
                    ->whereHas('booking', function ($query) use ($data) {
                        $query->where('travel_date_start', 'like', "%" . $data['filters']['year'] . "-" . $data['filters']['month'] . "%");
                    })
                    ->whereHas('car', function ($query) use ($data) {
                        $query->where('vendor_id', $data['filters']['vendor']);
                    })
                    ->where('is_debt', '1')
                    ->whereNull('debt_payment_id')->get();
                $bookCar = $bookCar->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'booking_id' => $value->booking_id,
                        'customer' => $value->booking->user->name,
                        'channel'  => $value->booking->agent_id == 1 ? 'TWT' : ($value->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax' => $value->booking->total_pax,
                        'travel_date_start' => $value->booking->travel_date_start,
                        'duration' => $value->booking->bookingDetail[0]->package ? $value->booking->bookingDetail[0]->package->duration->day . "D " . $value->booking->bookingDetail[0]->package->duration->night . "N" : $value->booking->package_duration . "D " . ($value->booking->package_duration == 1 ? 1 : $value->booking->package_duration - 1) . "N",
                        'guest' => $value->booking->user->name,
                        'pickup_date' => date('d M Y', strtotime($value->booking->travel_date_start)),
                        'drop_date' => date('d M Y', strtotime($value->booking->travel_date_end . ($value->booking->is_shuttle ? ' -1 day' : ''))),
                        'car' => $value->car->name,
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('pickup_date')->values();
                $data['debts'] = $bookCar;
            } else if ($getCategory->vendor_category_id == 4) {
                $bookOthers = BookOthersActivity::with(['booking.user', 'booking.bookingDetail.package', 'othersActivity'])
                    ->whereHas('booking', function ($query) use ($data) {
                        $query->where('travel_date_start', 'like', "%" . $data['filters']['year'] . "-" . $data['filters']['month'] . "%");
                    })
                    ->whereHas('othersActivity', function ($query) use ($data) {
                        $query->where('vendor_id', $data['filters']['vendor']);
                    })
                    ->where('is_debt', '1')
                    ->whereNull('debt_payment_id')->get();
                $bookOthers = $bookOthers->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'booking_id' => $value->booking_id,
                        'customer' => $value->booking->user->name,
                        'channel'  => $value->booking->agent_id == 1 ? 'TWT' : ($value->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax' => $value->booking->total_pax,
                        'travel_date_start' => $value->booking->travel_date_start,
                        'duration' => $value->booking->bookingDetail[0]->package ? $value->booking->bookingDetail[0]->package->duration->day . "D " . $value->booking->bookingDetail[0]->package->duration->night . "N" : $value->booking->package_duration . "D " . ($value->booking->package_duration == 1 ? 1 : $value->booking->package_duration - 1) . "N",
                        'guest' => $value->booking->user->name,
                        'item' => $value->othersActivity->name,
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('travel_date_start')->values();
                $data['debts'] = $bookOthers;
            }
        }

        return Inertia::render('Finance/PayableReportCreate', ['data' => $data]);
    }
    function payableReportDetails($id)
    {
        $payment = DebtPayment::with([
            'vendor',
            'paymentMethod',
            'details'
        ])->findOrFail($id);

        // Format data untuk ditampilkan
        $paymentData = [
            'id' => $payment->id,
            'payment_number' => $payment->payment_number,
            'vendor' => [
                'id' => $payment->vendor->id,
                'name' => $payment->vendor->name,
                'category' => $payment->vendor->vendorCategory->name ?? 'Tidak Dikategorikan'
            ],
            'item_type' => $payment->item_type,
            'payment_date' => $payment->payment_date->format('d F Y'),
            'payment_method' => $payment->paymentMethod->name,
            'payment_proof' => $payment->payment_proof,
            'note' => $payment->note,
            'total_amount' => $payment->total_amount,
            'created_at' => $payment->created_at->format('d F Y H:i'),
            'updated_at' => $payment->updated_at ? $payment->updated_at->format('d F Y H:i') : null,
            'details' => $payment->details->map(function ($detail) use ($payment) {
                $itemData = json_decode($detail->item_data, true);

                // Format data detail sesuai dengan jenis item
                $formattedDetail = [
                    'id' => $detail->id,
                    'booking_id' => $detail->booking_id,
                    'amount' => $detail->amount,
                    'item_id' => $detail->item_id,
                    'customer' => $itemData['customer'] ?? 'N/A',
                    'formatted_amount' => number_format($detail->amount, 0, ',', '.'),
                    'pax' => $itemData['pax'] ?? 0,
                    'duration' => $itemData['duration'] ?? 'N/A',
                    'channel' => $itemData['channel'] ?? 'N/A',
                ];

                // Tambahkan data spesifik berdasarkan jenis item
                switch ($payment->item_type) {
                    case 'hotel':
                        $formattedDetail['check_in'] = $itemData['check_in'] ?? 'N/A';
                        $formattedDetail['rooms'] = $itemData['rooms'] ?? [];
                        $formattedDetail['room_total'] = $itemData['room_total'] ?? 0;
                        $formattedDetail['meals'] = $itemData['meals'] ?? [];
                        $formattedDetail['meals_total'] = $itemData['meals_total'] ?? 0;
                        break;
                    case 'bromo':
                        $formattedDetail['activity_date'] = $itemData['activity_date'] ?? 'N/A';
                        $formattedDetail['bromo_ticket'] = $itemData['bromo_ticket'] ?? 0;
                        $formattedDetail['jeep_unit'] = $itemData['jeep_unit'] ?? 0;
                        $formattedDetail['bromo_jeep'] = $itemData['bromo_jeep'] ?? 0;
                        $formattedDetail['hotel_name'] = $itemData['hotel_name'] ?? 'N/A';
                        break;
                    case 'car':
                        $formattedDetail['pickup_date'] = $itemData['pickup_date'] ?? 'N/A';
                        $formattedDetail['drop_date'] = $itemData['drop_date'] ?? 'N/A';
                        $formattedDetail['car'] = $itemData['car'] ?? 'N/A';
                        $formattedDetail['qty'] = $itemData['qty'] ?? 0;
                        $formattedDetail['rate'] = $itemData['rate'] ?? 0;
                        break;
                    case 'activity':
                        $formattedDetail['activity_date'] = $itemData['activity_date'] ?? 'N/A';
                        $formattedDetail['item'] = $itemData['item'] ?? 'N/A';
                        $formattedDetail['qty'] = $itemData['qty'] ?? 0;
                        $formattedDetail['rate'] = $itemData['rate'] ?? 0;
                        break;
                    case 'others':
                        $formattedDetail['item'] = $itemData['item'] ?? 'N/A';
                        $formattedDetail['qty'] = $itemData['qty'] ?? 0;
                        $formattedDetail['rate'] = $itemData['rate'] ?? 0;
                        break;
                }

                return $formattedDetail;
            })
        ];

        return Inertia::render('Finance/PayableReportDetail', [
            'payment' => $paymentData
        ]);
    }
    public function payableReportStore(Request $request)
    {
        // Validasi request
        $validated = $request->validate([
            'paymentNumber' => 'required|string|max:50|unique:debt_payments,payment_number',
            'vendorId' => 'required|exists:vendors,id',
            'paymentDate' => 'required|date',
            'paymentMethodId' => 'required|exists:payment_methods,id',
            'paymentProofType' => 'required|in:upload,link',
            'paymentProofFile' => 'nullable|file|max:5120',
            'paymentProofLink' => 'nullable|url|max:255',
            'note' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'totalAmount' => 'required|numeric|min:0',
        ]);

        // Tentukan path file bukti pembayaran
        $paymentProof = null;
        if ($request->paymentProofType == 'upload' && $request->hasFile('paymentProofFile')) {
            $file = $request->file('paymentProofFile');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('payment_proofs', $fileName, 'public');
            $paymentProof = Storage::url($path);
        } elseif ($request->paymentProofType == 'link') {
            $paymentProof = $request->paymentProofLink;
        }

        // Tentukan item_type berdasarkan jenis data pertama
        $firstItem = $request->items[0];
        $itemType = $this->determineItemType($firstItem);

        try {
            DB::beginTransaction();

            // Buat record payment
            $payment = DebtPayment::create([
                'payment_number' => $request->paymentNumber,
                'vendor_id' => $request->vendorId,
                'item_type' => $itemType,
                'payment_date' => $request->paymentDate,
                'payment_method_id' => $request->paymentMethodId,
                'payment_proof' => $paymentProof,
                'note' => $request->note,
                'total_amount' => $request->totalAmount,
            ]);

            // Buat payment details untuk setiap item
            foreach ($request->items as $item) {
                $amount = isset($item['amount']) ? $item['amount'] : $item['total'];

                DebtPaymentDetail::create([
                    'payment_id' => $payment->id,
                    'booking_id' => $item['booking_id'],
                    'item_id' => $item['id'],
                    'amount' => $amount,
                    'item_data' => json_encode($item), // Simpan semua data item sebagai JSON
                ]);

                // Update status hutang di tabel asli
                switch ($itemType) {
                    case 'hotel':
                        $update = BookHotel::find($item['id']);
                        $update->debt_payment_id = $payment->id;
                        $update->save();
                        break;
                    case 'bromo':
                    case 'activity':
                        $update = BookDestinationActivity::find($item['id']);
                        $update->debt_payment_id = $payment->id;
                        $update->save();
                        break;
                    case 'car':
                        $update = BookCarActivity::find($item['id']);
                        $update->debt_payment_id = $payment->id;
                        $update->save();
                        break;
                    case 'others':
                        $update = BookOthersActivity::find($item['id']);
                        $update->debt_payment_id = $payment->id;
                        $update->save();

                        break;
                }
            }

            DB::commit();
            return back()->with('message', 'Expense saved successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
    public function uploadPaymentProofExpense(Request $request, $bookingId)
    {
        // Validate the booking exists and belongs to the right user/company
        $booking = Booking::findOrFail($bookingId);

        // Validate the request
        $validated = $request->validate([
            'payment_proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB max
        ]);

        try {
            // Handle file upload
            if ($request->hasFile('payment_proof')) {
                // Delete the old file if it exists
                if ($booking->payment_proof_expense) {
                    $oldPath = public_path('storage/' . $booking->payment_proof_expense);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }

                // Store the new file
                $path = $request->file('payment_proof')->store('payment-proofs', 'public');

                // Update the booking record
                $booking->payment_proof_expense = $path;
                $booking->save();

                return back()->with('message', 'Payment proof uploaded successfully');
            }

            return response()->json([
                'success' => false,
                'message' => 'No file provided'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload payment proof: ' . $e->getMessage()
            ], 500);
        }
    }

    private function determineItemType($item)
    {
        if (isset($item['check_in'])) {
            return 'hotel';
        } elseif (isset($item['bromo_ticket'])) {
            return 'bromo';
        } elseif (isset($item['pickup_date'])) {
            return 'car';
        } elseif (isset($item['activity_date'])) {
            return 'activity';
        } else {
            return 'others';
        }
    }

    function invoice()
    {
        $month = date('Y-m');
        $inv = BookingPayment::withoutGlobalScope('paid')
            ->with(['booking.user', 'booking.bookingDetail.package.duration'])
            ->whereHas('booking', function ($query) use ($month) {
                // $query->where('travel_date_start', 'like', $month."%");
                $query->where('travel_date_start', '>=', date('Y-m-01'));
            })
            ->join('bookings', 'booking_payments.booking_id', '=', 'bookings.id')
            ->orderBy('bookings.booking_code', 'asc')
            ->select('booking_payments.*')
            ->get()->map(function ($booking) {
                // Hitung total pembayaran hingga saat ini
                $totalPaid = BookingPayment::where('booking_id', $booking->booking_id)
                    ->where('id', '<=', $booking->id)
                    ->sum('nominal');

                // Grand total booking
                $grandTotal = $booking->booking->grand_total + $booking->booking->book_add_on_total;

                // Tentukan nilai session
                $session = '';
                if ($totalPaid == $grandTotal) {
                    $session = '-FULL';
                } else {
                    // Hitung urutan pembayaran ini
                    $paymentNumber = BookingPayment::where('booking_id', $booking->booking_id)
                        ->where('id', '<=', $booking->id)
                        ->count();

                    $paymentNumber = $paymentNumber == 0 ? 1 : $paymentNumber;

                    $session = '-DP' . $paymentNumber;
                }

                $invNumber = $booking->booking->booking_code . $session;
                $invNumber = str_replace('JVR', 'INV', $invNumber);
                $receiptNumber = str_replace('INV', 'RCP', $invNumber);
                $night = $booking->booking->package_duration - 1;
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking->id,
                    'booking_code' => $booking->booking->booking_code,
                    'inv_number' => $invNumber,
                    'inv_date' => date('d M Y', strtotime($booking->created_at)),
                    'description' => $session == '-FULL' ? 'Full Payment' : 'Deposit Payment',
                    'travel_date_start' => date('d M Y', strtotime($booking->booking->travel_date_start)),
                    'customer' => $booking->booking->user->name,
                    'total_pax' => $booking->booking->total_pax,
                    'duration' => !empty($booking->booking->bookingDetail[0]->package->duration->day) ? $booking->booking->bookingDetail[0]->package->duration->day : $booking->booking->package_duration,
                    'nominal' => $booking->nominal,
                    'package_id' => !empty($booking->booking->bookingDetail[0]->package_id) ? $booking->booking->bookingDetail[0]->package_id : null,
                    'package_name' => !empty($booking->booking->bookingDetail[0]->package_id) ? $booking->booking->bookingDetail[0]->package->name : $booking->booking->package_duration . " Days " . $night . " Nights Package",
                    'status' => $booking->is_paid == '1' ? 'PAID' : 'UNPAID',
                    'paid_at' => $booking->is_paid == '1' ? date('d M Y', strtotime($booking->paid_at)) : null,
                    'receipt' => $booking->is_paid == '1' ? $receiptNumber : null
                ];
            });
        return Inertia::render('Finance/Invoices', ['inv' => $inv]);
    }
    function expenseRecap(Request $request)
    {
        $hotel = Hotel::select('id', 'name')->orderBy('name', 'asc')->get();
        $destinationActivity = DestinationActivity::with(['destination:id,name'])->select('id', 'name', 'destination_id')->orderBy('name', 'asc')->get()->groupBy(function ($item) {
            return $item->destination->name;
        });
        $others = OthersActivity::select('id', 'name')->orderBy('name', 'asc')->get();
        $role = CrewRole::with('orderChannel')->orderBy('role', 'asc')->get()->map(function ($query) {
            return [
                'id' => $query->id,
                'name' => $query->orderChannel->name . " - " . $query->role,
            ];
        });
        $car = Car::select('id', 'name')->where('id', 1)->orWhere('id', 5)->orderBy('name', 'asc')->get();

        $data['masters'] = [
            'hotel' => $hotel,
            'activity' => $destinationActivity,
            'miscellaneous' => $others,
            'role' => $role,
            'car' => $car,
        ];
        $start = $request->start_date ? $request->start_date : date('Y-m-01');
        $end = $request->end_date ? $request->end_date : date('Y-m-t');
        $data['filters'] = [
            'id' => $request->id,
            'startDate' => $start,
            'endDate' => $end,
            'type' => $request->type ? $request->type : 'hotel',
        ];


        $id = $request->id;

        if ($request->type == 'hotel') {
            $data['data'] = BookHotel::with(['bookHotelMeal', 'booking.user', 'bookingItinerary', 'hotel', 'bookRoom.roomHotel'])->where('hotel_id', $id)
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
                    $checkOut = date('Y-m-d', strtotime($query->booking->travel_date_start . " +" . $query->bookingItinerary->day . " days"));

                    return [
                        'guest' => $query->booking->user->name,
                        'check_in' => date('d F Y', strtotime($checkIn)),
                        'check_out' => date('d F Y', strtotime($checkOut)),
                        'pax' => $query->booking->total_pax,
                        'rooms' => $query->bookRoom->map(function ($q) {
                            return [
                                'room_name' => $q->roomHotel->room_name,
                                'quantity' => $q->quantity,
                            ];
                        }),
                        'rooms_cost' => $query->bookRoom->sum('subtotal'),
                        'meals' => $query->bookHotelMeal->map(function ($q) {
                            return [
                                'meals' => $q->meals,
                                'quantity' => $q->qty,
                            ];
                        }),
                        'meals_cost' => $query->bookHotelMeal->sum('subtotal'),
                        'total' => $query->bookRoom->sum('subtotal') + $query->bookHotelMeal->sum('subtotal'),
                    ];
                })
                ->sortBy('check_in')
                ->values();
        } else if ($request->type == 'activity') {
            $data['data'] = BookDestinationActivity::with(['destinationActivity', 'booking.user'])
                ->where('destination_activity_id', $id)->whereHas('booking', function ($query) use ($start, $end) {
                    $query->whereBetween('travel_date_start', [$start, $end]);
                })->get()->map(function ($value) {
                    $bookingId = $value->booking_id;
                    $destinationId = $value->destination_id;
                    $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                        $query->where('destination_id', $destinationId);
                    })->first();
                    $activityDate = null;
                    if ($getActiviyDate) {
                        $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                    } else {
                        if ($destinationId == 6) {
                            $destinationId = 1;

                            $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                                $query->where('destination_id', $destinationId);
                            })->first();
                            $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                        } else if ($destinationId == 9) {
                            $destinationId = 2;

                            $getActiviyDate = BookingItinerary::where('booking_id', $bookingId)->whereHas('activityStart', function ($query) use ($destinationId) {
                                $query->where('destination_id', $destinationId);
                            })->first();
                            $activityDate = date('d F Y', strtotime($value->booking->travel_date_start . " +" . ($getActiviyDate->day - 1) . " days"));
                        }
                    }

                    return [
                        'guest' => $value->booking->user->name,
                        'travel_date' => date('d F Y', strtotime($value->booking->travel_date_start)),
                        'activity_date' => $activityDate,
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('activity_date')->values();
        } else if ($request->type == 'miscellaneous') {
            $data['data'] = BookOthersActivity::with(['othersActivity', 'booking.user'])
                ->where('others_activity_id', $id)->whereHas('booking', function ($query) use ($start, $end) {
                    $query->whereBetween('travel_date_start', [$start, $end]);
                })->get()->map(function ($value) {
                    return [
                        'guest' => $value->booking->user->name,
                        'travel_date' => date('d F Y', strtotime($value->booking->travel_date_start)),
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('travel_date')->values();
        } else if ($request->type == 'role') {
            $data['data'] = BookCrewActivity::with(['crewRole', 'booking.user'])
                ->where('crew_role_id', $id)->whereHas('booking', function ($query) use ($start, $end) {
                    $query->whereBetween('travel_date_start', [$start, $end]);
                })->get()->map(function ($value) {
                    return [
                        'guest' => $value->booking->user->name,
                        'travel_date' => date('d F Y', strtotime($value->booking->travel_date_start)),
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('travel_date')->values();
        } else if ($request->type == 'car') {
            $data['data'] = BookCarActivity::with(['car', 'booking.user'])
                ->where('car_id', $id)->whereHas('booking', function ($query) use ($start, $end) {
                    $query->whereBetween('travel_date_start', [$start, $end]);
                })->get()->map(function ($value) {
                    return [
                        'guest' => $value->booking->user->name,
                        'travel_date' => date('d F Y', strtotime($value->booking->travel_date_start)),
                        'qty' => $value->qty,
                        'rate' => $value->price,
                        'amount' => $value->subtotal,
                    ];
                })->sortBy('travel_date')->values();
        }
        return Inertia::render('Finance/ExpenseRecap', $data);
    }

    function rekapHutang(Request $request)
    {
        $month = $request->month ? $request->month : date('m');
        $year  = $request->year  ? $request->year  : date('Y');

        $vendors = Vendor::with('vendorCategory')->orderBy('vendor_category_id')->get();

        $vendorDebts = $vendors->map(function ($vendor) use ($month, $year) {
            $total     = 0;
            $itemCount = 0;

            if ($vendor->vendor_category_id == 1) {
                $bookHotels = BookHotel::with(['bookRoom', 'bookHotelMeal'])
                    ->where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('hotel', function ($q) use ($vendor) {
                        $q->where('vendor_id', $vendor->id);
                    })
                    ->whereHas('booking', function ($q) use ($month, $year) {
                        $q->where('travel_date_start', 'like', "$year-$month%");
                    })
                    ->get();

                $total     = $bookHotels->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));
                $itemCount = $bookHotels->count();

            } elseif ($vendor->vendor_category_id == 2) {
                $activities = BookDestinationActivity::where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('destinationActivity', function ($q) use ($vendor) {
                        $q->where('vendor_id', $vendor->id);
                    })
                    ->whereHas('booking', function ($q) use ($month, $year) {
                        $q->where('travel_date_start', 'like', "$year-$month%");
                    })
                    ->get();

                $total     = $activities->sum('subtotal');
                $itemCount = $activities->count();

            } elseif ($vendor->vendor_category_id == 3) {
                $carItems = BookCarActivity::where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('car', function ($q) use ($vendor) {
                        $q->where('vendor_id', $vendor->id);
                    })
                    ->whereHas('booking', function ($q) use ($month, $year) {
                        $q->where('travel_date_start', 'like', "$year-$month%");
                    })
                    ->get();

                $total     = $carItems->sum('subtotal');
                $itemCount = $carItems->count();

            } elseif ($vendor->vendor_category_id == 4) {
                $othersItems = BookOthersActivity::where('is_debt', '1')
                    ->whereNull('debt_payment_id')
                    ->whereHas('othersActivity', function ($q) use ($vendor) {
                        $q->where('vendor_id', $vendor->id);
                    })
                    ->whereHas('booking', function ($q) use ($month, $year) {
                        $q->where('travel_date_start', 'like', "$year-$month%");
                    })
                    ->get();

                $total     = $othersItems->sum('subtotal');
                $itemCount = $othersItems->count();
            }

            if ($total <= 0) return null;

            return [
                'id'              => $vendor->id,
                'name'            => $vendor->name,
                'category'        => $vendor->vendorCategory->name,
                'category_id'     => $vendor->vendor_category_id,
                'total'           => $total,
                'item_count'      => $itemCount,
                'formatted_total' => 'Rp ' . number_format($total, 0, ',', '.'),
            ];
        })->filter()->values();

        $totalHutang = $vendorDebts->sum('total');

        $months = [
            ['value' => '01', 'label' => 'Januari'],
            ['value' => '02', 'label' => 'Februari'],
            ['value' => '03', 'label' => 'Maret'],
            ['value' => '04', 'label' => 'April'],
            ['value' => '05', 'label' => 'Mei'],
            ['value' => '06', 'label' => 'Juni'],
            ['value' => '07', 'label' => 'Juli'],
            ['value' => '08', 'label' => 'Agustus'],
            ['value' => '09', 'label' => 'September'],
            ['value' => '10', 'label' => 'Oktober'],
            ['value' => '11', 'label' => 'November'],
            ['value' => '12', 'label' => 'Desember'],
        ];

        $currentYear = (int) date('Y');
        $years = [$currentYear - 1, $currentYear, $currentYear + 1];

        return Inertia::render('Finance/RekapHutang', [
            'vendors'         => $vendorDebts,
            'total_hutang'    => $totalHutang,
            'formatted_total' => 'Rp ' . number_format($totalHutang, 0, ',', '.'),
            'filters'         => ['month' => $month, 'year' => $year],
            'months'          => $months,
            'years'           => $years,
        ]);
    }

    function rekapHutangDetail(Request $request, $vendorId)
    {
        $month  = $request->month ? $request->month : date('m');
        $year   = $request->year  ? $request->year  : date('Y');

        $vendor = Vendor::with('vendorCategory')->findOrFail($vendorId);

        $debts = collect();

        if ($vendor->vendor_category_id == 1) {
            $bookHotels = BookHotel::with([
                'bookRoom.roomHotel',
                'bookHotelMeal',
                'booking.user',
                'bookingItinerary',
                'hotel',
            ])
                ->where('is_debt', '1')
                ->whereNull('debt_payment_id')
                ->whereHas('hotel', function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId);
                })
                ->whereHas('booking', function ($q) use ($month, $year) {
                    $q->where('travel_date_start', 'like', "$year-$month%");
                })
                ->get();

            $debts = $bookHotels->map(function ($bh) {
                $night = $bh->bookingItinerary ? $bh->bookingItinerary->day - 1 : 0;
                return [
                    'id'          => $bh->id,
                    'booking_id'  => $bh->booking_id,
                    'customer'    => $bh->booking->user->name,
                    'channel'     => $bh->booking->agent_id == 1 ? 'TWT' : ($bh->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                    'pax'         => (int) $bh->booking->total_pax,
                    'travel_date' => date('d M', strtotime($bh->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($bh->booking->travel_date_end)),
                    'check_in'    => date('d M Y', strtotime($bh->booking->travel_date_start . " +$night days")),
                    'rooms'       => $bh->bookRoom->map(fn($r) => [
                        'room'     => $r->roomHotel->room_name,
                        'quantity' => $r->quantity,
                        'price'    => $r->subtotal / max(1, $r->quantity),
                        'subtotal' => $r->subtotal,
                    ]),
                    'room_total'  => $bh->bookRoom->sum('subtotal'),
                    'meals'       => $bh->bookHotelMeal->map(fn($m) => [
                        'meals'    => ucfirst($m->meals),
                        'quantity' => $m->qty,
                        'price'    => $m->price,
                        'subtotal' => $m->subtotal,
                    ]),
                    'meals_total' => $bh->bookHotelMeal->sum('subtotal'),
                    'total'       => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'),
                    'type'        => 'hotel',
                ];
            })->sortBy('check_in')->values();

        } elseif ($vendor->vendor_category_id == 2) {
            $activities = BookDestinationActivity::with([
                'destinationActivity',
                'booking.bookingDetail.package',
                'booking.user',
            ])
                ->where('is_debt', '1')
                ->whereNull('debt_payment_id')
                ->whereHas('destinationActivity', function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId);
                })
                ->whereHas('booking', function ($q) use ($month, $year) {
                    $q->where('travel_date_start', 'like', "$year-$month%");
                })
                ->get();

            $isDestBromo = $activities->isNotEmpty() && $activities->first()->destinationActivity->destination_id == 1;

            if ($isDestBromo) {
                $debts = $activities->groupBy('booking_id')->map(function ($group) {
                    $first = $group->first();
                    $destinationId = $first->destination_id;
                    $itinerary = BookingItinerary::where('booking_id', $first->booking_id)
                        ->whereHas('activityStart', fn($q) => $q->where('destination_id', $destinationId))
                        ->first();
                    $activityDate = $itinerary
                        ? date('d M Y', strtotime($first->booking->travel_date_start . ' +' . ($itinerary->day - 1) . ' days'))
                        : '-';

                    return [
                        'id'            => $first->id,
                        'booking_id'    => $first->booking_id,
                        'customer'      => $first->booking->user->name,
                        'channel'       => $first->booking->agent_id == 1 ? 'TWT' : ($first->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax'           => (int) $first->booking->total_pax,
                        'travel_date'   => date('d M', strtotime($first->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($first->booking->travel_date_end)),
                        'activity_date' => $activityDate,
                        'bromo_ticket'  => $group->where('destination_activity_id', 1)->sum('subtotal'),
                        'jeep_unit'     => $group->whereNotIn('destination_activity_id', [1])->sum('qty'),
                        'bromo_jeep'    => $group->whereNotIn('destination_activity_id', [1])->sum('subtotal'),
                        'total'         => $group->sum('subtotal'),
                        'type'          => 'bromo',
                    ];
                })->values();
            } else {
                $debts = $activities->map(function ($act) {
                    $destinationId = $act->destination_id;
                    $itinerary = BookingItinerary::where('booking_id', $act->booking_id)
                        ->whereHas('activityStart', fn($q) => $q->where('destination_id', $destinationId))
                        ->first();
                    $activityDate = $itinerary
                        ? date('d M Y', strtotime($act->booking->travel_date_start . ' +' . ($itinerary->day - 1) . ' days'))
                        : '-';

                    return [
                        'id'            => $act->id,
                        'booking_id'    => $act->booking_id,
                        'customer'      => $act->booking->user->name,
                        'channel'       => $act->booking->agent_id == 1 ? 'TWT' : ($act->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax'           => (int) $act->booking->total_pax,
                        'travel_date'   => date('d M', strtotime($act->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($act->booking->travel_date_end)),
                        'activity_date' => $activityDate,
                        'activity'      => $act->destinationActivity->name ?? '-',
                        'qty'           => $act->qty,
                        'total'         => $act->subtotal,
                        'type'          => 'activity',
                    ];
                })->sortBy('activity_date')->values();
            }

        } elseif ($vendor->vendor_category_id == 3) {
            $carItems = BookCarActivity::with(['car', 'booking.user'])
                ->where('is_debt', '1')
                ->whereNull('debt_payment_id')
                ->whereHas('car', function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId);
                })
                ->whereHas('booking', function ($q) use ($month, $year) {
                    $q->where('travel_date_start', 'like', "$year-$month%");
                })
                ->get();

            $debts = $carItems->map(function ($bca) {
                return [
                    'id'          => $bca->id,
                    'booking_id'  => $bca->booking_id,
                    'customer'    => $bca->booking->user->name,
                    'channel'     => $bca->booking->agent_id == 1 ? 'TWT' : ($bca->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                    'pax'         => (int) $bca->booking->total_pax,
                    'travel_date' => date('d M', strtotime($bca->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($bca->booking->travel_date_end)),
                    'car'         => $bca->car->name ?? '-',
                    'qty'         => $bca->qty,
                    'driver'      => $bca->driver_txt ?: '-',
                    'total'       => (float) $bca->subtotal,
                    'type'        => 'car',
                ];
            })->sortBy('travel_date')->values();

        } elseif ($vendor->vendor_category_id == 4) {
            $othersItems = BookOthersActivity::with(['othersActivity', 'booking.user'])
                ->where('is_debt', '1')
                ->whereNull('debt_payment_id')
                ->whereHas('othersActivity', function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId);
                })
                ->whereHas('booking', function ($q) use ($month, $year) {
                    $q->where('travel_date_start', 'like', "$year-$month%");
                })
                ->get();

            $debts = $othersItems->map(function ($oa) {
                return [
                    'id'          => $oa->id,
                    'booking_id'  => $oa->booking_id,
                    'customer'    => $oa->booking->user->name,
                    'channel'     => $oa->booking->agent_id == 1 ? 'TWT' : ($oa->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                    'pax'         => (int) $oa->booking->total_pax,
                    'travel_date' => date('d M', strtotime($oa->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($oa->booking->travel_date_end)),
                    'item'        => $oa->othersActivity->name ?? '-',
                    'qty'         => $oa->qty,
                    'price'       => (float) $oa->price,
                    'total'       => (float) $oa->subtotal,
                    'type'        => 'others',
                ];
            })->sortBy('travel_date')->values();
        }

        $totalHutang = $debts->sum('total');

        $months = [
            ['value' => '01', 'label' => 'Januari'],
            ['value' => '02', 'label' => 'Februari'],
            ['value' => '03', 'label' => 'Maret'],
            ['value' => '04', 'label' => 'April'],
            ['value' => '05', 'label' => 'Mei'],
            ['value' => '06', 'label' => 'Juni'],
            ['value' => '07', 'label' => 'Juli'],
            ['value' => '08', 'label' => 'Agustus'],
            ['value' => '09', 'label' => 'September'],
            ['value' => '10', 'label' => 'Oktober'],
            ['value' => '11', 'label' => 'November'],
            ['value' => '12', 'label' => 'Desember'],
        ];

        $currentYear = (int) date('Y');
        $years = [$currentYear - 1, $currentYear, $currentYear + 1];

        return Inertia::render('Finance/RekapHutangDetail', [
            'vendor'          => [
                'id'       => $vendor->id,
                'name'     => $vendor->name,
                'category' => $vendor->vendorCategory->name,
            ],
            'debts'           => $debts,
            'total_hutang'    => $totalHutang,
            'formatted_total' => 'Rp ' . number_format($totalHutang, 0, ',', '.'),
            'filters'         => ['month' => $month, 'year' => $year],
            'months'          => $months,
            'years'           => $years,
        ]);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function rekapHutangPeriodLabel($month, $year): string
    {
        $labels = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
            '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
            '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
        ];
        return ($labels[$month] ?? $month) . ' ' . $year;
    }

    private function buildVendorDebtsList($month, $year)
    {
        $vendors = Vendor::with('vendorCategory')->orderBy('vendor_category_id')->get();

        return $vendors->map(function ($vendor) use ($month, $year) {
            $total = 0; $itemCount = 0;

            if ($vendor->vendor_category_id == 1) {
                $items = BookHotel::with(['bookRoom', 'bookHotelMeal'])
                    ->where('is_debt', '1')->whereNull('debt_payment_id')
                    ->whereHas('hotel', fn($q) => $q->where('vendor_id', $vendor->id))
                    ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                    ->get();
                $total = $items->sum(fn($bh) => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'));
                $itemCount = $items->count();

            } elseif ($vendor->vendor_category_id == 2) {
                $items = BookDestinationActivity::where('is_debt', '1')->whereNull('debt_payment_id')
                    ->whereHas('destinationActivity', fn($q) => $q->where('vendor_id', $vendor->id))
                    ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                    ->get();
                $total = $items->sum('subtotal'); $itemCount = $items->count();

            } elseif ($vendor->vendor_category_id == 3) {
                $items = BookCarActivity::where('is_debt', '1')->whereNull('debt_payment_id')
                    ->whereHas('car', fn($q) => $q->where('vendor_id', $vendor->id))
                    ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                    ->get();
                $total = $items->sum('subtotal'); $itemCount = $items->count();

            } elseif ($vendor->vendor_category_id == 4) {
                $items = BookOthersActivity::where('is_debt', '1')->whereNull('debt_payment_id')
                    ->whereHas('othersActivity', fn($q) => $q->where('vendor_id', $vendor->id))
                    ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                    ->get();
                $total = $items->sum('subtotal'); $itemCount = $items->count();
            }

            if ($total <= 0) return null;

            return [
                'id'              => $vendor->id,
                'name'            => $vendor->name,
                'category'        => $vendor->vendorCategory->name,
                'total'           => (float) $total,
                'item_count'      => $itemCount,
                'formatted_total' => 'Rp ' . number_format($total, 0, ',', '.'),
            ];
        })->filter()->values();
    }

    private function buildVendorDebtsDetail($vendorId, $month, $year)
    {
        $vendor = Vendor::with('vendorCategory')->findOrFail($vendorId);
        $debts  = collect();

        if ($vendor->vendor_category_id == 1) {
            $bookHotels = BookHotel::with(['bookRoom.roomHotel', 'bookHotelMeal', 'booking.user', 'bookingItinerary', 'hotel'])
                ->where('is_debt', '1')->whereNull('debt_payment_id')
                ->whereHas('hotel', fn($q) => $q->where('vendor_id', $vendorId))
                ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                ->get();

            $debts = $bookHotels->map(function ($bh) {
                $night = $bh->bookingItinerary ? $bh->bookingItinerary->day - 1 : 0;
                return [
                    'id'          => $bh->id,
                    'booking_id'  => $bh->booking_id,
                    'customer'    => $bh->booking->user->name,
                    'channel'     => $bh->booking->agent_id == 1 ? 'TWT' : ($bh->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                    'pax'         => (int) $bh->booking->total_pax,
                    'travel_date' => date('d M', strtotime($bh->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($bh->booking->travel_date_end)),
                    'check_in'    => date('d M Y', strtotime($bh->booking->travel_date_start . " +$night days")),
                    'rooms'       => $bh->bookRoom->map(fn($r) => [
                        'room' => $r->roomHotel->room_name, 'quantity' => $r->quantity,
                        'price' => $r->subtotal / max(1, $r->quantity), 'subtotal' => $r->subtotal,
                    ]),
                    'room_total'  => $bh->bookRoom->sum('subtotal'),
                    'meals'       => $bh->bookHotelMeal->map(fn($m) => [
                        'meals' => ucfirst($m->meals), 'quantity' => $m->qty,
                        'price' => $m->price, 'subtotal' => $m->subtotal,
                    ]),
                    'meals_total' => $bh->bookHotelMeal->sum('subtotal'),
                    'total'       => $bh->bookRoom->sum('subtotal') + $bh->bookHotelMeal->sum('subtotal'),
                    'type'        => 'hotel',
                ];
            })->sortBy('check_in')->values();

        } elseif ($vendor->vendor_category_id == 2) {
            $activities = BookDestinationActivity::with(['destinationActivity', 'booking.bookingDetail.package', 'booking.user'])
                ->where('is_debt', '1')->whereNull('debt_payment_id')
                ->whereHas('destinationActivity', fn($q) => $q->where('vendor_id', $vendorId))
                ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                ->get();

            $isDestBromo = $activities->isNotEmpty() && $activities->first()->destinationActivity->destination_id == 1;

            if ($isDestBromo) {
                $debts = $activities->groupBy('booking_id')->map(function ($group) {
                    $first         = $group->first();
                    $destinationId = $first->destination_id;
                    $itinerary     = BookingItinerary::where('booking_id', $first->booking_id)
                        ->whereHas('activityStart', fn($q) => $q->where('destination_id', $destinationId))->first();
                    $activityDate  = $itinerary
                        ? date('d M Y', strtotime($first->booking->travel_date_start . ' +' . ($itinerary->day - 1) . ' days')) : '-';
                    return [
                        'id'            => $first->id, 'booking_id' => $first->booking_id,
                        'customer'      => $first->booking->user->name,
                        'channel'       => $first->booking->agent_id == 1 ? 'TWT' : ($first->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax'           => (int) $first->booking->total_pax,
                        'travel_date'   => date('d M', strtotime($first->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($first->booking->travel_date_end)),
                        'activity_date' => $activityDate,
                        'bromo_ticket'  => $group->where('destination_activity_id', 1)->sum('subtotal'),
                        'jeep_unit'     => $group->whereNotIn('destination_activity_id', [1])->sum('qty'),
                        'bromo_jeep'    => $group->whereNotIn('destination_activity_id', [1])->sum('subtotal'),
                        'total'         => $group->sum('subtotal'), 'type' => 'bromo',
                    ];
                })->values();
            } else {
                $debts = $activities->map(function ($act) {
                    $destinationId = $act->destination_id;
                    $itinerary     = BookingItinerary::where('booking_id', $act->booking_id)
                        ->whereHas('activityStart', fn($q) => $q->where('destination_id', $destinationId))->first();
                    $activityDate  = $itinerary
                        ? date('d M Y', strtotime($act->booking->travel_date_start . ' +' . ($itinerary->day - 1) . ' days')) : '-';
                    return [
                        'id'            => $act->id, 'booking_id' => $act->booking_id,
                        'customer'      => $act->booking->user->name,
                        'channel'       => $act->booking->agent_id == 1 ? 'TWT' : ($act->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                        'pax'           => (int) $act->booking->total_pax,
                        'travel_date'   => date('d M', strtotime($act->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($act->booking->travel_date_end)),
                        'activity_date' => $activityDate,
                        'activity'      => $act->destinationActivity->name ?? '-',
                        'qty'           => $act->qty, 'total' => $act->subtotal, 'type' => 'activity',
                    ];
                })->sortBy('activity_date')->values();
            }

        } elseif ($vendor->vendor_category_id == 3) {
            $carItems = BookCarActivity::with(['car', 'booking.user'])
                ->where('is_debt', '1')->whereNull('debt_payment_id')
                ->whereHas('car', fn($q) => $q->where('vendor_id', $vendorId))
                ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                ->get();
            $debts = $carItems->map(fn($bca) => [
                'id'          => $bca->id, 'booking_id' => $bca->booking_id,
                'customer'    => $bca->booking->user->name,
                'channel'     => $bca->booking->agent_id == 1 ? 'TWT' : ($bca->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                'pax'         => (int) $bca->booking->total_pax,
                'travel_date' => date('d M', strtotime($bca->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($bca->booking->travel_date_end)),
                'car'         => $bca->car->name ?? '-', 'qty' => $bca->qty,
                'driver'      => $bca->driver_txt ?: '-', 'total' => (float) $bca->subtotal, 'type' => 'car',
            ])->sortBy('travel_date')->values();

        } elseif ($vendor->vendor_category_id == 4) {
            $othersItems = BookOthersActivity::with(['othersActivity', 'booking.user'])
                ->where('is_debt', '1')->whereNull('debt_payment_id')
                ->whereHas('othersActivity', fn($q) => $q->where('vendor_id', $vendorId))
                ->whereHas('booking', fn($q) => $q->where('travel_date_start', 'like', "$year-$month%"))
                ->get();
            $debts = $othersItems->map(fn($oa) => [
                'id'          => $oa->id, 'booking_id' => $oa->booking_id,
                'customer'    => $oa->booking->user->name,
                'channel'     => $oa->booking->agent_id == 1 ? 'TWT' : ($oa->booking->booking_category_id == '3' ? 'KLOOK' : 'JVTO'),
                'pax'         => (int) $oa->booking->total_pax,
                'travel_date' => date('d M', strtotime($oa->booking->travel_date_start)) . ' – ' . date('d M Y', strtotime($oa->booking->travel_date_end)),
                'item'        => $oa->othersActivity->name ?? '-',
                'qty'         => $oa->qty, 'price' => (float) $oa->price,
                'total'       => (float) $oa->subtotal, 'type' => 'others',
            ])->sortBy('travel_date')->values();
        }

        return compact('vendor', 'debts');
    }

    // ── Export methods ───────────────────────────────────────────────────────

    function rekapHutangExportPdf(Request $request)
    {
        $month  = $request->month ?: date('m');
        $year   = $request->year  ?: date('Y');
        $vendors = $this->buildVendorDebtsList($month, $year);
        $total   = $vendors->sum('total');
        $period  = $this->rekapHutangPeriodLabel($month, $year);

        $pdf = PDF::loadView('exports.rekap-hutang-pdf', compact('vendors', 'total', 'period'));
        $pdf->setPaper('A4', 'portrait');
        return $pdf->download("rekap-hutang-$month-$year.pdf");
    }

    function rekapHutangExportExcel(Request $request)
    {
        $month  = $request->month ?: date('m');
        $year   = $request->year  ?: date('Y');
        $vendors = $this->buildVendorDebtsList($month, $year);
        $total   = $vendors->sum('total');
        $period  = $this->rekapHutangPeriodLabel($month, $year);

        $filename = "rekap-hutang-$month-$year.xls";
        header("Content-type: application/vnd-ms-excel");
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.rekap-hutang-excel', compact('vendors', 'total', 'period'));
    }

    function rekapHutangDetailExportPdf(Request $request, $vendorId)
    {
        $month  = $request->month ?: date('m');
        $year   = $request->year  ?: date('Y');
        $data   = $this->buildVendorDebtsDetail($vendorId, $month, $year);
        $vendor = $data['vendor'];
        $debts  = $data['debts'];
        $total  = $debts->sum('total');
        $period = $this->rekapHutangPeriodLabel($month, $year);
        $type   = $debts->isNotEmpty() ? $debts->first()['type'] : 'others';

        $pdf = PDF::loadView('exports.rekap-hutang-detail-pdf', compact('vendor', 'debts', 'total', 'period', 'type'));
        $pdf->setPaper('A4', 'landscape');
        return $pdf->download("rekap-hutang-{$vendor->name}-$month-$year.pdf");
    }

    function rekapHutangDetailExportExcel(Request $request, $vendorId)
    {
        $month  = $request->month ?: date('m');
        $year   = $request->year  ?: date('Y');
        $data   = $this->buildVendorDebtsDetail($vendorId, $month, $year);
        $vendor = $data['vendor'];
        $debts  = $data['debts'];
        $total  = $debts->sum('total');
        $period = $this->rekapHutangPeriodLabel($month, $year);
        $type   = $debts->isNotEmpty() ? $debts->first()['type'] : 'others';

        $filename = "rekap-hutang-{$vendor->name}-$month-$year.xls";
        header("Content-type: application/vnd-ms-excel");
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.rekap-hutang-detail-excel', compact('vendor', 'debts', 'total', 'period', 'type'));
    }

    // ─── Channel Revenue Report ───────────────────────────────────────────────

    function channelReport(Request $request)
    {
        $month = $request->month ? str_pad($request->month, 2, '0', STR_PAD_LEFT) : date('m');
        $year  = $request->year  ? (int) $request->year  : (int) date('Y');

        $channels   = $this->buildChannelData($month, $year);
        $googleBill = GoogleBill::where('month', (int) $month)->where('year', $year)->first();
        $allKlookBookings = $this->buildAllKlookBookingsForPeriod($month, $year);

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = ['value' => str_pad($m, 2, '0', STR_PAD_LEFT), 'label' => date('F', mktime(0, 0, 0, $m, 1))];
        }
        $years = range(date('Y') - 2, date('Y') + 1);

        return Inertia::render('Finance/ChannelReport', [
            'filters'          => ['month' => $month, 'year' => (string) $year],
            'channels'         => $channels,
            'google_bill'      => $googleBill,
            'klook_bookings'   => $allKlookBookings,
            'months'           => $months,
            'years'            => $years,
        ]);
    }

    function saveGoogleBill(Request $request)
    {
        $month = str_pad($request->month, 2, '0', STR_PAD_LEFT);
        $year  = (int) $request->year;

        GoogleBill::updateOrCreate(
            ['month' => (int) $month, 'year' => $year],
            ['google_cloud' => (int) $request->google_cloud, 'google_ads' => (int) $request->google_ads]
        );

        return back()->with('success', 'Google bill saved.');
    }

    function updateChannelTag(Request $request)
    {
        $booking = Booking::findOrFail($request->booking_id);
        $booking->channel_tag = $request->channel_tag ?: null;
        $booking->save();

        return response()->json(['ok' => true]);
    }

    function channelReportExportPdf(Request $request, string $channel)
    {
        $month  = str_pad($request->month ?: date('m'), 2, '0', STR_PAD_LEFT);
        $year   = (int) ($request->year ?: date('Y'));
        $period = $this->crPeriodLabel($month, $year);

        if ($channel === 'net-profit') {
            $channels   = $this->buildChannelData($month, $year);
            $googleBill = GoogleBill::where('month', (int)$month)->where('year', $year)->first();
            $pdf = PDF::loadView('exports.channel-report-net-profit-pdf', compact('channels', 'googleBill', 'period'));
            $pdf->setPaper('A4', 'portrait');
            return $pdf->download("net-profit-$month-$year.pdf");
        }

        $channelData = $this->buildChannelData($month, $year);
        $bookings    = $channelData[$channel]['bookings'] ?? collect();
        $totals      = $channelData[$channel] ?? [];
        $label       = $this->crChannelLabel($channel);
        $pdf = PDF::loadView('exports.channel-report-channel-pdf', compact('bookings', 'totals', 'label', 'period', 'channel'));
        $pdf->setPaper('A4', 'landscape');
        return $pdf->download("$channel-report-$month-$year.pdf");
    }

    function channelReportExportExcel(Request $request, string $channel)
    {
        $month  = str_pad($request->month ?: date('m'), 2, '0', STR_PAD_LEFT);
        $year   = (int) ($request->year ?: date('Y'));
        $period = $this->crPeriodLabel($month, $year);

        if ($channel === 'net-profit') {
            $channels   = $this->buildChannelData($month, $year);
            $googleBill = GoogleBill::where('month', (int)$month)->where('year', $year)->first();
            $filename   = "net-profit-$month-$year.xls";
            header("Content-type: application/vnd-ms-excel");
            header("Content-Disposition: attachment; filename=$filename");
            return view('exports.channel-report-net-profit-excel', compact('channels', 'googleBill', 'period'));
        }

        $channelData = $this->buildChannelData($month, $year);
        $bookings    = $channelData[$channel]['bookings'] ?? collect();
        $totals      = $channelData[$channel] ?? [];
        $label       = $this->crChannelLabel($channel);
        $filename    = "$channel-report-$month-$year.xls";
        header("Content-type: application/vnd-ms-excel");
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.channel-report-channel-excel', compact('bookings', 'totals', 'label', 'period', 'channel'));
    }

    private function buildChannelData(string $month, int $year): array
    {
        $base = Booking::where('status', 'booked')
            ->whereYear('travel_date_start', $year)
            ->whereMonth('travel_date_start', (int) $month);

        $jvtoRows = (clone $base)
            ->where('agent_id', 2)
            ->where('booking_category_id', '!=', 3)
            ->get();

        $twtRows = (clone $base)
            ->where('agent_id', 1)
            ->get();

        $klookAll = (clone $base)
            ->where('agent_id', 2)
            ->where('booking_category_id', 3)
            ->get();

        $klookRows  = $klookAll->filter(fn($b) => $this->resolveChannelTag($b) === 'klook');
        $gygRows    = $klookAll->filter(fn($b) => $this->resolveChannelTag($b) === 'gyg');
        $viatorRows = $klookAll->filter(fn($b) => $this->resolveChannelTag($b) === 'viator');

        return [
            'jvto'   => $this->crSumChannel($jvtoRows,  'jvto'),
            'twt'    => $this->crSumChannel($twtRows,   'twt'),
            'klook'  => $this->crSumChannel($klookRows,  'klook'),
            'gyg'    => $this->crSumChannel($gygRows,    'gyg'),
            'viator' => $this->crSumChannel($viatorRows, 'viator'),
        ];
    }

    private function buildAllKlookBookingsForPeriod(string $month, int $year): \Illuminate\Support\Collection
    {
        return Booking::where('status', 'booked')
            ->where('agent_id', 2)
            ->where('booking_category_id', 3)
            ->whereYear('travel_date_start', $year)
            ->whereMonth('travel_date_start', (int) $month)
            ->orderBy('travel_date_start')
            ->get()
            ->map(fn($b) => [
                'id'                  => $b->id,
                'invoice_code_origin' => $b->invoice_code_origin,
                'customer'            => optional($b->user)->name ?? $b->booking_from ?? '-',
                'total_pax'           => $b->total_pax,
                'trip_date'           => $b->travel_date_start ? date('d M y', strtotime($b->travel_date_start)) : '-',
                'invoice'             => (int) $b->grand_total,
                'expense'             => (int) $b->expense_internal_total,
                'profit'              => (int) $b->grand_total - (int) $b->expense_internal_total,
                'channel_tag'         => $b->channel_tag,
                'resolved_channel'    => $this->resolveChannelTag($b),
            ]);
    }

    private function crSumChannel(\Illuminate\Support\Collection $rows, string $channel): array
    {
        $bookings = $rows->sortBy('travel_date_start')->values()->map(function ($b, $i) use ($channel) {
            $bookingNumber = $channel === 'jvto' ? $b->booking_code : $b->invoice_code_origin;
            $customer      = optional($b->user)->name ?? $b->booking_from ?? '-';
            $invoice       = (int) $b->grand_total;
            $expense       = (int) $b->expense_internal_total;
            return [
                'no'             => $i + 1,
                'booking_number' => $bookingNumber ?? '-',
                'customer'       => $customer,
                'total_pax'      => $b->total_pax,
                'trip_date'      => $b->travel_date_start ? date('d M y', strtotime($b->travel_date_start)) : '-',
                'invoice'        => $invoice,
                'expense'        => $expense,
                'profit'         => $invoice - $expense,
            ];
        });

        $totalInvoice = $bookings->sum('invoice');
        $totalExpense = $bookings->sum('expense');

        return [
            'bookings'      => $bookings,
            'total_invoice' => $totalInvoice,
            'total_expense' => $totalExpense,
            'total_profit'  => $totalInvoice - $totalExpense,
        ];
    }

    private function resolveChannelTag(\App\Models\Booking $b): string
    {
        if ($b->channel_tag) return $b->channel_tag;
        if ($b->invoice_code_origin && str_starts_with(strtoupper($b->invoice_code_origin), 'GYG')) return 'gyg';
        return 'klook';
    }

    private function crPeriodLabel(string $month, int $year): string
    {
        return date('F Y', mktime(0, 0, 0, (int) $month, 1, $year));
    }

    private function crChannelLabel(string $channel): string
    {
        return match ($channel) {
            'jvto'   => 'JVTO',
            'twt'    => 'TWT',
            'klook'  => 'KLOOK',
            'gyg'    => 'GetYourGuide',
            'viator' => 'Viator',
            default  => strtoupper($channel),
        };
    }
}
