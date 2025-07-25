<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add to packages
        Schema::table('packages', function (Blueprint $table) {
            $table->text('key_highlights')->nullable()->after('overview');
        });

        // Add to itineraries
        Schema::table('itineraries', function (Blueprint $table) {
            $table->string('physical_demand')->nullable()->after('activity');
            $table->text('travel_logistic')->nullable()->after('physical_demand');
        });

        // Add to itinerary_details
        Schema::table('itinerary_details', function (Blueprint $table) {
            $table->text('care_tip_for_tomorrow')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        // Rollback for packages
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('key_highlights');
        });

        // Rollback for itineraries
        Schema::table('itineraries', function (Blueprint $table) {
            $table->dropColumn(['physical_demand', 'travel_logistic']);
        });

        // Rollback for itinerary_details
        Schema::table('itinerary_details', function (Blueprint $table) {
            $table->dropColumn('care_tip_for_tomorrow');
        });
    }
};
