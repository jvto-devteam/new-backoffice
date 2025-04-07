<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNoteCategoriesTable extends Migration
{
    public function up()
    {
        Schema::dropIfExists('note_categories');

        Schema::create('note_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color'); // Hex code
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('note_categories');
    }
}
