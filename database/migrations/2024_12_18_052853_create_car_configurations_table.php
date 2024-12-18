<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCarConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('car_configurations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('car_id');
            $table->tinyInteger('pax')->unsigned();
            $table->double('price');
            $table->unsignedBigInteger('crew_jvto_role_id')->nullable();
            $table->unsignedBigInteger('crew_twt_role_id')->nullable();
            $table->unsignedBigInteger('crew_klook_role_id')->nullable();
            $table->timestamps();

            $table->foreign('car_id')->references('id')->on('cars')->onDelete('cascade');
            $table->foreign('crew_jvto_role_id')->references('id')->on('crew_roles')->onDelete('set null');
            $table->foreign('crew_twt_role_id')->references('id')->on('crew_roles')->onDelete('set null');
            $table->foreign('crew_klook_role_id')->references('id')->on('crew_roles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('car_configurations');
    }
}
