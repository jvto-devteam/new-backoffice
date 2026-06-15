<?php

namespace App\Services\ExportData;

/**
 * DB-free, pure validation of a cost-reference-rates payload (the array produced by
 * CostReferenceRatesPayloadBuilder). Enforces the source-contract boundary:
 * no PII keys, stable ids on every record, deterministic ordering. Returns a list of
 * human-readable issue strings; empty means the payload passes.
 */
class CostReferenceRatesValidator
{
    /**
     * Key fragments that must never appear on any exported record. "name" is deliberately
     * absent — it is an allowed master label (vehicle/crew/hotel/room/activity name).
     */
    public const FORBIDDEN_KEY_FRAGMENTS = [
        'customer', 'guest', 'name_customer', 'email', 'phone', 'whatsapp', 'wa',
        'passport', 'invoice', 'document', 'media', 'attachment', 'payment',
        'booking_code', 'booking_id', 'note', 'remarks', 'profit', 'quotation', 'quote',
    ];

    /**
     * Exact keys exempt from the fragment scan: contract-required fields that legitimately
     * contain a forbidden fragment. `customer_price` is a price label (the rate shown to the
     * customer), not customer-identifying PII — broad `customer*` keys like customer_name /
     * customer_email / customer_id are still rejected.
     */
    public const ALLOWED_KEYS = [
        'customer_price',
    ];

    /** section key => the id field every record in that section must carry (non-null). */
    public const SECTION_ID_FIELDS = [
        'vehicle_rates' => 'vehicle_type_id',
        'crew_rates' => 'crew_role_id',
        'transport_crew_rules' => 'rule_id',
        'hotel_rates' => 'hotel_id',
        'room_rates' => 'room_type_id',
        'room_configurations' => 'configuration_id',
        'destination_activity_rates' => 'destination_activity_id',
        'other_activity_rates' => 'other_activity_id',
        'addon_expense_rates' => 'addon_id',
    ];

    /**
     * @return array<int, string> Issues found; empty array means valid.
     */
    public function validate(array $payload): array
    {
        $issues = [];

        foreach (self::SECTION_ID_FIELDS as $section => $idField) {
            if (! array_key_exists($section, $payload)) {
                $issues[] = "Missing section: {$section}.";
                continue;
            }
            if (! is_array($payload[$section])) {
                $issues[] = "Section {$section} must be an array.";
                continue;
            }

            $issues = array_merge(
                $issues,
                $this->checkForbiddenKeys($section, $payload[$section]),
                $this->checkStableIds($section, $idField, $payload[$section]),
                $this->checkOrdering($section, $idField, $payload[$section]),
            );
        }

        return $issues;
    }

    private function checkForbiddenKeys(string $section, array $rows): array
    {
        $issues = [];
        foreach ($rows as $index => $row) {
            if (! is_array($row)) {
                continue;
            }
            foreach (array_keys($row) as $key) {
                if (in_array($key, self::ALLOWED_KEYS, true)) {
                    continue;
                }
                $lower = strtolower((string) $key);
                foreach (self::FORBIDDEN_KEY_FRAGMENTS as $fragment) {
                    if (str_contains($lower, $fragment)) {
                        $issues[] = "PII/forbidden key '{$key}' found in {$section}[{$index}] (matched '{$fragment}').";
                    }
                }
            }
        }

        return $issues;
    }

    private function checkStableIds(string $section, string $idField, array $rows): array
    {
        $issues = [];
        foreach ($rows as $index => $row) {
            if (! is_array($row) || ! array_key_exists($idField, $row) || $row[$idField] === null) {
                $issues[] = "Missing stable id '{$idField}' in {$section}[{$index}].";
            }
        }

        return $issues;
    }

    private function checkOrdering(string $section, string $idField, array $rows): array
    {
        $previous = null;
        foreach ($rows as $index => $row) {
            if (! is_array($row) || ! array_key_exists($idField, $row) || $row[$idField] === null) {
                continue; // missing-id already reported by checkStableIds
            }
            $current = $row[$idField];
            if ($previous !== null && $current < $previous) {
                return ["Non-deterministic ordering in {$section}: {$idField} {$current} at index {$index} follows {$previous}."];
            }
            $previous = $current;
        }

        return [];
    }
}
