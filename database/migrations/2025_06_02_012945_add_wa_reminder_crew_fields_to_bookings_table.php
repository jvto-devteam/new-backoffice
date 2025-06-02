<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('wa_status_reminder_crew', ['0', '1','00'])->default('0')->after('wa_schedule_trip_media_crew');
            $table->dateTime('wa_schedule_reminder_crew')->nullable()->after('wa_status_reminder_crew');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['wa_status_reminder_crew', 'wa_schedule_reminder_crew']);
        });
    }
};
