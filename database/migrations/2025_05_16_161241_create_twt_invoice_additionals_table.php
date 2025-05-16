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
        Schema::create('twt_invoice_additionals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('twt_invoices')->onDelete('cascade');
            $table->foreignId('expense_additional_id')->constrained('expense_additionals');
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('twt_invoice_additionals');
    }
};