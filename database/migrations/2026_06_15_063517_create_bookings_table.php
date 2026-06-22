<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('court_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('time_slot_id')->constrained()->cascadeOnDelete();
            $table->date('booking_date');
            $table->string('status')->default('pending_payment');
            $table->decimal('amount', 8, 2);
            $table->string('reference_code')->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->string('payment_proof_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['court_id', 'booking_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
