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
            $table->foreignId('activity_start_id')->constrained('activity_starts')->onDelete('cascade');
            $table->foreignId('activity_end_id')->constrained('activity_ends')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerary_routes');
    }
};
