<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.5
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- larastan/larastan (LARASTAN) - v3
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>


---

# Pickleball Booking System — Project Context

> Appended manually. All Laravel Boost rules above still apply and take priority.
> Stack is Laravel 13 + PHP 8.5 + Inertia v3 + React 19 + Tailwind v4.

---

## What this is

A **white-label court booking CMS**. Nothing is hardcoded — the court owner (admin)
configures everything: venue name, logo, courts, court images, time slots, and price
per hour. Public users browse courts, see a price preview, book a slot, and pay by
scanning a **QR image uploaded by the admin** (GCash / Maya).

There is **no payment gateway** (no PayMongo, no Dragonpay). Payment is manual and
confirmed by the admin. To prevent spam-booking, every unconfirmed booking is a
**timed hold** — if the user does not pay within N minutes, the booking auto-expires
and the slot is released back to the public.

---

## Roles

Two roles only, stored in `users.role`:

- `admin` — court owner. Full access under `/admin/*` routes.
- `user` — books courts. Default for all registrations.

Gate admin routes with middleware that checks `auth()->user()->role === 'admin'`.

---

## Conventions specific to this project

- **ULID primary keys** on every model — `$table->ulid('id')->primary()` in
  migrations, `use HasUlids;` on the model.
- **Currency:** Philippine Peso, always formatted as `₱1,234.00`.
- **Timezone:** `Asia/Manila` — set in `config/app.php`.
- **File uploads** (court images, payment QR, payment proof screenshots) go to
  `storage/app/public`, served via `php artisan storage:link`. Store the relative
  path in the DB and expose a `*_url` accessor on the model.
- **Sonner** for all toast notifications.
- **TanStack Table** for admin data tables (bookings list, courts list).
- Use **Wayfinder** (`@/actions/` or `@/routes/`) for all client-side route
  references — follow the Boost convention already in this file.
- On the PHP/Laravel side, use **named routes** and the `route()` helper.
- Always output **complete file contents**, not partial snippets.
- Edits are **surgical** — preserve existing working functionality.

---

## Database schema

### users *(extend the starter kit's existing users table)*
Add to the existing users migration or a new one:
```php
$table->string('phone')->nullable()->after('email');
$table->string('role')->default('user')->after('phone'); // 'admin' | 'user'
```
Add `use HasUlids;` to the `User` model and update any factories/seeders that
assume an integer id.

### settings *(key → value, white-label venue content)*
```php
Schema::create('settings', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('key')->unique();
    $table->text('value')->nullable();
    $table->timestamps();
});
```
Seed these keys: `venue_name`, `venue_logo_path`, `contact_email`, `contact_phone`,
`payment_qr_path` (default venue QR), `payment_instructions`, `hold_minutes`
(default `"5"`).

### courts
```php
Schema::create('courts', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('surface')->nullable();        // e.g. "Indoor" / "Outdoor"
    $table->string('image_path')->nullable();
    $table->decimal('price_per_hour', 8, 2)->default(0);
    $table->string('payment_qr_path')->nullable(); // per-court QR override
    $table->boolean('is_active')->default(true);
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

### time_slots *(recurring daily windows per court)*
```php
Schema::create('time_slots', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('court_id')->constrained()->cascadeOnDelete();
    $table->time('start_time');  // e.g. "08:00"
    $table->time('end_time');    // e.g. "09:00"
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```
A time slot is a **daily template** — it is bookable on any date unless a booking
already exists for that court + slot + date combination.

### bookings *(the core table)*
```php
Schema::create('bookings', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
    $table->foreignUlid('court_id')->constrained()->cascadeOnDelete();
    $table->foreignUlid('time_slot_id')->constrained()->cascadeOnDelete();
    $table->date('booking_date');
    $table->string('status')->default('pending_payment');
    $table->decimal('amount', 8, 2);             // price snapshot at booking time
    $table->string('reference_code')->unique();   // e.g. "PB-7F3K9Q"
    $table->timestamp('expires_at')->nullable();  // hold deadline
    $table->timestamp('paid_at')->nullable();     // when user tapped "I've paid"
    $table->timestamp('confirmed_at')->nullable();// when admin verified
    $table->string('payment_proof_path')->nullable();
    $table->text('notes')->nullable();            // admin note / rejection reason
    $table->timestamps();

    $table->index(['court_id', 'booking_date', 'status']);
});
```
> No DB unique constraint on (court, slot, date) — expired/rejected/cancelled rows
> for the same slot must coexist as history. Double-booking is prevented in
> application code only. See algorithms below.

---

## BookingStatus enum

```php
// app/Enums/BookingStatus.php
enum BookingStatus: string
{
    case PendingPayment       = 'pending_payment';
    case AwaitingConfirmation = 'awaiting_confirmation';
    case Confirmed            = 'confirmed';
    case Expired              = 'expired';
    case Rejected             = 'rejected';
    case Cancelled            = 'cancelled';
}
```

Status flow:
```
pending_payment  ──(timer expires)──▶  expired       (slot freed)
      │
      │ user taps "I've paid"
      ▼
awaiting_confirmation  ──(admin rejects)──▶  rejected  (slot freed)
      │
      │ admin verifies
      ▼
   confirmed  ──(cancel)──▶  cancelled
```

**Critical:** expiry only ever targets `pending_payment`. A booking that has moved
to `awaiting_confirmation` must never be expired, even if `expires_at` has passed.

---

## Models

### Court
```php
class Court extends Model
{
    use HasUlids;

    protected $fillable = [
        'name', 'description', 'surface', 'image_path',
        'price_per_hour', 'payment_qr_path', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/'.$this->image_path) : null;
    }

    public function priceForHours(float $hours): float
    {
        return round($this->price_per_hour * $hours, 2);
    }
}
```

### TimeSlot
```php
class TimeSlot extends Model
{
    use HasUlids;

    protected $fillable = ['court_id', 'start_time', 'end_time', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function getDurationHoursAttribute(): float
    {
        return Carbon::parse($this->start_time)
            ->diffInMinutes(Carbon::parse($this->end_time)) / 60;
    }

    public function getPriceAttribute(): float
    {
        return $this->court->priceForHours($this->duration_hours);
    }
}
```

### Booking
```php
class Booking extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'court_id', 'time_slot_id', 'booking_date', 'status',
        'amount', 'reference_code', 'expires_at', 'paid_at', 'confirmed_at',
        'payment_proof_path', 'notes',
    ];

    protected $casts = [
        'booking_date'   => 'date',
        'amount'         => 'decimal:2',
        'status'         => BookingStatus::class,
        'expires_at'     => 'datetime',
        'paid_at'        => 'datetime',
        'confirmed_at'   => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function court(): BelongsTo { return $this->belongsTo(Court::class); }
    public function timeSlot(): BelongsTo { return $this->belongsTo(TimeSlot::class); }

    /** Bookings that currently occupy a slot (active holds + confirmed). */
    public function scopeBlocking(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereIn('status', [
                BookingStatus::AwaitingConfirmation,
                BookingStatus::Confirmed,
            ])->orWhere(fn (Builder $q2) => $q2
                ->where('status', BookingStatus::PendingPayment)
                ->where('expires_at', '>', now())
            );
        });
    }
}
```

### Setting *(cached key/value store)*
```php
class Setting extends Model
{
    use HasUlids;

    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return cache()->rememberForever(
            "setting:{$key}",
            fn () => static::where('key', $key)->value('value')
        ) ?? $default;
    }

    public static function put(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        cache()->forget("setting:{$key}");
    }
}
```

---

## Two core algorithms — do not deviate

### A. Availability check (lazy expiry)

Never trust `status` alone. An expired hold must read as free immediately, before
any cleanup job runs. Always use the `blocking()` scope:

```php
$takenSlotIds = Booking::where('court_id', $courtId)
    ->whereDate('booking_date', $date)
    ->blocking()
    ->pluck('time_slot_id');

$availableSlots = TimeSlot::where('court_id', $courtId)
    ->where('is_active', true)
    ->whereNotIn('id', $takenSlotIds)
    ->get();
```

### B. Booking creation (race condition protection)

Wrap in a DB transaction with `lockForUpdate()`. Re-check availability inside the
lock so only one of two simultaneous requests can succeed:

```php
DB::transaction(function () use ($user, $court, $slot, $date): Booking {
    $alreadyTaken = Booking::where('time_slot_id', $slot->id)
        ->whereDate('booking_date', $date)
        ->lockForUpdate()
        ->blocking()
        ->exists();

    if ($alreadyTaken) {
        abort(409, 'That slot was just taken. Please pick another time.');
    }

    return Booking::create([
        'user_id'        => $user->id,
        'court_id'       => $court->id,
        'time_slot_id'   => $slot->id,
        'booking_date'   => $date,
        'status'         => BookingStatus::PendingPayment,
        'amount'         => $slot->price,
        'reference_code' => 'PB-'.strtoupper(Str::random(6)),
        'expires_at'     => now()->addMinutes((int) Setting::get('hold_minutes', 5)),
    ]);
});
```

---

## Expire command + schedule

```php
// app/Console/Commands/ExpireBookings.php — handle()
Booking::where('status', BookingStatus::PendingPayment)
    ->where('expires_at', '<', now())
    ->update(['status' => BookingStatus::Expired]);
```

Register in `routes/console.php`:
```php
Schedule::command('bookings:expire')->everyMinute();
```

Server cron (one line, set this up on whichever host you choose):
```
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

> The `blocking()` scope is what actually releases slots instantly. The cron only
> tidies up the status label in the DB and the user's booking history view.

---

## Payment QR logic

On the booking pay page, show the court's own QR if it has one, otherwise fall back
to the venue-level QR from settings:

```php
$qrPath = $booking->court->payment_qr_path
    ?? Setting::get('payment_qr_path');
```

---

## Frontend countdown timer

Drive the React countdown off the **server's `expires_at`** timestamp, not a local
`5:00` counter — so a page refresh doesn't reset it.

```js
const secondsLeft = Math.max(
    0,
    Math.floor((new Date(expires_at) - new Date()) / 1000)
);
```

At zero: swap the QR view for "This hold expired — the slot has been released."

---

## Planned routes

```
Public / user
  GET  /                           court listing (active only)
  GET  /courts/{court}             court detail + date picker + available slots
  POST /bookings                   create hold → redirect to pay page
  GET  /bookings/{ref}/pay         QR + price + live countdown
  POST /bookings/{ref}/paid        user marks paid + optional proof upload
  GET  /my/bookings                user's booking history
  POST /bookings/{ref}/cancel      user cancels own booking

Admin  (prefix: /admin, middleware: role:admin)
  GET    /admin                    dashboard (today's bookings, pending count)
  resource /admin/courts           CRUD + image upload + price + QR
  resource /admin/courts/{court}/slots   manage time slots
  GET    /admin/bookings           all bookings (TanStack Table + filters)
  POST   /admin/bookings/{b}/confirm
  POST   /admin/bookings/{b}/reject
  GET    /admin/settings           white-label settings form
  PUT    /admin/settings
```

---

## Suggested build order

1. Migrations + `BookingStatus` enum + all models + `Setting` helper
2. Seeder: admin user + default settings + demo courts + demo slots
3. Admin: courts CRUD (image upload, price per hour, QR, active toggle)
4. Admin: time slots per court
5. Public: court browse → court detail → date picker → available slots (algo A)
6. Booking create (algo B) → pay page (QR + price preview + countdown)
7. "I've paid" flow + optional proof upload → `awaiting_confirmation`
8. Admin: bookings list + confirm / reject actions
9. `bookings:expire` command + schedule + cron setup note
10. Admin settings page (venue name, logo, QR, instructions, hold minutes)
11. Polish: empty states, Sonner toasts, mobile layout

---

## Open decisions (resolve when you reach them)

- **Payment proof:** `payment_proof_path` column exists. Decide if upload is
  required or optional. Current assumption: optional but encouraged.
- **QR scope:** venue-level default + optional per-court override (both columns
  exist). Pay page uses per-court QR if set, else venue QR.
- **Auth:** assumes users register with an account. Guest booking is a future
  extension.
- **Server:** Amazon Lightsail or Hostinger — undecided. Design is server-agnostic.
  Both support the cron line above.
