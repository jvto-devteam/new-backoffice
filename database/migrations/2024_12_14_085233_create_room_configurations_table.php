<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('room_configurations', function (Blueprint $table) {
            $table->id(); // BIGINT AUTO_INCREMENT PRIMARY KEY
            $table->unsignedBigInteger('package_id'); // Foreign key to packages table
            $table->unsignedBigInteger('hotel_id'); // Foreign key to hotels table
            $table->unsignedBigInteger('room_hotel_id'); // Foreign key to room_hotels table
            $table->integer('group_size'); // Group size
            $table->integer('quantity'); // Quantity of rooms
            $table->timestamps(); // Adds created_at and updated_at

            // Foreign Key Constraints
            $table->foreign('package_id')->references('id')->on('packages')->onDelete('cascade');
            $table->foreign('hotel_id')->references('id')->on('hotels')->onDelete('cascade');
            $table->foreign('room_hotel_id')->references('id')->on('room_hotels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('room_configurations');
    }
}
