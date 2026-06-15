<?php

namespace Tests\Unit;

use App\Services\ExportData\CostReferenceRatesValidator;
use PHPUnit\Framework\TestCase;

class CostReferenceRatesValidatorTest extends TestCase
{
    private CostReferenceRatesValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new CostReferenceRatesValidator();
    }

    /** A clean, ordered, PII-free payload passes with no issues. */
    public function test_clean_payload_passes(): void
    {
        $issues = $this->validator->validate($this->cleanPayload());

        $this->assertSame([], $issues);
    }

    public function test_detects_forbidden_pii_key(): void
    {
        $payload = $this->cleanPayload();
        $payload['hotel_rates'][0]['customer_email'] = 'leak@example.com';

        $issues = $this->validator->validate($payload);

        $this->assertNotEmpty($issues);
        $this->assertTrue($this->anyContains($issues, 'customer_email'));
    }

    public function test_allows_name_label_key(): void
    {
        // "name" must NOT be treated as PII — it is a master label.
        $issues = $this->validator->validate($this->cleanPayload());

        $this->assertFalse($this->anyContains($issues, "key 'name'"));
    }

    public function test_detects_missing_stable_id(): void
    {
        $payload = $this->cleanPayload();
        $payload['crew_rates'][0]['crew_role_id'] = null;

        $issues = $this->validator->validate($payload);

        $this->assertTrue($this->anyContains($issues, "Missing stable id 'crew_role_id'"));
    }

    public function test_detects_non_deterministic_ordering(): void
    {
        $payload = $this->cleanPayload();
        $payload['vehicle_rates'] = [
            ['vehicle_type_id' => 2, 'name' => 'B'],
            ['vehicle_type_id' => 1, 'name' => 'A'],
        ];

        $issues = $this->validator->validate($payload);

        $this->assertTrue($this->anyContains($issues, 'Non-deterministic ordering in vehicle_rates'));
    }

    public function test_detects_missing_section(): void
    {
        $payload = $this->cleanPayload();
        unset($payload['addon_expense_rates']);

        $issues = $this->validator->validate($payload);

        $this->assertTrue($this->anyContains($issues, 'Missing section: addon_expense_rates'));
    }

    private function anyContains(array $issues, string $needle): bool
    {
        foreach ($issues as $issue) {
            if (str_contains($issue, $needle)) {
                return true;
            }
        }

        return false;
    }

    /** Minimal valid payload: one ordered, id-bearing, PII-free row per section. */
    private function cleanPayload(): array
    {
        return [
            'schema_version' => 'backoffice-cost-reference-rates/v1',
            'vehicle_rates' => [['vehicle_type_id' => 1, 'name' => 'MPV', 'price_per_day' => 100]],
            'crew_rates' => [['crew_role_id' => 1, 'name' => 'Guide', 'rate_per_day' => 50]],
            'transport_crew_rules' => [['rule_id' => 1, 'pax' => 2, 'vehicle_type_id' => 1, 'crew_role_id' => 1]],
            'hotel_rates' => [['hotel_id' => 1, 'name' => 'Hotel A', 'destination_id' => 1]],
            'room_rates' => [['room_type_id' => 1, 'hotel_id' => 1, 'room_name' => 'Deluxe']],
            'room_configurations' => [['configuration_id' => 1, 'hotel_id' => 1, 'room_type_id' => 1, 'pax' => 2]],
            'destination_activity_rates' => [['destination_activity_id' => 1, 'code' => 'DA1', 'name' => 'Hike']],
            'other_activity_rates' => [['other_activity_id' => 1, 'code' => 'OA1', 'name' => 'Boat']],
            'addon_expense_rates' => [['addon_id' => 1, 'label' => 'Towel', 'customer_price' => 10]],
        ];
    }
}
