<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@pickle.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'User',
            'email' => 'user@pickle.test',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $settings = [
            ['key' => 'venue_name', 'value' => 'Pickle Court'],
            ['key' => 'venue_logo_path', 'value' => null],
            ['key' => 'contact_email', 'value' => null],
            ['key' => 'contact_phone', 'value' => null],
            ['key' => 'payment_qr_path', 'value' => null],
            ['key' => 'payment_method', 'value' => 'GCash'],
            ['key' => 'payment_account_name', 'value' => null],
            ['key' => 'payment_account_number', 'value' => null],
            ['key' => 'messenger_link', 'value' => null],
            ['key' => 'payment_instructions', 'value' => null],
            ['key' => 'hold_minutes', 'value' => '5'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }

        $courts = [
            [
                'name' => 'Court A',
                'surface' => 'Indoor',
                'price_per_hour' => 300.00,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Court B',
                'surface' => 'Outdoor',
                'price_per_hour' => 200.00,
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        $slots = [
            ['start_time' => '08:00', 'end_time' => '09:00'],
            ['start_time' => '09:00', 'end_time' => '10:00'],
            ['start_time' => '10:00', 'end_time' => '11:00'],
        ];

        foreach ($courts as $courtData) {
            $court = Court::create($courtData);

            foreach ($slots as $slot) {
                TimeSlot::create([
                    'court_id' => $court->id,
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'is_active' => true,
                ]);
            }
        }
    }
}
