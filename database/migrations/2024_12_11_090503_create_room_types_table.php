<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id('room_type_id'); // Primary Key, Auto Increment
            $table->unsignedBigInteger('accommodation_id'); // Foreign Key to Accommodations
            $table->string('room_type'); // Room type name (e.g., Deluxe, Family)
            $table->integer('rate_per_night'); // Rate per night in IDR
            $table->boolean('include_breakfast')->default(false); // Optional: Includes breakfast
            $table->boolean('include_dinner')->default(false); // Optional: Includes dinner
            $table->boolean('extra_bed_option')->default(false); // Optional: Extra bed availability
            $table->timestamps();

            // Define foreign key constraint
            $table->foreign('accommodation_id')
                ->references('accommodation_id')
                ->on('accommodations')
                ->onDelete('cascade'); // Delete room types if accommodation is deleted
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('room_types');
    }
}
