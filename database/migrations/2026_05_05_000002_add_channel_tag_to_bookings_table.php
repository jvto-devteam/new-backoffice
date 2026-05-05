<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('channel_tag', ['klook', 'gyg', 'viator'])
                ->nullable()
                ->after('booking_category_id')
                ->comment('Manual override for KLOOK bookings: null = auto-detect by invoice_code_origin prefix');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('channel_tag');
        });
    }
};
