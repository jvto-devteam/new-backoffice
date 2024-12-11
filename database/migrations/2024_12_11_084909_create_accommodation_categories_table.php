<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccommodationCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('accommodation_categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_code');
            $table->string('category_name');
            $table->timestamps();
        });

        // Insert the data
        DB::table('accommodation_categories')->insert([
            ['category_code' => 'A1', 'category_name' => 'Ijen'],
            ['category_code' => 'A2', 'category_name' => 'Bromo'],
            ['category_code' => 'A3', 'category_name' => 'Lumajang/Malang/Jember'],
            ['category_code' => 'A4', 'category_name' => 'Surabaya']
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('accommodation_categories');
    }
}
