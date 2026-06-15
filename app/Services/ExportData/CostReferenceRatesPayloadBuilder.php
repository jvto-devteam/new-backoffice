<?php

namespace App\Services\ExportData;

use App\Models\AddOn;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\DestinationActivity;
use App\Models\Hotel;
use App\Models\OthersActivity;
use App\Models\RoomHotel;
use App\Models\RoomHotelConfiguration;
use Carbon\Carbon;

/**
 * Builds the PII-free cost-reference-rates source contract consumed downstream by
 * jvto-itinerary-core.
 *
 * Read-only. Master/reference tables only — no booking, customer, payment, invoice,
 * document, or media rows. Deterministic ordering by id; null for missing optional
 * fields; source ids preserved for traceability. Values are never invented.
 *
 * Vehicle/transport-crew logic mirrors ExportDataItineraryCore so the logical
 * vehicle_type_id (1..6) joins consistently across both contracts.
 */
class CostReferenceRatesPayloadBuilder
{
    public const SCHEMA_VERSION = 'backoffice-cost-reference-rates/v1';

    /**
     * car_name => logical vehicle_type_id. Same map ExportDataItineraryCore uses for
     * transport_crew_rules, so the two contracts agree on vehicle_type_id.
     */
    private const VEHICLE_TYPE_MAP = [
        'MPV' => 1,
        'Innova' => 2,
        'Hiace' => 3,
        'Hiace Premio' => 4,
        'Medium Bus' => 5,
        'Mini Bus (Elf)' => 6,
    ];

    /** Curated vehicle scope, same as ExportDataItineraryCore::vehicleTypes(). */
    private const VEHICLE_CAR_IDS = [1, 2, 5, 14, 24, 25];

    /** Latest source updated_at seen while building — used as the deterministic watermark. */
    private ?Carbon $watermark = null;

    /** Collected non-fatal data-quality warnings. */
    private array $warnings = [];

    public function build(): array
    {
        // Reset accumulators so repeated build() calls on the same instance are identical.
        $this->watermark = null;
        $this->warnings = [];

        $vehicleRates = $this->vehicleRates();
        $crewRates = $this->crewRates();
        $transportCrewRules = $this->transportCrewRules();
        $hotelRates = $this->hotelRates();
        $roomRates = $this->roomRates();
        $roomConfigurations = $this->roomConfigurations();
        $destinationActivityRates = $this->destinationActivityRates();
        $otherActivityRates = $this->otherActivityRates();
        $addonExpenseRates = $this->addonExpenseRates();

        $sections = [
            'vehicle_rates' => $vehicleRates,
            'crew_rates' => $crewRates,
            'transport_crew_rules' => $transportCrewRules,
            'hotel_rates' => $hotelRates,
            'room_rates' => $roomRates,
            'room_configurations' => $roomConfigurations,
            'destination_activity_rates' => $destinationActivityRates,
            'other_activity_rates' => $otherActivityRates,
            'addon_expense_rates' => $addonExpenseRates,
        ];

        return array_merge(
            [
                'schema_version' => self::SCHEMA_VERSION,
                'generated_at' => $this->generatedAt(),
                'source' => 'new-backoffice',
                'pii_policy' => 'no_customer_no_booking_no_invoice_no_documents',
            ],
            $sections,
            ['quality_report' => $this->qualityReport($sections)],
        );
    }

    private function vehicleRates(): array
    {
        return Car::whereIn('id', self::VEHICLE_CAR_IDS)
            ->orderBy('id')
            ->get()
            ->values()
            ->map(function (Car $car, int $index) {
                $this->trackWatermark($car->updated_at);

                return [
                    'vehicle_type_id' => $index + 1, // logical 1..6, join-consistent with itinerary-core
                    'source_model' => 'Car',
                    'source_id' => $car->id,
                    'name' => $car->car_name,
                    'capacity_min_pax' => $this->intOrNull($car->start_pax),
                    'capacity_max_pax' => $this->intOrNull($car->end_pax),
                    'price_per_day' => (int) $car->price,
                    'price_twt_per_day' => (int) $car->price_twt,
                ];
            })
            ->all();
    }

    private function crewRates(): array
    {
        return CrewRole::orderBy('id')
            ->get()
            ->map(function (CrewRole $role) {
                $this->trackWatermark($role->updated_at);

                return [
                    'crew_role_id' => $role->id,
                    'source_model' => 'CrewRole',
                    'source_id' => $role->id,
                    'name' => $role->role,
                    'rate_per_day' => (int) $role->rate,
                    'rate_twt_per_day' => (int) $role->rate_twt,
                    'order_channel_id' => $role->order_channel_id,
                ];
            })
            ->all();
    }

    private function transportCrewRules(): array
    {
        $rules = CarConfiguration::with('car')
            ->orderBy('id')
            ->get()
            ->map(function (CarConfiguration $config) {
                $this->trackWatermark($config->updated_at);

                $carName = optional($config->car)->car_name;
                $vehicleTypeId = self::VEHICLE_TYPE_MAP[$carName] ?? null;
                if ($vehicleTypeId === null) {
                    $this->warnings[] = "transport_crew_rules: car_name '{$carName}' (config #{$config->id}) is not in the logical vehicle-type map; vehicle_type_id set to null.";
                }

                return [
                    'rule_id' => $config->id,
                    'source_model' => 'CarConfiguration',
                    'source_id' => $config->id,
                    'pax' => $config->pax,
                    'vehicle_type_id' => $vehicleTypeId,
                    'crew_role_id' => $config->crew_jvto_role_id ?? $config->crew_klook_role_id,
                    'order_channel_id' => $config->crew_jvto_role_id ? 1 : 3,
                ];
            })
            ->all();

        // Established synthetic TWT rules (pax 1..10), mirroring ExportDataItineraryCore.
        // These are derived, not sourced from a table → source_model/source_id are null.
        $synthetic = 0;
        $id = 24;
        for ($i = 1; $i <= 10; $i++) {
            $id++;
            if ($i <= 2) {
                $vehicleTypeId = self::VEHICLE_TYPE_MAP['MPV'];
                $crewRoleId = 1;
            } elseif ($i == 3) {
                $vehicleTypeId = self::VEHICLE_TYPE_MAP['Innova'];
                $crewRoleId = 1;
            } elseif ($i >= 4 && $i <= 7) {
                $vehicleTypeId = self::VEHICLE_TYPE_MAP['Hiace'];
                $crewRoleId = 2;
            } elseif ($i >= 8 && $i <= 9) {
                $vehicleTypeId = self::VEHICLE_TYPE_MAP['Hiace Premio'];
                $crewRoleId = 2;
            } else {
                $vehicleTypeId = self::VEHICLE_TYPE_MAP['MPV'];
                $crewRoleId = 4;
            }
            $rules[] = [
                'rule_id' => $id,
                'source_model' => null,
                'source_id' => null,
                'pax' => $i,
                'vehicle_type_id' => $vehicleTypeId,
                'crew_role_id' => $crewRoleId,
                'order_channel_id' => 2,
            ];
            $synthetic++;
        }

        $this->warnings[] = "transport_crew_rules: {$synthetic} synthetic TWT rules (rule_id 25..34) included for join-consistency with the itinerary-core contract; they carry no source row.";

        return $rules;
    }

    private function hotelRates(): array
    {
        return Hotel::where('is_publish', '1')
            ->orderBy('id')
            ->get()
            ->map(function (Hotel $hotel) {
                $this->trackWatermark($hotel->updated_at);

                return [
                    'hotel_id' => $hotel->id,
                    'source_model' => 'Hotel',
                    'source_id' => $hotel->id,
                    'name' => $hotel->name,
                    'destination_id' => $hotel->destination_id,
                    'lunch_rate' => (int) $hotel->lunch_rate,
                    'dinner_rate' => (int) $hotel->dinner_rate,
                ];
            })
            ->all();
    }

    private function roomRates(): array
    {
        return RoomHotel::whereHas('hotel', fn ($q) => $q->where('is_publish', '1'))
            ->orderBy('id')
            ->get()
            ->map(function (RoomHotel $room) {
                $this->trackWatermark($room->updated_at);

                return [
                    'room_type_id' => $room->id,
                    'source_model' => 'RoomHotel',
                    'source_id' => $room->id,
                    'hotel_id' => $room->hotel_id,
                    'room_name' => $room->room_name,
                    'bed_type' => $room->room_type,
                    'rate_idr' => (int) $room->rate,
                    'rate_twt_idr' => (int) $room->rate_twt,
                ];
            })
            ->all();
    }

    private function roomConfigurations(): array
    {
        return RoomHotelConfiguration::whereHas('hotel', fn ($q) => $q->where('is_publish', '1'))
            ->orderBy('id')
            ->get()
            ->map(function (RoomHotelConfiguration $config) {
                $this->trackWatermark($config->updated_at);

                return [
                    'configuration_id' => $config->id,
                    'source_model' => 'RoomHotelConfiguration',
                    'source_id' => $config->id,
                    'hotel_id' => $config->hotel_id,
                    'room_type_id' => $config->room_id,
                    'pax' => $config->pax,
                    'quantity' => $config->qty,
                ];
            })
            ->all();
    }

    private function destinationActivityRates(): array
    {
        return DestinationActivity::orderBy('id')
            ->get()
            ->map(function (DestinationActivity $activity) {
                $this->trackWatermark($activity->updated_at);

                return [
                    'destination_activity_id' => $activity->id,
                    'source_model' => 'DestinationActivity',
                    'source_id' => $activity->id,
                    'code' => $activity->destination_activity_code,
                    'destination_id' => $activity->destination_id,
                    'vendor_id' => $activity->vendor_id,
                    'name' => $activity->name,
                    'unit' => $activity->unit,
                    'formula' => $activity->formula,
                    'price' => (int) $activity->price,
                    'is_default_jvto' => $activity->is_default_jvto == '1',
                    'is_default_klook' => $activity->is_default_klook == '1',
                    'is_default_twt' => $activity->is_default_twt == '1',
                ];
            })
            ->all();
    }

    private function otherActivityRates(): array
    {
        return OthersActivity::orderBy('id')
            ->get()
            ->map(function (OthersActivity $activity) {
                $this->trackWatermark($activity->updated_at);

                return [
                    'other_activity_id' => $activity->id,
                    'source_model' => 'OthersActivity',
                    'source_id' => $activity->id,
                    'code' => $activity->other_activity_code,
                    'vendor_id' => $activity->vendor_id,
                    'name' => $activity->name,
                    'unit' => $activity->unit,
                    'formula' => $activity->formula,
                    'price' => (int) $activity->price,
                    'is_default_jvto' => $activity->is_default == '1',
                ];
            })
            ->all();
    }

    private function addonExpenseRates(): array
    {
        // The master add_ons table has no internal-expense or default-quantity column.
        // Per "do not invent values" both are null. transport_price is a customer-side
        // surcharge, not an internal expense, so it is intentionally not mapped here.
        return AddOn::orderBy('id')
            ->get()
            ->map(function (AddOn $addon) {
                $this->trackWatermark($addon->updated_at);

                return [
                    'addon_id' => $addon->id,
                    'source_model' => 'AddOn',
                    'source_id' => $addon->id,
                    'label' => $addon->add_on,
                    'customer_price' => (int) $addon->price,
                    'expense_price' => null,
                    'default_quantity' => null,
                ];
            })
            ->all();
    }

    /**
     * Deterministic generated_at: the latest source updated_at across all queried tables.
     * Reruns are byte-identical while source data is unchanged. Fixed epoch fallback when
     * no rows carry a timestamp (e.g. empty dataset).
     */
    private function generatedAt(): string
    {
        if ($this->watermark === null) {
            return Carbon::createFromTimestamp(0, 'Asia/Jakarta')->toIso8601String();
        }

        return $this->watermark->copy()->setTimezone('Asia/Jakarta')->toIso8601String();
    }

    private function trackWatermark($timestamp): void
    {
        if ($timestamp === null) {
            return;
        }
        $candidate = $timestamp instanceof Carbon ? $timestamp : Carbon::parse($timestamp);
        if ($this->watermark === null || $candidate->gt($this->watermark)) {
            $this->watermark = $candidate;
        }
    }

    private function intOrNull($value): ?int
    {
        return $value === null || $value === '' ? null : (int) $value;
    }

    /**
     * @param array<string, array<int, array<string, mixed>>> $sections
     */
    private function qualityReport(array $sections): array
    {
        // Primary price field per section; null/<=0 counts as a missing price.
        $priceFields = [
            'vehicle_rates' => 'price_per_day',
            'crew_rates' => 'rate_per_day',
            'room_rates' => 'rate_idr',
            'destination_activity_rates' => 'price',
            'other_activity_rates' => 'price',
            'addon_expense_rates' => 'customer_price',
        ];
        // Label field per section; null/empty counts as a missing label.
        $labelFields = [
            'vehicle_rates' => 'name',
            'crew_rates' => 'name',
            'hotel_rates' => 'name',
            'room_rates' => 'room_name',
            'destination_activity_rates' => 'name',
            'other_activity_rates' => 'name',
            'addon_expense_rates' => 'label',
        ];

        $missingPrice = 0;
        foreach ($priceFields as $section => $field) {
            foreach ($sections[$section] as $row) {
                if (! isset($row[$field]) || $row[$field] === null || $row[$field] <= 0) {
                    $missingPrice++;
                }
            }
        }

        $missingLabel = 0;
        foreach ($labelFields as $section => $field) {
            foreach ($sections[$section] as $row) {
                if (! isset($row[$field]) || trim((string) $row[$field]) === '') {
                    $missingLabel++;
                }
            }
        }

        $warnings = $this->warnings;
        $warnings[] = 'addon_expense_rates: expense_price and default_quantity are null; the master add_ons table has no internal-expense or default-quantity field.';
        $warnings[] = 'hotel_rates meal rates (lunch_rate/dinner_rate) are excluded from missing_price_count as zero is a valid value.';

        return [
            'missing_price_count' => $missingPrice,
            'missing_label_count' => $missingLabel,
            'warnings' => $warnings,
        ];
    }
}
