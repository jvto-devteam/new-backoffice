<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDebtPaymentDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('debt_payment_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id');
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('item_id');
            $table->decimal('amount', 12, 2);
            $table->json('item_data');
            $table->timestamps();
            
            $table->foreign('payment_id')->references('id')->on('debt_payments')->onDelete('cascade');
            $table->foreign('booking_id')->references('id')->on('bookings');
            
            $table->index(['payment_id', 'booking_id']);
            $table->index('item_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('debt_payment_details');
    }
}