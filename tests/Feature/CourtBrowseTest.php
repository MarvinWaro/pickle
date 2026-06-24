<?php

use App\Models\Court;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('courts.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can browse only active courts in the app shell', function () {
    $active = Court::factory()->create(['is_active' => true]);
    Court::factory()->create(['is_active' => false]);

    $this->actingAs(User::factory()->create())
        ->get(route('courts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('courts/index')
            ->has('courts', 1)
            ->where('courts.0.id', $active->id)
            // The persistent profile rail relies on shared player stats.
            ->has('playerStats')
        );
});
