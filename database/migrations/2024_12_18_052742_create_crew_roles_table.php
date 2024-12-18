<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCrewRolesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('crew_roles', function (Blueprint $table) {
            $table->id();
            $table->string('crew_role_code');
            $table->unsignedBigInteger('order_channel_id');
            $table->string('role');
            $table->string('unit');
            $table->string('formula');
            $table->double('rate');
            $table->timestamps();

            $table->foreign('order_channel_id')->references('id')->on('order_channels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('crew_roles');
    }
}
