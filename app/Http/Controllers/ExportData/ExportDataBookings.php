<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\BookAddOn;
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
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExportDataBookings extends Controller
{
    protected string $firstDate;
    public function __construct()
    {
        $this->firstDate = Carbon::now()->subMonths(12)->toDateString();//16-09-2024
    }
    function bookings()
    {
        $bookings = Booking::with(['bookingDetail.package', 'bookingDocument'])->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $bookings = $bookings
            ->get()->map(function ($booking) {
                $dateNow = Carbon::now()->toDateString();
                if ($dateNow < $booking->travel_date_start) {
                    $tripStatus = 'pre_trip';
                } elseif ($dateNow >= $booking->travel_date_start && $dateNow <= $booking->travel_date_end) {
                    $tripStatus = 'in_progress';
                } else {
                    $tripStatus = 'completed';
                }
                if ($booking->balance == ($booking->grand_total + $booking->book_add_on_total)) {
                    $paymentStatus = 'unpaid';
                } else if ($booking->balance == 0) {
                    $paymentStatus = 'paid';
                } else {
                    $paymentStatus = 'partially_paid';
                }
                $orderChannelId = $booking->agent_id == 1 ? 2 : ($booking->booking_category_id == 3 ? 3 : 1);
                $invoiceFileOrigin = null;
                if ($orderChannelId == 2) {
                    $invoiceFileOrigin = $booking->bookingDocument->where('attachment_type_id', 6)->last();
                    $invoiceFileOrigin = $invoiceFileOrigin ? '/customer-document/' . $invoiceFileOrigin->file : null;
                } else if ($orderChannelId == 3) {
                    $invoiceFileOrigin = $booking->bookingDocument->where('attachment_type_id', 7)->last();
                    $invoiceFileOrigin = $invoiceFileOrigin ? '/customer-document/' . $invoiceFileOrigin->file : null;
                }
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'booking_code_origin' => $booking->invoice_code_origin,
                    'invoice_file_origin' => $invoiceFileOrigin,
                    'customer_id' => $booking->user_id,
                    'package_id' => $booking->bookingDetail[0]->package_id ?? null,
                    'duration_id' => $booking->bookingDetail[0]->package->duration_id ?? null,
                    'order_channel_id' => $orderChannelId,
                    'booking_date' => $booking->booking_date,
                    'start_date' => $booking->travel_date_start,
                    'end_date' => $booking->travel_date_end,
                    'total_participants' => $booking->total_pax,
                    'booking_status' => 'confirmed',
                    'trip_status' => $tripStatus,
                    'payment_status' => $paymentStatus,
                    'is_shuttle_service' => $booking->is_shuttle == '1' ? true : false,
                    'slug' => $booking->url_name,
                    'trip_media_url' => $booking->media_link,
                    'special_requirement' => $booking->special_requirements,
                    'internal_note' => $booking->note,
                    'is_invoice_twt' => $booking->is_invoiced_twt == '1' ? true : false,
                    'date_paid_invoiced_twt' => $booking->date_paid_invoiced_twt,
                    'is_police_escort' => $booking->is_police_escort == '1' ? true : false,
                    'is_send_whatsapp' => $booking->is_send_wa == '1' ? true : false,
                    'created_at' => $booking->created_at,
                    'updated_at' => $booking->updated_at,
                    'deleted_at  ' => $booking->deleted_at,
                ];
            });
        $columns = ['id', 'booking_code', 'booking_code_origin', 'invoice_file_origin', 'customer_id', 'package_id', 'duration_id', 'order_channel_id', 'booking_date', 'start_date', 'end_date', 'total_participants', 'booking_status', 'trip_status', 'payment_status', 'is_shuttle_service', 'slug', 'trip_media_url', 'special_requirement', 'internal_note', 'is_invoice_twt', 'date_paid_invoiced_twt', 'is_police_escort', 'is_send_whatsapp', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('bookings.csv', $columns, $bookings->toArray());
    }
    function bookingPaymentTerms()
    {
        $bookings = Booking::with(['bookingDetail'])->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            $paymentMethods = [
                'pay later' => 7,
                'wise' => 5,
                'cc' => 3,
                'edc' => 4,
                'cash' => 1,
            ];
            $date1 = new DateTime(date('Y-m-d'));
            $date2 = new DateTime($booking->travel_date_start);
            $interval = $date1->diff($date2);
            $differenceInDays = $interval->days;

            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'deposit_payment_method_id' => $paymentMethods[$booking->payment_method],
                'deposit_payment_link' => $booking->payment_link,
                'deposit_due_date' => Carbon::parse($booking->booking_date)->addDays(1)->toDateString(),
                'deposit_amount' => $booking->dp,
                'outstanding_payment_method_id' => $booking->outstanding_payment_method ? $paymentMethods[$booking->outstanding_payment_method] : null,
                'outstanding_payment_link' => $booking->outstanding_payment_link,
                'full_payment_due_date' => $differenceInDays <= 7 ? $booking->travel_date_start : Carbon::parse($booking->travel_date_start)->subDays(7)->toDateString(),
                'total_before_discount' => $booking->grand_total_before_disc,
                'total_discount' => $booking->discount,
                'discount_id' => $booking->discount_id,
                'discount_type' => $booking->discount_type,
                'total_add_on' => $booking->book_add_on_total,
                'grandtotal' => $booking->grand_total + $booking->book_add_on_total,
                'total_payment' => $booking->payment,
                'balance' => $booking->balance,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at' => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'deposit_payment_method_id', 'deposit_payment_link', 'deposit_due_date', 'deposit_amount', 'outstanding_payment_method_id', 'outstanding_payment_link', 'full_payment_due_date', 'total_before_discount', 'total_discount', 'discount_id', 'discount_type', 'total_add_on', 'grandtotal', 'total_payment', 'balance', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_payment_terms.csv', $columns, $bookings->toArray());
    }
    function bookingPaymentHistories()
    {
        $paymentHistories = BookingPayment::whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $paymentHistories = $paymentHistories->limit(request()->limit);
        }
        $paymentHistories = $paymentHistories
            ->get()->map(function ($paymentHistory) {
                return [
                    'id' => $paymentHistory->id,
                    'booking_id' => $paymentHistory->booking_id,
                    'amount' => $paymentHistory->nominal,
                    'payment_method_id' => $paymentHistory->payment_method_id,
                    'description' => $paymentHistory->description,
                    'reference' => $paymentHistory->reference,
                    'attachment' => null,
                    'payment_date' => $paymentHistory->created_at,
                    'created_at' => $paymentHistory->created_at,
                    'updated_at' => $paymentHistory->updated_at,
                    'deleted_at' => $paymentHistory->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'booking_id', 'amount', 'payment_method_id', 'description', 'reference', 'attachment', 'payment_date', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_payment_histories.csv', $columns, $paymentHistories);
    }
    function bookingLogistics()
    {
        $bookings = Booking::where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'pickup_location' => $booking->meeting_point,
                'pickup_location_detail' => (
                    $booking->meeting_point === 'Others' || Str::contains($booking->meeting_point, 'Hotel')
                    ? $booking->meeting_point_value
                    : $booking->meeting_point_arrival
                ),
                'pickup_time' => $booking->pickup_time,
                'pickup_ticket_number' => Str::contains($booking->meeting_point, 'Airport') || Str::contains($booking->meeting_point, 'Station') ? $booking->meeting_point_value : null,
                'dropoff_location' => $booking->drop_point,
                'dropoff_location_detail' => (
                    $booking->drop_point === 'Others' || Str::contains($booking->drop_point, 'Hotel')
                    ? $booking->drop_point_value
                    : $booking->drop_point_arrival
                ),
                'dropoff_time' => $booking->drop_time,
                'dropoff_ticket_number' => Str::contains($booking->drop_point, 'Airport') || Str::contains($booking->drop_point, 'Station') ? $booking->drop_point_value : null,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at' => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'pickup_location', 'pickup_location_detail', 'pickup_time', 'pickup_ticket_number', 'dropoff_location', 'dropoff_location_detail', 'dropoff_time', 'dropoff_ticket_number', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_logistics.csv', $columns, $bookings->toArray());
    }
    function bookingPoliceEscorts()
    {
        $bookings = Booking::where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->where('is_police_escort', '1')->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'police_escort_date' => $booking->police_escort_pickup_date,
                'police_escort_route' => $booking->police_escort_route,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at  '   => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'police_escort_date', 'police_escort_route', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_police_escorts.csv', $columns, $bookings->toArray());
    }
    function bookingTshirts()
    {
        $bookings = Booking::with('bookingDetail')->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'xss' => $booking->bookingDetail[0]->xss,
                'xxs' => $booking->bookingDetail[0]->xxs,
                'xs' => $booking->bookingDetail[0]->xs,
                's' => $booking->bookingDetail[0]->s,
                'm' => $booking->bookingDetail[0]->m,
                'l' => $booking->bookingDetail[0]->l,
                'xl' => $booking->bookingDetail[0]->xl,
                'xxl' => $booking->bookingDetail[0]->xxl,
                'xxxl' => $booking->bookingDetail[0]->xxxl,
                'xxxxl' => 0,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at  '   => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'xss', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_tshirts.csv', $columns, $bookings->toArray());
    }
    function bookingDestinationSchedules()
    {
        $bookings = Booking::with('bookingItinerary')->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            $atTumpakSewuDate = $booking->bookingItinerary->where('activity_start_id', 4)->last() ?? null;
            if ($atTumpakSewuDate) {
                $addDays = $atTumpakSewuDate->day - 1;
                $atTumpakSewuDate = Carbon::parse($booking->travel_date_start)->addDays($addDays)->toDateString();
            }
            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'at_ijen_date' => $booking->at_bondowoso,
                'at_bromo_date' => $booking->at_bromo,
                'bromo_hotel_id' => $booking->bromo_hotel_id,
                'at_tumpak_sewu_date' => $atTumpakSewuDate,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at  '   => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'at_ijen_date', 'at_bromo_date', 'bromo_hotel_id', 'at_tumpak_sewu_date', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_destination_schedules.csv', $columns, $bookings->toArray());
    }

    function bookingFinances()
    {
        $bookings = Booking::with('bookingPayment')->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate)->orderBy('id', 'asc');

        if (request()->limit) {
            $bookings = $bookings->limit(request()->limit);
        }
        $id = 0;
        $bookings = $bookings->get()->map(function ($booking) use (&$id) {
            $id++;
            if ($booking->balance == 0) {
                $lastPayment = $booking->bookingPayment->first();

                $count = $booking->bookingPayment->count();

                if ($count == 1) {
                    $dp = $booking->bookingPayment->sum('nominal');
                } else {
                    // Then sum all payments except the one with that ID
                    $dp = $booking->bookingPayment
                        ->when($lastPayment, function ($query) use ($lastPayment) {
                            return $query->where('id', '!=', $lastPayment->id);
                        })
                        ->sum('nominal');
                }
            } else {
                $dp = $booking->balance;
            }
            $profit = $dp - $booking->expense_internal_total;


            return [
                'id' => $id,
                'booking_id' => $booking->id,
                'total_expense' => (int)$booking->expense_internal_total,
                'total_expense_crew' => (int)$booking->total_expense_crew,
                'total_expense_paid' => (int)$booking->total_expense_paid,
                'total_expense_debt' => (int)$booking->total_expense_debt,
                'profit' => $profit,
                'created_at' => $booking->created_at,
                'updated_at' => $booking->updated_at,
                'deleted_at  '   => $booking->deleted_at,
            ];
        });
        $columns = ['id', 'booking_id', 'total_expense', 'total_expense_crew', 'total_expense_paid', 'total_expense_debt', 'profit', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_finances.csv', $columns, $bookings->toArray());
    }
    function bookingItineraries()
    {
        $bookingItineraries = BookingItinerary::whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookingItineraries = $bookingItineraries->limit(request()->limit);
        }
        $bookingItineraries = $bookingItineraries
            ->get()->map(function ($itinerary) {
                $date = Carbon::parse($itinerary->booking->travel_date_start)->addDays($itinerary->day - 1)->toDateString();
                return [
                    'id' => $itinerary->id,
                    'booking_id' => $itinerary->booking_id,
                    'day' => $itinerary->day,
                    'date' => $date,
                    'activity_start_id' => $itinerary->activity_start_id,
                    'activity_end_id' => $itinerary->activity_end_id,
                    'itinerary' => $itinerary->itinerary,
                    'activity' => $itinerary->activity,
                    'breakfast' => $itinerary->b == '1' ? true : false,
                    'lunch' => $itinerary->l == '1' ? true : false,
                    'dinner' => $itinerary->d == '1' ? true : false,
                    'created_at' => $itinerary->created_at,
                    'updated_at' => $itinerary->updated_at,
                    'deleted_at  ' => $itinerary->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'booking_id', 'day', 'date', 'activity_start_id', 'activity_end_id', 'itinerary', 'activity', 'breakfast', 'lunch', 'dinner', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_itineraries.csv', $columns, $bookingItineraries);
    }
    function bookingHotels()
    {
        $bookingHotels = BookHotel::with(['bookRoom', 'bookHotelMeal'])->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookingHotels = $bookingHotels->limit(request()->limit);
        }
        $bookingHotels = $bookingHotels
            ->get()->map(function ($bookHotel) {
                return [
                    'id' => $bookHotel->id,
                    'booking_id' => $bookHotel->booking_id,
                    'booking_itinerary_id' => $bookHotel->booking_itinerary_id,
                    'hotel_id' => $bookHotel->hotel_id,
                    'breakfast' => $bookHotel->b == '1' ? true : false,
                    'lunch' => $bookHotel->l == '1' ? true : false,
                    'dinner' => $bookHotel->d == '1' ? true : false,
                    'reservation_status' => $bookHotel->status == '1' ? true : false,
                    'reject_message' => $bookHotel->reject_msg,
                    'total_room_cost' => $bookHotel->total_rooms,
                    'total_meal_cost' => $bookHotel->total_meals,
                    'total' => $bookHotel->total,
                    'is_paid' => $bookHotel->is_paid == '1' ? true : false,
                    'is_debt' => $bookHotel->is_debt == '1' ? true : false,
                    'created_at' => $bookHotel->created_at,
                    'updated_at' => $bookHotel->updated_at,
                    'deleted_at ' => $bookHotel->deleted_at,
                ];
            });
        $columns = ['id', 'booking_id', 'booking_itinerary_id', 'hotel_id', 'breakfast', 'lunch', 'dinner', 'reservation_status', 'reject_message', 'total_room_cost', 'total_meal_cost', 'total', 'is_paid', 'is_debt', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_hotels.csv', $columns, $bookingHotels->toArray());
    }

    function bookingHotelRooms()
    {
        $bookHotelRooms = BookRoomHotel::whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookHotelRooms = $bookHotelRooms->limit(request()->limit);
        }
        $bookHotelRooms = $bookHotelRooms
            ->get()->map(function ($room) {
                return [
                    'id' => $room->id,
                    'booking_id' => $room->booking_id,
                    'booking_itinerary_id' => $room->booking_itinerary_id,
                    'book_hotel_id' => $room->book_hotel_id,
                    'room_type_id' => $room->room_hotel_id,
                    'quantity' => $room->quantity,
                    'price' => $room->subtotal && $room->quantity ? $room->subtotal / $room->quantity : 0,
                    'subtotal' => $room->subtotal ?? 0,
                    'created_at' => $room->created_at,
                    'updated_at' => $room->updated_at,
                    'deleted_at ' => $room->deleted_at,
                ];
            })->toArray();

        $columns = ['id', 'booking_id', 'booking_itinerary_id', 'book_hotel_id', 'room_type_id', 'quantity', 'price', 'subtotal', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_hotel_rooms.csv', $columns, $bookHotelRooms);
    }

    function bookingHotelMeals()
    {
        $bookHotelMeals = BookHotelMeal::whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookHotelMeals = $bookHotelMeals->limit(request()->limit);
        }
        $bookHotelMeals = $bookHotelMeals
            ->get()->map(function ($room) {
                return [
                    'id' => $room->id,
                    'booking_id' => $room->booking_id,
                    'book_hotel_id' => $room->book_hotel_id,
                    'hotel_id' => $room->hotel_id,
                    'meals' => $room->meals,
                    'quantity' => $room->qty,
                    'price' => $room->price,
                    'subtotal' => $room->subtotal,
                    'created_at' => $room->created_at,
                    'updated_at' => $room->updated_at,
                    'deleted_at ' => $room->deleted_at,
                ];
            })->toArray();

        $columns = ['id', 'booking_id', 'book_hotel_id', 'hotel_id', 'meals', 'quantity', 'price', 'subtotal', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_hotel_meals.csv', $columns, $bookHotelMeals);
    }

    function bookingAddons()
    {
        $bookAddons = BookAddOn::whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookAddons = $bookAddons->limit(request()->limit);
        }
        $bookAddons = $bookAddons
            ->get()->map(function ($room) {
                return [
                    'id' => $room->id,
                    'addon_id' => $room->add_on_id,
                    'booking_id' => $room->booking_id,
                    'price' => $room->price,
                    'price_expense' => $room->price_expense == 0 ? $room->price : $room->price_expense,
                    'quantity' => $room->qty,
                    'total' => $room->price * $room->qty,
                    'created_at' => $room->created_at,
                    'updated_at' => $room->updated_at,
                    'deleted_at' => $room->deleted_at,
                ];
            });
        $columns = ['id', 'addon_id', 'booking_id', 'price', 'price_expense', 'quantity', 'total', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('booking_hotel_addons.csv', $columns, $bookAddons);
    }
    function bookingVehcileUnits()
    {
        $bookVehicleUnit = BookCarActivity::with('booking.bookCar')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookVehicleUnit = $bookVehicleUnit->limit(request()->limit);
        }

        $bookVehicleUnit = $bookVehicleUnit->get()->map(function ($bookVehicle) {
            $bookCar = $bookVehicle->booking->bookCar->first();
            return [
                'id' => $bookVehicle->id,
                'booking_id' => $bookVehicle->booking_id,
                'vehicle_unit_id' => $bookVehicle->car_id,
                'quantity' => $bookCar ? $bookVehicle->qty / $bookCar->duration : null,
                'duration_day' => $bookCar->duration ?? null,
                'start_date' => $bookCar->start_date ?? null,
                'end_date' => $bookCar->end_date ?? null,
                'driver' => $bookVehicle->driver_txt,
                'price' => $bookVehicle->price,
                'subtotal' => $bookVehicle->subtotal,
                'note' => $bookVehicle->note_txt,
                'is_debt' => $bookVehicle->is_debt == '1' ? true : false,
                'is_paid' => $bookVehicle->status_paid == 'paid' ? true : false,
                'created_at' => $bookVehicle->created_at,
                'updated_at' => $bookVehicle->updated_at,
                'deleted_at ' => $bookVehicle->deleted_at,
            ];
        });

        $columns = [
            'id',
            'booking_id',
            'vehicle_unit_id',
            'quantity',
            'duration_day',
            'start_date',
            'end_date',
            'driver',
            'price',
            'subtotal',
            'note',
            'is_debt',
            'is_paid',
            'created_at',
            'updated_at',
            'deleted_at ',
        ];
        return ExportCSV::export('booking_vehicle_units.csv', $columns, $bookVehicleUnit);
    }

    function bookingCrewMembers() {
        $bookCrewMembers = BookGuideDriver::with('booking')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookCrewMembers = $bookCrewMembers->limit(request()->limit);
        }
        $bookCrewMembers = $bookCrewMembers->get()->map(function($bookCrewMember){
            return [
                'id' => $bookCrewMember->id,
                'booking_id' => $bookCrewMember->booking_id,
                'crew_member_id' => $bookCrewMember->guide_id,
                'type' => $bookCrewMember->type,
                'duration_day' => $bookCrewMember->duration,
                'start_date' => $bookCrewMember->start_date,
                'end_date' => $bookCrewMember->end_date,
                'trip_type' => $bookCrewMember->guide_ijen == '1' ? 'ijen' : 'escort',
                'created_at' => $bookCrewMember->created_at,
                'updated_at' => $bookCrewMember->updated_at,
                'deleted_at ' => $bookCrewMember->deleted_at,               
            ];
        })->toArray();
        $columns = [
            'id',
            'booking_id',
            'crew_member_id',
            'type',
            'duration_day',
            'start_date',
            'end_date',
            'trip_type',
            'created_at',
            'updated_at',
            'deleted_at ',
        ];
        return ExportCSV::export('booking_crew_members.csv', $columns, $bookCrewMembers);
    }
    function bookingCrewMemberActivities() {
        $bookCrewActivities = BookCrewActivity::with('booking')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookCrewActivities = $bookCrewActivities->limit(request()->limit);
        }
        $bookCrewActivities = $bookCrewActivities->get()->map(function($bookCrewActivity){
            return [
                'id' => $bookCrewActivity->id,
                'booking_id' => $bookCrewActivity->booking_id,
                'crew_role_id' => $bookCrewActivity->crew_role_id,
                'quantity' => $bookCrewActivity->qty,
                'price' => (int)$bookCrewActivity->price,
                'subtotal' => (int)$bookCrewActivity->subtotal,
                'is_paid' => $bookCrewActivity->status_paid == 'paid' ? true : false,
                'is_debt' => $bookCrewActivity->is_debt == '1' ? true : false,
                'created_at' => $bookCrewActivity->created_at,
                'updated_at' => $bookCrewActivity->updated_at,
                'deleted_at ' => $bookCrewActivity->deleted_at,               
            ];
        })->toArray();
        $columns = [
            'id',
            'booking_id',
            'crew_role_id',
            'quantity',
            'price',
            'subtotal',
            'is_paid',
            'is_debt',
            'created_at',
            'updated_at',
            'deleted_at ',
        ];
        return ExportCSV::export('booking_crew_member_activities.csv', $columns, $bookCrewActivities);
    }
    function bookingDestinationActivities()
    {
        $bookDestinationActivities = BookDestinationActivity::with('booking')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookDestinationActivities = $bookDestinationActivities->limit(request()->limit);
        }

        $bookDestinationActivities = $bookDestinationActivities->get()->map(function ($bookDestinationActivity) {
            return [
                'id' => $bookDestinationActivity->id,
                'booking_id' => $bookDestinationActivity->booking_id,
                'destination_id' => $bookDestinationActivity->destination_id,
                'destination_activity_id' => $bookDestinationActivity->destination_activity_id,
                'quantity' => $bookDestinationActivity->qty,
                'price' => (int)$bookDestinationActivity->price,
                'subtotal' => (int)$bookDestinationActivity->subtotal,
                'is_paid' => $bookDestinationActivity->status_paid == 'paid' ? true : false,
                'is_debt' => $bookDestinationActivity->is_debt == '1' ? true : false,
                'created_at' => $bookDestinationActivity->created_at,
                'updated_at' => $bookDestinationActivity->updated_at,
                'deleted_at' => $bookDestinationActivity->deleted_at,
            ];
        });

        $columns = [
            'id',
            'booking_id',
            'destination_id',
            'destination_activity_id',
            'quantity',
            'price',
            'subtotal',
            'is_paid',
            'is_debt',
            'created_at',
            'updated_at',
            'deleted_at',
        ];

        return ExportCSV::export('booking_destination_activities.csv', $columns, $bookDestinationActivities);
    }
    function bookingOtherActivities()
    {
        $bookOtherActivities = BookOthersActivity::with('booking')->whereHas('booking', function ($query) {
            $query->where('status', 'booked')->where('travel_date_start', '>=', $this->firstDate);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $bookOtherActivities = $bookOtherActivities->limit(request()->limit);
        }

        $bookOtherActivities = $bookOtherActivities->get()->map(function ($bookOtherActivity) {
            return [
                'id' => $bookOtherActivity->id,
                'booking_id' => $bookOtherActivity->booking_id,
                'other_activity_id' => $bookOtherActivity->others_activity_id,
                'quantity' => $bookOtherActivity->qty,
                'price' => (int)$bookOtherActivity->price,
                'subtotal' => (int)$bookOtherActivity->subtotal,
                'is_paid' => $bookOtherActivity->status_paid == 'paid' ? true : false,
                'is_debt' => $bookOtherActivity->is_debt == '1' ? true : false,
                'created_at' => $bookOtherActivity->created_at,
                'updated_at' => $bookOtherActivity->updated_at,
                'deleted_at' => $bookOtherActivity->deleted_at,
            ];
        });

        $columns = [
            'id',
            'booking_id',
            'other_activity_id',
            'quantity',
            'price',
            'subtotal',
            'is_paid',
            'is_debt',
            'created_at',
            'updated_at',
            'deleted_at',
        ];

        return ExportCSV::export('booking_other_activities.csv', $columns, $bookOtherActivities);
    }
}
