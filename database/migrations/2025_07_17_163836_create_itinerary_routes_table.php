<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('itinerary_routes', function (Blueprint $table) {
            $table->id();
            $table->string('route');
            $table->string('title');
            $table->text('description');
            $table->text('pro_tips')->nullable();
            $table->foreignId('start_destination_id')->constrained('destinations')->onDelete('cascade');
            $table->foreignId('end_destination_id')->constrained('destinations')->onDelete('cascade');
            $table->enum('breakfast', ['yes', 'no'])->default('no');
            $table->enum('lunch', ['yes', 'no'])->default('no');
            $table->enum('dinner', ['yes', 'no'])->default('no');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerary_routes');
    }
};
