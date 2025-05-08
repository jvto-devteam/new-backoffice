<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWaChatIgnoresTable extends Migration
{
    public function up()
    {
        Schema::create('wa_chat_ignores', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('wa_chat_ignores');
    }
}
