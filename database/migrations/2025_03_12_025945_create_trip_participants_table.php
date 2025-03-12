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
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('title');
            $table->string('full_name');
            $table->string('gender');
            $table->string('flight_number')->nullable();
            $table->string('passport_number');
            $table->string('tshirt_size');
            $table->text('dietary_restriction')->nullable();
            $table->string('car_number')->nullable();
            $table->string('seat_number')->nullable();
            $table->integer('room_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};