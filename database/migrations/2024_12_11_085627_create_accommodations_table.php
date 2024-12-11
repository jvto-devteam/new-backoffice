<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccommodationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id('accommodation_id'); // Primary Key, Auto Increment
            $table->unsignedBigInteger('category_id'); // Foreign Key
            $table->string('accommodation_name'); // Accommodation Name
            $table->timestamps();

            // Define the foreign key constraint
            $table->foreign('category_id')
                ->references('id')
                ->on('accommodation_categories')
                ->onDelete('cascade'); // If a category is deleted, delete related accommodations
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('accommodations');
    }
}
