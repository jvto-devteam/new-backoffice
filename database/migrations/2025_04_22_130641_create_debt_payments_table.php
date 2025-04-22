<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDebtPaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number');
            $table->unsignedBigInteger('vendor_id');
            $table->enum('item_type', ['hotel', 'activity', 'bromo', 'car', 'others']);
            $table->date('payment_date');
            $table->unsignedBigInteger('payment_method_id');
            $table->string('payment_proof')->nullable();
            $table->text('note')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();
            
            $table->foreign('vendor_id')->references('id')->on('vendors');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods');
            
            $table->index('payment_number');
            $table->index(['vendor_id', 'item_type']);
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('debt_payments');
    }
}