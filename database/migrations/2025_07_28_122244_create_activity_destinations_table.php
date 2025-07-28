<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_destinations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('activity_code');
            $table->text('description')->nullable();
            $table->foreignId('activity_category_id')->constrained()->onDelete('cascade');            
            $table->unsignedBigInteger('destination_id')->nullable();
            $table->unsignedBigInteger('from_destination_id')->nullable();
            $table->unsignedBigInteger('to_destination_id')->nullable();
            $table->integer('duration_hours')->nullable();
            $table->string('difficulty_level')->nullable();
            $table->text('physical_requirements')->nullable();
            $table->text('health_advisories')->nullable();
            $table->text('required_gear')->nullable();
            $table->string('tags')->nullable();
            $table->string('best_time_to_visit')->nullable();
            $table->timestamps();

            $table->foreign('destination_id')->references('id')->on('destinations')->onDelete('cascade');
            $table->foreign('from_destination_id')->references('id')->on('destinations')->onDelete('cascade');
            $table->foreign('to_destination_id')->references('id')->on('destinations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_destinations');
    }
};
