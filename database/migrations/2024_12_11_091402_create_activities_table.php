<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_activities', function (Blueprint $table) {
            $table->id('activity_id'); // Primary Key
            $table->unsignedBigInteger('category_id'); // Foreign Key
            $table->string('activity_name'); // Activity Name
            $table->string('unit', 50); // Unit (e.g., Pax, No)
            $table->integer('rate'); // Rate in IDR
            $table->timestamps(); // Timestamps

            // Foreign Key Constraint
            $table->foreign('category_id')
                ->references('category_id')
                ->on('item_activity_categories')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('activities');
    }
}
