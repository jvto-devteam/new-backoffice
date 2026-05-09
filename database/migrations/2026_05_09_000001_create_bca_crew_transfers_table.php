<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bca_crew_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->date('transfer_date');
            $table->time('transfer_time');
            $table->bigInteger('amount');
            $table->bigInteger('fee')->nullable();
            $table->string('to_account');
            $table->string('to_bank')->nullable();
            $table->string('reference_no')->unique();
            $table->string('remark');
            $table->string('booking_code_matched');
            $table->string('email_message_id')->unique();
            $table->timestamp('email_received_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bca_crew_transfers');
    }
};
