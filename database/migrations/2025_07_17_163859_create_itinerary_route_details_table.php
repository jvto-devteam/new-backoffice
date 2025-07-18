<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('itinerary_route_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_route_id')->constrained('itinerary_routes')->onDelete('cascade');
            $table->time('time')->nullable();
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('cascade')->nullable();
            $table->foreignId('activity_category_id')->constrained('activity_categories')->onDelete('cascade');
            $table->string('activity');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerary_route_details');
    }
};
