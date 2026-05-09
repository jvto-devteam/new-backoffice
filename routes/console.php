<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();
Schedule::command('wa:generate-daily-summaries')
    ->dailyAt('23:59')
    ->appendOutputTo(storage_path('logs/wa-daily-summaries.log'))
    ->description('Generate daily summaries for WhatsApp chats');

Schedule::command('bca:sync-transfers')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/bca-sync.log'))
    ->description('Sync BCA transfer notification emails to crew expense records');
