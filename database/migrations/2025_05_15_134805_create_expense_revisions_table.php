<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpenseRevisionsTable extends Migration
{
    public function up(): void
    {
        Schema::create('expense_revisions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('item_id')->nullable(); // mengacu ke salah satu dari banyak table
            $table->string('item_id_source')->nullable(); // nama tabel sumber item_id
            $table->string('item')->nullable(); // nama item (bisa override/backup jika tidak bisa ambil relasi)
            $table->tinyInteger('qty'); // nama item (bisa override/backup jika tidak bisa ambil relasi)
            $table->decimal('price_before', 12, 2);
            $table->decimal('price_after', 12, 2);
            $table->decimal('total', 12, 2);
            $table->enum('status',['pending', 'approved', 'rejected'])->default('pending'); // status revisi
            $table->text('reason')->nullable(); // alasan revisi
            $table->timestamps();

            // Foreign key ke bookings
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_revisions');
    }
}
