<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('is_trip_participants', ['0', '1'])->default('0')->after('total_pax');
            $table->string('car_type')->nullable()->after('is_trip_participants');
            $table->tinyInteger('numb_of_car')->nullable()->after('car_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('is_trip_participants');
            $table->dropColumn('car_type');
            $table->dropColumn('numb_of_car');
        });
    }
};