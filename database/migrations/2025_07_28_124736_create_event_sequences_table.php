<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_sequences', function (Blueprint $table) {
            $table->id();
            $table->integer('no'); // sequence number
            $table->foreignId('itinerary_id')->constrained('itineraries')->onDelete('cascade');
            $table->foreignId('activity_destination_id')->constrained('activity_destinations')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_sequences');
    }
};
