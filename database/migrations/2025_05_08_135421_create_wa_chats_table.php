<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWaChatsTable extends Migration
{
    public function up()
    {
        Schema::create('wa_chats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->text('message');
            $table->enum('is_from_me', ['0', '1'])->comment('0 = from user, 1 = from me');
            $table->enum('has_media', ['0', '1'])->default('0');
            $table->string('media_mime')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('wa_chats');
    }
}
