<?php

namespace App\Console\Commands;

use App\Http\Controllers\ThirdParty\WatzapController;
use Illuminate\Console\Command;
use App\Http\Controllers\YourControllerName; // Ganti dengan nama controller yang sesuai

class GenerateDailySummariesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wa:generate-daily-summaries';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate daily summaries for WhatsApp chats';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting to generate daily chat summaries...');
        
        // Instantiate controller and call the function
        $controller = app(WatzapController::class); // Ganti YourControllerName dengan nama controller Anda
        $result = $controller->generateDailySummaries();
        
        // Output results
        $successCount = count(array_filter($result, function($item) {
            return isset($item['status']) && $item['status'] == 'success';
        }));
        
        $errorCount = count(array_filter($result, function($item) {
            return isset($item['status']) && $item['status'] == 'error';
        }));
        
        $this->info("Daily summaries generated: {$successCount} success, {$errorCount} errors");
        
        // Log detailed results
        \Log::info('Daily summary generation complete', [
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'details' => $result
        ]);
        
        return 0;
    }
}