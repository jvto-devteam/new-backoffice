<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDestinationDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('destination_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('destination_id');
            $table->text('topography')->nullable();
            $table->text('ecosystems')->nullable();
            $table->text('geological_features')->nullable();
            $table->text('dry_season')->nullable();
            $table->text('rainy_season')->nullable();
            $table->text('temperature')->nullable();
            $table->text('sunrise_timing')->nullable();
            $table->text('rainfall_patterns')->nullable();
            $table->text('footwear')->nullable();
            $table->text('clothing')->nullable();
            $table->text('waterproof_items')->nullable();
            $table->text('lighting')->nullable();
            $table->text('protection')->nullable();
            $table->text('hydration')->nullable();
            $table->text('trail_difficulty')->nullable();
            $table->text('altitude_seckness_risk')->nullable();
            $table->text('technical_sections')->nullable();
            $table->text('preparations')->nullable();
            $table->text('daily_trekking_hours')->nullable();
            $table->text('health_check')->nullable();
            $table->text('acclimatization')->nullable();
            $table->timestamps();

            $table->foreign('destination_id')->references('id')->on('destinations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('destination_details');
    }
}
