<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivityCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_activity_categories', function (Blueprint $table) {
            $table->id('category_id'); // Primary Key
            $table->string('category_code', 50); // Code (e.g., B1, B2)
            $table->string('category_name'); // Name (e.g., Ijen, Bromo)
            $table->timestamps(); // Timestamps
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('activity_categories');
    }
}
