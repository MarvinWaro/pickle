<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_time_slot', function (Blueprint $table) {
            $table->foreignUlid('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('time_slot_id')->constrained()->cascadeOnDelete();

            $table->primary(['booking_id', 'time_slot_id']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['time_slot_id']);
            $table->dropColumn('time_slot_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignUlid('time_slot_id')->nullable()->after('court_id')->constrained()->cascadeOnDelete();
        });

        Schema::dropIfExists('booking_time_slot');
    }
};
