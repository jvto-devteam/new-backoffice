<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\BookDestinationActivity;
use App\Models\BookOthersActivity;
use App\Models\Booking;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\DestinationActivity;
use App\Models\Hotel;
use App\Models\Itinerary;
use App\Models\ItineraryDetail;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\PackageDestination;
use App\Models\PackageHotel;
use App\Models\PackagePrice;
use App\Models\RoomHotel;
use App\Models\RoomHotelConfiguration;
use Carbon\Carbon;
use Illuminate\Support\Str;

/**
 * Redacted itinerary-core export bundle.
 *
 * Aggregates the operational reference data + booking-derived patterns that
 * `jvto-itinerary-core` needs, in ONE JSON response, without exposing raw customer PII.
 *
 * - Reference sections (packages/hotels/vehicles/crew/activities) mirror the existing
 *   per-dataset CSV exporters so the operational source of truth stays consistent.
 * - Booking-derived sections (logistics / finance / actual cost) are aggregated into
 *   patterns only — no per-customer rows, no names/contacts/documents.
 *
 * This endpoint is read-only and does not modify any existing CSV export.
 */
class ExportDataItineraryCore extends Controller
{
    /** Same curated package scope used by the existing export controllers. */
    protected array $packageIds;
    /** Booking lookback window (12 months), matching ExportDataBookings. */
    protected string $firstDate;

    public function __construct()
    {
        $this->packageIds = [73, 48, 47, 29, 28, 85, 65, 86, 91, 63, 80, 32, 33, 34, 54, 56, 43, 55, 74, 82, 83, 84];
        $this->firstDate = Carbon::now()->subMonths(12)->toDateString();
    }

    public function bundle()
    {
        return response()->json([
            'schema_version' => 'backoffice-itinerary-core/v1',
            'generated_at' => Carbon::now('Asia/Jakarta')->toIso8601String(),
            'pii_policy' => 'redacted_no_raw_customer_contact',
            'source' => 'new-backoffice',

            // Operational reference data (no customer PII).
            'packages' => $this->packages(),
            'package_prices' => $this->packagePrices(),
            'package_itinerary_days' => $this->packageItineraryDays(),
            'package_itinerary_day_details' => $this->packageItineraryDayDetails(),
            'package_destinations' => $this->packageDestinations(),
            'package_hotel_options' => $this->packageHotelOptions(),
            'hotels' => $this->hotels(),
            'room_types' => $this->roomTypes(),
            'room_configurations' => $this->roomConfigurations(),
            'vehicle_types' => $this->vehicleTypes(),
            'crew_roles' => $this->crewRoles(),
            'transport_crew_rules' => $this->transportCrewRules(),
            'destination_activities' => $this->destinationActivities(),
            'other_activities' => $this->otherActivities(),

            // Booking-derived, aggregated patterns only (PII-free).
            'booking_logistics_patterns' => $this->bookingLogisticsPatterns(),
            'booking_finance_patterns' => $this->bookingFinancePatterns(),
            'actual_cost_patterns' => $this->actualCostPatterns(),

            'warnings' => [
                'Booking-derived sections are aggregated patterns; no per-customer rows, names, contacts, or documents are exported.',
                'Cost and finance figures are historical aggregates for calibration only and are not quotes or final prices.',
                'Reference data is limited to the curated itinerary-core package scope.',
            ],
        ]);
    }

    private function packages(): array
    {
        return Package::with(['itinerary.itineraryMeals' => fn ($q) => $q->where('price_plan_id', 2)])
            ->whereIn('id', $this->packageIds)
            ->orderBy('id')
            ->get()
            ->map(function ($p) {
                $breakfast = 0;
                $lunch = 0;
                $dinner = 0;
                foreach ($p->itinerary as $itinerary) {
                    foreach ($itinerary->itineraryMeals as $meal) {
                        $breakfast += (int) $meal->breakfast;
                        $lunch += (int) $meal->lunch;
                        $dinner += (int) $meal->dinner;
                    }
                }

                return [
                    'id' => $p->id,
                    'code' => $p->package_code,
                    'slug' => $p->url,
                    'name' => $p->name,
                    'duration_id' => $p->duration_id,
                    'order_channel_id' => $p->package_platform == 'website' ? 1 : 3,
                    'package_category_id' => $p->category_id,
                    'start_destination_id' => $p->start_destination_id,
                    'end_destination_id' => $p->end_destination_id,
                    'ideal_arrival' => $p->ideal_arrival,
                    'physicality' => $p->physicality,
                    'suitable_for' => $p->suitable_for,
                    'is_publish' => $p->is_publish == '1',
                    'total_breakfast' => $breakfast,
                    'total_lunch' => $lunch,
                    'total_dinner' => $dinner,
                ];
            })
            ->all();
    }

    private function packagePrices(): array
    {
        return PackagePrice::whereHas('package', fn ($q) => $q->whereIn('id', $this->packageIds))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'package_id' => $d->package_id,
                'price_tier_id' => $d->price_category_id,
                'price' => (int) $d->price,
                'klook_retail_price' => (int) $d->klook_retail_price,
                'klook_net_price' => (int) $d->klook_net_price,
            ])
            ->all();
    }

    private function packageItineraryDays(): array
    {
        return Itinerary::with([
            'package.packageHotel' => fn ($q) => $q->where('price_plan_id', 2),
            'itineraryMeals' => fn ($q) => $q->where('price_plan_id', 2),
        ])
            ->whereHas('package', fn ($q) => $q->whereIn('id', $this->packageIds))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'package_id' => $d->package_id,
                'day_no' => $d->day,
                'activity_start_id' => $d->activity_start_id,
                'activity_end_id' => $d->activity_end_id,
                'title' => $d->title,
                'activity' => $d->activity,
                'hotel_id' => optional($d->package->packageHotel->where('day', $d->day)->first())->hotel_id,
                'meal_breakfast' => optional($d->itineraryMeals[0] ?? null)->breakfast == '1',
                'meal_lunch' => optional($d->itineraryMeals[0] ?? null)->lunch == '1',
                'meal_dinner' => optional($d->itineraryMeals[0] ?? null)->dinner == '1',
            ])
            ->all();
    }

    private function packageItineraryDayDetails(): array
    {
        return ItineraryDetail::whereHas('itinerary.package', fn ($q) => $q->whereIn('id', $this->packageIds))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'itinerary_day_id' => $d->itinerary_id,
                'sort_order' => $d->no,
                'time' => $d->time,
                'activity_id' => $d->activity_id,
                'notes' => $d->notes,
            ])
            ->all();
    }

    private function packageDestinations(): array
    {
        return PackageDestination::whereHas('package', fn ($q) => $q->whereIn('id', $this->packageIds))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'package_id' => $d->package_id,
                'destination_id' => $d->destination_id,
            ])
            ->all();
    }

    private function packageHotelOptions(): array
    {
        return PackageHotel::whereHas('package', fn ($q) => $q->whereIn('id', $this->packageIds))
            ->where('price_plan_id', 2)
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'package_id' => $d->package_id,
                'day_no' => $d->day,
                'hotel_id' => $d->hotel_id,
            ])
            ->all();
    }

    private function hotels(): array
    {
        return Hotel::where('is_publish', '1')
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'destination_id' => $d->destination_id,
                'address' => $d->address,
                'map_url' => $d->map_url,
                'lunch_rate' => (int) $d->lunch_rate,
                'dinner_rate' => (int) $d->dinner_rate,
            ])
            ->all();
    }

    private function roomTypes(): array
    {
        return RoomHotel::whereHas('hotel', fn ($q) => $q->where('is_publish', '1'))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'hotel_id' => $d->hotel_id,
                'room_name' => $d->room_name,
                'bed_type' => $d->room_type,
                'rate_idr' => (int) $d->rate,
                'rate_twt_idr' => (int) $d->rate_twt,
            ])
            ->all();
    }

    private function roomConfigurations(): array
    {
        return RoomHotelConfiguration::whereHas('hotel', fn ($q) => $q->where('is_publish', '1'))
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'hotel_id' => $d->hotel_id,
                'room_type_id' => $d->room_id,
                'pax' => $d->pax,
                'quantity' => $d->qty,
            ])
            ->all();
    }

    private function vehicleTypes(): array
    {
        return Car::whereIn('id', [1, 2, 5, 14, 24, 25])
            ->orderBy('id')
            ->get()
            ->values()
            ->map(fn ($d, $index) => [
                'id' => $index + 1,
                'name' => $d->car_name,
                'capacity_min_pax' => $d->start_pax,
                'capacity_max_pax' => $d->end_pax,
                'price_per_day' => (int) $d->price,
                'price_twt_per_day' => (int) $d->price_twt,
            ])
            ->all();
    }

    private function crewRoles(): array
    {
        return CrewRole::orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->role,
                'rate_per_day' => (int) $d->rate,
                'rate_twt_per_day' => (int) $d->rate_twt,
                'order_channel_id' => $d->order_channel_id,
            ])
            ->all();
    }

    private function transportCrewRules(): array
    {
        $vehicleTypes = [
            'MPV' => 1,
            'Innova' => 2,
            'Hiace' => 3,
            'Hiace Premio' => 4,
            'Medium Bus' => 5,
            'Mini Bus (Elf)' => 6,
        ];

        $rules = CarConfiguration::orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'pax' => $d->pax,
                'vehicle_type_id' => $vehicleTypes[$d->car->car_name] ?? optional($d->car)->car_name,
                'crew_role_id' => $d->crew_jvto_role_id ?? $d->crew_klook_role_id,
                'order_channel_id' => $d->crew_jvto_role_id ? 1 : 3,
            ])
            ->all();

        $id = 24;
        for ($i = 1; $i <= 10; $i++) {
            $id++;
            if ($i <= 2) {
                $vehicleTypeId = $vehicleTypes['MPV'];
                $crewRoleId = 1;
            } elseif ($i == 3) {
                $vehicleTypeId = $vehicleTypes['Innova'];
                $crewRoleId = 1;
            } elseif ($i >= 4 && $i <= 7) {
                $vehicleTypeId = $vehicleTypes['Hiace'];
                $crewRoleId = 2;
            } elseif ($i >= 8 && $i <= 9) {
                $vehicleTypeId = $vehicleTypes['Hiace Premio'];
                $crewRoleId = 2;
            } else {
                $vehicleTypeId = $vehicleTypes['MPV'];
                $crewRoleId = 4;
            }
            $rules[] = [
                'id' => $id,
                'pax' => $i,
                'vehicle_type_id' => $vehicleTypeId,
                'crew_role_id' => $crewRoleId,
                'order_channel_id' => 2,
            ];
        }

        return $rules;
    }

    private function destinationActivities(): array
    {
        return DestinationActivity::orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'code' => $d->destination_activity_code,
                'destination_id' => $d->destination_id,
                'vendor_id' => $d->vendor_id,
                'name' => $d->name,
                'unit' => $d->unit,
                'formula' => $d->formula,
                'price' => (int) $d->price,
                'is_default_jvto' => $d->is_default_jvto == '1',
                'is_default_klook' => $d->is_default_klook == '1',
                'is_default_twt' => $d->is_default_twt == '1',
            ])
            ->all();
    }

    private function otherActivities(): array
    {
        return OthersActivity::orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'code' => $d->other_activity_code,
                'vendor_id' => $d->vendor_id,
                'name' => $d->name,
                'unit' => $d->unit,
                'formula' => $d->formula,
                'price' => (int) $d->price,
                'is_default_jvto' => $d->is_default == '1',
            ])
            ->all();
    }

    private function baseBookingQuery()
    {
        return Booking::where('status', 'booked')
            ->where('travel_date_start', '>=', $this->firstDate)
            ->whereHas('bookingDetail', fn ($q) => $q->whereNull('package_id')->orWhereIn('package_id', $this->packageIds));
    }

    private function bookingLogisticsPatterns(): array
    {
        $bookings = $this->baseBookingQuery()->with('bookingDetail')->get();

        $groups = [];
        foreach ($bookings as $b) {
            $pickup = $this->locationGroup($b->meeting_point);
            $dropoff = $this->locationGroup($b->drop_point);
            $bucket = $this->timeBucket($b->pickup_time);

            $destinations = [];
            if (! empty($b->at_bromo)) {
                $destinations[] = 'Bromo';
            }
            if (! empty($b->at_bondowoso)) {
                $destinations[] = 'Ijen';
            }

            $key = $pickup.'|'.$dropoff.'|'.$bucket;
            if (! isset($groups[$key])) {
                $groups[$key] = [
                    'pattern_id' => Str::slug($pickup.' to '.$dropoff.' '.$bucket, '_'),
                    'pickup_location_group' => $pickup,
                    'dropoff_location_group' => $dropoff,
                    'typical_pickup_time_bucket' => $bucket,
                    'destinations' => [],
                    'package_ids' => [],
                    'sample_count' => 0,
                ];
            }
            $groups[$key]['sample_count']++;
            $groups[$key]['destinations'] = array_values(array_unique(array_merge($groups[$key]['destinations'], $destinations)));
            $packageId = optional($b->bookingDetail->first())->package_id;
            if ($packageId) {
                $groups[$key]['package_ids'] = array_values(array_unique(array_merge($groups[$key]['package_ids'], [$packageId])));
            }
        }

        $patterns = array_values($groups);
        foreach ($patterns as &$pattern) {
            $pattern['risk_notes'] = $this->logisticsRiskNotes($pattern['typical_pickup_time_bucket'], $pattern['destinations']);
        }
        unset($pattern);

        usort($patterns, fn ($a, $b) => $b['sample_count'] <=> $a['sample_count'] ?: strcmp($a['pattern_id'], $b['pattern_id']));

        return $patterns;
    }

    private function bookingFinancePatterns(): array
    {
        $bookings = $this->baseBookingQuery()->with(['bookingDetail', 'bookingPayment'])->get();

        $groups = [];
        foreach ($bookings as $b) {
            $packageId = optional($b->bookingDetail->first())->package_id ?? 0;
            if (! isset($groups[$packageId])) {
                $groups[$packageId] = [
                    'package_id' => $packageId ?: null,
                    'sample_count' => 0,
                    'sum_total_expense' => 0,
                    'sum_total_expense_crew' => 0,
                    'sum_profit' => 0,
                ];
            }
            $groups[$packageId]['sample_count']++;
            $groups[$packageId]['sum_total_expense'] += (int) $b->expense_internal_total;
            $groups[$packageId]['sum_total_expense_crew'] += (int) $b->total_expense_crew;
            $groups[$packageId]['sum_profit'] += $this->bookingProfit($b);
        }

        $patterns = [];
        foreach ($groups as $g) {
            $count = max(1, $g['sample_count']);
            $patterns[] = [
                'package_id' => $g['package_id'],
                'sample_count' => $g['sample_count'],
                'avg_total_expense' => intdiv($g['sum_total_expense'], $count),
                'avg_total_expense_crew' => intdiv($g['sum_total_expense_crew'], $count),
                'avg_profit' => intdiv((int) $g['sum_profit'], $count),
            ];
        }

        usort($patterns, fn ($a, $b) => $b['sample_count'] <=> $a['sample_count'] ?: ($a['package_id'] <=> $b['package_id']));

        return $patterns;
    }

    private function actualCostPatterns(): array
    {
        return [
            'destination_activities' => $this->aggregateActivityCosts(
                BookDestinationActivity::whereHas('booking', fn ($q) => $this->scopeBooking($q))->get(),
                'destination_activity_id'
            ),
            'other_activities' => $this->aggregateActivityCosts(
                BookOthersActivity::whereHas('booking', fn ($q) => $this->scopeBooking($q))->get(),
                'others_activity_id'
            ),
        ];
    }

    private function scopeBooking($q): void
    {
        $q->where('status', 'booked')
            ->where('travel_date_start', '>=', $this->firstDate)
            ->whereHas('bookingDetail', fn ($d) => $d->whereNull('package_id')->orWhereIn('package_id', $this->packageIds));
    }

    private function aggregateActivityCosts($rows, string $activityKey): array
    {
        $groups = [];
        foreach ($rows as $row) {
            $activityId = $row->{$activityKey};
            if (! isset($groups[$activityId])) {
                $groups[$activityId] = [
                    'activity_id' => $activityId,
                    'sample_count' => 0,
                    'sum_qty' => 0,
                    'sum_price' => 0,
                    'sum_subtotal' => 0,
                ];
            }
            $groups[$activityId]['sample_count']++;
            $groups[$activityId]['sum_qty'] += (int) $row->qty;
            $groups[$activityId]['sum_price'] += (int) $row->price;
            $groups[$activityId]['sum_subtotal'] += (int) $row->subtotal;
        }

        $patterns = [];
        foreach ($groups as $g) {
            $count = max(1, $g['sample_count']);
            $patterns[] = [
                'activity_id' => $g['activity_id'],
                'sample_count' => $g['sample_count'],
                'avg_qty' => round($g['sum_qty'] / $count, 2),
                'avg_price' => intdiv($g['sum_price'], $count),
                'avg_subtotal' => intdiv($g['sum_subtotal'], $count),
            ];
        }

        usort($patterns, fn ($a, $b) => $b['sample_count'] <=> $a['sample_count'] ?: ($a['activity_id'] <=> $b['activity_id']));

        return $patterns;
    }

    private function bookingProfit(Booking $booking): int
    {
        if ($booking->balance == 0) {
            // hasMany has no default ordering; sort explicitly so the final
            // settlement payment (highest id) is the one excluded from the DP sum.
            $lastPayment = $booking->bookingPayment->sortByDesc('id')->first();
            $count = $booking->bookingPayment->count();
            if ($count == 1) {
                $dp = $booking->bookingPayment->sum('nominal');
            } else {
                $dp = $booking->bookingPayment
                    ->when($lastPayment, fn ($q) => $q->where('id', '!=', $lastPayment->id))
                    ->sum('nominal');
            }
        } else {
            $dp = $booking->balance;
        }

        return (int) ($dp - $booking->expense_internal_total);
    }

    private function locationGroup(?string $raw): string
    {
        $v = strtolower(trim((string) $raw));
        if ($v === '') {
            return 'unknown';
        }
        if (str_contains($v, 'airport') || str_contains($v, 'juanda') || str_contains($v, 'bandara')) {
            return str_contains($v, 'surabaya') || str_contains($v, 'juanda') ? 'Surabaya Airport' : 'Airport';
        }
        if (str_contains($v, 'station') || str_contains($v, 'stasiun')) {
            return 'Train Station';
        }
        if (str_contains($v, 'ketapang')) {
            return 'Ketapang Harbor';
        }
        if (str_contains($v, 'gilimanuk')) {
            return 'Gilimanuk Harbor';
        }
        if (str_contains($v, 'bali') || str_contains($v, 'denpasar') || str_contains($v, 'ubud') || str_contains($v, 'seminyak') || str_contains($v, 'canggu') || str_contains($v, 'lovina') || str_contains($v, 'pemuteran')) {
            return 'Bali';
        }
        if (str_contains($v, 'malang')) {
            return 'Malang';
        }
        if (str_contains($v, 'bondowoso')) {
            return 'Bondowoso / Ijen Area';
        }
        if (str_contains($v, 'banyuwangi')) {
            return 'Banyuwangi / Ijen Area';
        }
        if (str_contains($v, 'surabaya')) {
            return 'Surabaya';
        }
        if (str_contains($v, 'hotel')) {
            return 'Hotel';
        }
        if ($v === 'others' || $v === 'other') {
            return 'Other';
        }

        return 'Other';
    }

    private function timeBucket(?string $raw): string
    {
        if (! $raw || ! preg_match('/(\d{1,2}):(\d{2})/', $raw, $m)) {
            return 'unknown';
        }
        $hour = (int) $m[1];
        if ($hour < 5) {
            return 'overnight';
        }
        if ($hour < 11) {
            return 'morning';
        }
        if ($hour < 15) {
            return 'midday';
        }
        if ($hour < 18) {
            return 'afternoon';
        }

        return 'evening_night';
    }

    private function logisticsRiskNotes(string $bucket, array $destinations): array
    {
        $notes = [];
        if (in_array($bucket, ['afternoon', 'evening_night', 'overnight'], true)) {
            $notes[] = 'late arrival';
            if (in_array('Bromo', $destinations, true) || in_array('Ijen', $destinations, true)) {
                $notes[] = 'limited rest before sunrise or Ijen';
            }
        }

        return $notes;
    }
}
