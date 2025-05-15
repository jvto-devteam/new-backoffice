<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpenseAdditionalsTable extends Migration
{
    public function up(): void
    {
        Schema::create('expense_additionals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->string('item');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('qty');
            $table->decimal('subtotal', 12, 2);
            $table->string('image')->nullable(); // path ke image
            $table->string('bill')->nullable(); // path ke file tagihan jika ada
            $table->date('request_date')->nullable();
            $table->string('request_by')->nullable();
            $table->date('submit_date')->nullable();
            $table->string('submit_by')->nullable();

            $table->timestamps();

            // Foreign keys (opsional, tergantung sistem kamu)
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_additionals');
    }
}
