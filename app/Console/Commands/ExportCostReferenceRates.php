<?php

namespace App\Console\Commands;

use App\Services\ExportData\CostReferenceRatesPayloadBuilder;
use App\Services\ExportData\CostReferenceRatesValidator;
use Illuminate\Console\Command;

/**
 * Generates the PII-free cost-reference-rates.json source contract for jvto-itinerary-core.
 *
 * Read-only export of master/reference rate tables. Validates the payload (no PII keys,
 * stable ids, deterministic ordering) and confirms byte-identical determinism before
 * writing the artifact. The output file is generated locally and is git-ignored —
 * it holds commercially sensitive reference cost data.
 */
class ExportCostReferenceRates extends Command
{
    protected $signature = 'export:cost-reference-rates';

    protected $description = 'Export the PII-free cost reference rates source contract (cost-reference-rates.json) for jvto-itinerary-core';

    private const OUTPUT_RELATIVE_PATH = 'exports/itinerary-core/cost-reference-rates.json';

    private const JSON_FLAGS = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;

    private const SECTIONS = [
        'vehicle_rates', 'crew_rates', 'transport_crew_rules', 'hotel_rates', 'room_rates',
        'room_configurations', 'destination_activity_rates', 'other_activity_rates',
        'addon_expense_rates',
    ];

    public function handle(CostReferenceRatesPayloadBuilder $builder, CostReferenceRatesValidator $validator): int
    {
        $this->info('Building cost-reference-rates payload...');
        $payload = $builder->build();

        // Validation gate: PII keys, stable ids, deterministic ordering.
        $issues = $validator->validate($payload);
        if (! empty($issues)) {
            $this->error('Validation FAILED:');
            foreach ($issues as $issue) {
                $this->line('  - '.$issue);
            }

            return self::FAILURE;
        }
        $this->info('Validation PASS (no PII keys, stable ids, deterministic ordering).');

        // Determinism gate: a second build must be byte-identical.
        $second = $builder->build();
        $firstJson = json_encode($payload, self::JSON_FLAGS);
        $secondJson = json_encode($second, self::JSON_FLAGS);
        if (md5($firstJson) !== md5($secondJson)) {
            $this->error('Determinism FAILED: two consecutive builds produced different output.');

            return self::FAILURE;
        }
        $this->info('Determinism PASS (two builds byte-identical, md5='.md5($firstJson).').');

        // Write the artifact.
        $path = base_path(self::OUTPUT_RELATIVE_PATH);
        $dir = dirname($path);
        if (! is_dir($dir) && ! mkdir($dir, 0775, true) && ! is_dir($dir)) {
            $this->error("Could not create output directory: {$dir}");

            return self::FAILURE;
        }
        file_put_contents($path, $firstJson.PHP_EOL);
        $this->info("Wrote: {$path}");

        $this->printSummary($payload);

        return self::SUCCESS;
    }

    private function printSummary(array $payload): void
    {
        $this->newLine();
        $this->line('Counts per section:');
        $rows = [];
        foreach (self::SECTIONS as $section) {
            $rows[] = [$section, count($payload[$section] ?? [])];
        }
        $this->table(['section', 'count'], $rows);

        $report = $payload['quality_report'];
        $this->line("missing_price_count: {$report['missing_price_count']}");
        $this->line("missing_label_count: {$report['missing_label_count']}");
        $this->line('warnings: '.count($report['warnings']));
        foreach ($report['warnings'] as $warning) {
            $this->line('  - '.$warning);
        }
        $this->line("generated_at (data watermark): {$payload['generated_at']}");
    }
}
