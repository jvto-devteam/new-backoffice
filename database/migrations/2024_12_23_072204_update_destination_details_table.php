<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateDestinationDetailsTable extends Migration
{
    public function up()
    {
        Schema::table('destination_details', function (Blueprint $table) {
// Drop specified columns
            $table->dropColumn([
                'topography',
                'ecosystems',
                'geological_features',
                'dry_season',
                'rainy_season',
                'temperature',
                'sunrise_timing',
                'rainfall_patterns',
                'footwear',
                'clothing',
                'waterproof_items',
                'lighting',
                'protection',
                'hydration',
                'trail_difficulty',
                'altitude_seckness_risk',
                'technical_sections',
                'preparations',
                'daily_trekking_hours',
                'health_check',
                'acclimatization',
            ]);

// Add new columns
            $table->string('location')->nullable();
            $table->string('weather_by_season')->nullable();
            $table->string('rainfall_intensity')->nullable();
            $table->string('trail_details')->nullable();
            $table->string('required_gear')->nullable();
            $table->string('difficulty_level')->nullable();
            $table->string('environmental_factors')->nullable();
            $table->string('physical_requirements')->nullable();
            $table->string('main_attractions')->nullable();
            $table->string('best_time_to_visit')->nullable();
            $table->string('tips_for_visitors')->nullable();
        });
    }

    public function down()
    {
        Schema::table('destination_details', function (Blueprint $table) {
// Re-add dropped columns
            $table->string('topography')->nullable();
            $table->string('ecosystems')->nullable();
            $table->string('geological_features')->nullable();
            $table->string('dry_season')->nullable();
            $table->string('rainy_season')->nullable();
            $table->string('temperature')->nullable();
            $table->string('sunrise_timing')->nullable();
            $table->string('rainfall_patterns')->nullable();
            $table->string('footwear')->nullable();
            $table->string('clothing')->nullable();
            $table->string('waterproof_items')->nullable();
            $table->string('lighting')->nullable();
            $table->string('protection')->nullable();
            $table->string('hydration')->nullable();
            $table->string('trail_difficulty')->nullable();
            $table->string('altitude_seckness_risk')->nullable();
            $table->string('technical_sections')->nullable();
            $table->string('preparations')->nullable();
            $table->string('daily_trekking_hours')->nullable();
            $table->string('health_check')->nullable();
            $table->string('acclimatization')->nullable();

// Drop newly added columns
            $table->dropColumn([
                'location',
                'weather_by_season',
                'rainfall_intensity',
                'trail_details',
                'required_gear',
                'difficulty_level',
                'environmental_factors',
                'physical_requirements',
                'main_attractions',
                'best_time_to_visit',
                'tips_for_visitors',
            ]);
        });
    }
}
