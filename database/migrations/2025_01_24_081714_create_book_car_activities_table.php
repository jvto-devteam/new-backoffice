<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookCarActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_car_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('car_id');
            $table->integer('qty');
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->enum('status_paid', ['paid', 'unpaid'])->nullable();
            $table->timestamp('paid_date')->nullable();
            $table->enum('is_debt', ['0', '1'])->nullable();
            $table->timestamps();

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('car_id')->references('id')->on('cars')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_car_activities');
    }
};
