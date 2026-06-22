import { Form, Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { lookup } from '@/actions/App/Http/Controllers/BookingController';
import InputError from '@/components/input-error';
import { SiteHeader } from '@/components/site-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FindBooking() {
    return (
        <>
            <Head title="Find my booking" />

            <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
                <SiteHeader />

                <main className="mx-auto w-full max-w-md px-6 pt-10 pb-20">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-5 flex flex-col items-center gap-2 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Search className="size-6" />
                            </span>
                            <h1 className="text-xl font-semibold">
                                Find my booking
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Enter the reference code from your booking (e.g.
                                PB-XXXXXX) to view its status.
                            </p>
                        </div>

                        <Form {...lookup.form()} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reference_code">
                                            Reference code
                                        </Label>
                                        <Input
                                            id="reference_code"
                                            name="reference_code"
                                            required
                                            autoFocus
                                            placeholder="PB-XXXXXX"
                                            className="font-mono uppercase"
                                        />
                                        <InputError
                                            message={errors.reference_code}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Searching…' : 'Find booking'}
                                    </button>
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}
