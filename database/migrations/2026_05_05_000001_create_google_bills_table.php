<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_bills', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('month')->unsigned()->comment('1-12');
            $table->smallInteger('year')->unsigned();
            $table->bigInteger('google_cloud')->default(0);
            $table->bigInteger('google_ads')->default(0);
            $table->timestamps();
            $table->unique(['month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_bills');
    }
};
