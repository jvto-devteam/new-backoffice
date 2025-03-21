<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsVendorPaidColumnsToBookingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('is_vendor_paid', ['0', '1'])->default('0');
            $table->timestamp('is_vendor_paid_date')->nullable();
            $table->string('is_vendor_paid_reference')->nullable();
            $table->unsignedBigInteger('is_vendor_paid_payment_method_id')->nullable();
            
            // Add foreign key constraint
            $table->foreign('is_vendor_paid_payment_method_id')
                  ->references('id')
                  ->on('payment_methods')
                  ->onDelete('set null');  // In case the referenced payment method is deleted
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['is_vendor_paid_payment_method_id']);
            $table->dropColumn('is_vendor_paid');
            $table->dropColumn('is_vendor_paid_date');
            $table->dropColumn('is_vendor_paid_reference');
            $table->dropColumn('is_vendor_paid_payment_method_id');
        });
    }
}
