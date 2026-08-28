<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\ShopService;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Get available booking slots for a shop, service, and date
     */
    public function getAvailableSlots(Request $request, int $shopId)
    {
        $request->validate([
            'service_id' => 'required|exists:shop_services,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $shop = Shop::with(['hours', 'breaks', 'services'])->findOrFail($shopId);

        // Check if shop is active & subscribed
        if (!$shop->isPubliclyVisible()) {
            return response()->json([
                'available' => false,
                'message' => 'This shop is currently not accepting online reservations.',
                'slots' => [],
            ], 422);
        }

        $service = $shop->services()->findOrFail($request->service_id);
        $duration = $service->duration_minutes ?: 45;

        $targetDate = Carbon::parse($request->date);
        $dayOfWeek = $targetDate->dayOfWeek; // 0 (Sun) to 6 (Sat)

        // Find business hours for this day
        $dayHours = $shop->hours()->where('day_of_week', $dayOfWeek)->first();

        if (!$dayHours || $dayHours->is_closed) {
            return response()->json([
                'available' => false,
                'message' => 'Shop is closed on ' . $targetDate->format('l'),
                'slots' => [],
            ]);
        }

        $openTime = Carbon::parse($request->date . ' ' . $dayHours->open_time);
        $closeTime = Carbon::parse($request->date . ' ' . $dayHours->close_time);

        // Breaks for this day
        $breaks = $shop->breaks()->where(function ($q) use ($dayOfWeek) {
            $q->whereNull('day_of_week')->orWhere('day_of_week', $dayOfWeek);
        })->get();

        // Existing booked reservations for this date
        $existingBookings = Reservation::where('shop_id', $shopId)
            ->where('reservation_date', $targetDate->toDateString())
            ->whereNotIn('status', ['cancelled', 'no-show'])
            ->get();

        // Generate candidate slots in 30 or 45 minute increments
        $slotInterval = 30; // minutes
        $slots = [];
        $currentTime = $openTime->copy();

        while ($currentTime->copy()->addMinutes($duration)->lte($closeTime)) {
            $slotStart = $currentTime->copy();
            $slotEnd = $currentTime->copy()->addMinutes($duration);

            $isBlocked = false;

            // Check if slot falls in past if target date is today
            if ($targetDate->isToday() && $slotStart->lte(now()->addMinutes(15))) {
                $isBlocked = true;
            }

            // Check break overlaps
            if (!$isBlocked) {
                foreach ($breaks as $b) {
                    $bStart = Carbon::parse($request->date . ' ' . $b->break_start);
                    $bEnd = Carbon::parse($request->date . ' ' . $b->break_end);
                    if ($slotStart->lt($bEnd) && $slotEnd->gt($bStart)) {
                        $isBlocked = true;
                        break;
                    }
                }
            }

            // Check existing reservations overlaps (Prevent double booking)
            if (!$isBlocked) {
                foreach ($existingBookings as $res) {
                    $resStart = Carbon::parse($request->date . ' ' . $res->start_time);
                    $resEnd = Carbon::parse($request->date . ' ' . $res->end_time);
                    if ($slotStart->lt($resEnd) && $slotEnd->gt($resStart)) {
                        $isBlocked = true;
                        break;
                    }
                }
            }

            if (!$isBlocked) {
                $slots[] = [
                    'start_time' => $slotStart->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'formatted' => $slotStart->format('h:i A') . ' - ' . $slotEnd->format('h:i A'),
                ];
            }

            $currentTime->addMinutes($slotInterval);
        }

        return response()->json([
            'available' => true,
            'date' => $targetDate->toDateString(),
            'formatted_date' => $targetDate->format('l, F j, Y'),
            'slots' => $slots,
        ]);
    }

    /**
     * Submit a public reservation
     */
    public function makeReservation(Request $request, int $shopId)
    {
        $shop = Shop::with(['hours', 'breaks', 'services'])->findOrFail($shopId);

        if (!$shop->isPubliclyVisible()) {
            return response()->json([
                'message' => 'Shop is not currently active for reservations.',
            ], 422);
        }

        $validated = $request->validate([
            'shop_service_id' => 'required|exists:shop_services,id',
            'customer_name' => 'required|string|max:100',
            'customer_email' => 'required|email|max:150',
            'customer_phone' => 'required|string|max:30',
            'reservation_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $service = $shop->services()->findOrFail($validated['shop_service_id']);
        $duration = $service->duration_minutes ?: 45;

        $targetDate = Carbon::parse($validated['reservation_date']);
        $startTime = Carbon::parse($validated['reservation_date'] . ' ' . $validated['start_time']);
        $endTime = $startTime->copy()->addMinutes($duration);

        // Verify shop hours
        $dayHours = $shop->hours()->where('day_of_week', $targetDate->dayOfWeek)->first();
        if (!$dayHours || $dayHours->is_closed) {
            return response()->json(['message' => 'Shop is closed on the selected date.'], 422);
        }

        $openTime = Carbon::parse($validated['reservation_date'] . ' ' . $dayHours->open_time);
        $closeTime = Carbon::parse($validated['reservation_date'] . ' ' . $dayHours->close_time);

        if ($startTime->lt($openTime) || $endTime->gt($closeTime)) {
            return response()->json(['message' => 'Reservation time is outside shop business hours.'], 422);
        }

        // Check break overlap
        $breaks = $shop->breaks()->where(function ($q) use ($targetDate) {
            $q->whereNull('day_of_week')->orWhere('day_of_week', $targetDate->dayOfWeek);
        })->get();

        foreach ($breaks as $b) {
            $bStart = Carbon::parse($validated['reservation_date'] . ' ' . $b->break_start);
            $bEnd = Carbon::parse($validated['reservation_date'] . ' ' . $b->break_end);
            if ($startTime->lt($bEnd) && $endTime->gt($bStart)) {
                return response()->json(['message' => 'The selected slot falls inside a shop break period.'], 422);
            }
        }

        // Prevent double booking
        $existingReservations = Reservation::where('shop_id', $shopId)
            ->whereDate('reservation_date', $targetDate->toDateString())
            ->whereNotIn('status', ['cancelled', 'no-show'])
            ->get();

        foreach ($existingReservations as $existing) {
            $eStartStr = is_string($existing->start_time) ? $existing->start_time : $existing->start_time->format('H:i:s');
            $eEndStr = is_string($existing->end_time) ? $existing->end_time : $existing->end_time->format('H:i:s');

            $existStart = Carbon::parse($validated['reservation_date'] . ' ' . $eStartStr);
            $existEnd = Carbon::parse($validated['reservation_date'] . ' ' . $eEndStr);

            if ($startTime->lt($existEnd) && $endTime->gt($existStart)) {
                return response()->json([
                    'message' => 'This time slot was just booked by another customer. Please select another slot.',
                ], 409);
            }
        }

        $reservation = Reservation::create([
            'shop_id' => $shopId,
            'shop_service_id' => $service->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'reservation_date' => $targetDate->toDateString(),
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'total_price' => $service->price,
            'status' => 'confirmed',
            'notes' => $validated['notes'] ?? null,
        ]);

        $reservation->load('service');

        // Notify shop owner
        if ($shop->user) {
            $shop->user->notifications()->create([
                'title' => 'New Appointment Reserved!',
                'message' => "{$validated['customer_name']} booked {$service->name} for " . $targetDate->format('M d, Y') . " at " . $startTime->format('h:i A'),
                'type' => 'success',
                'link' => '/owner/reservations',
            ]);
        }

        return response()->json([
            'message' => 'Reservation confirmed successfully!',
            'reservation' => $reservation,
            'shop_name' => $shop->name,
            'service_name' => $service->name,
            'formatted_time' => $startTime->format('h:i A') . ' - ' . $endTime->format('h:i A'),
            'formatted_date' => $targetDate->format('l, F j, Y'),
        ], 201);
    }
}
