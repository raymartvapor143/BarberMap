<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shop;
use App\Models\BillingSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if (!$user) {
            return response()->json(['user' => null]);
        }

        $user->load(['shop.location', 'shop.activeSubscription', 'shop.subscriptions', 'shop.payments']);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials, true)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $request->session()->regenerate();
        /** @var \App\Models\User $user */
        $user = $request->user() ?? Auth::user();
        $user->load(['shop.location', 'shop.activeSubscription']);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:30',
            'role' => 'required|string|in:customer,shop_owner',
            // Shop Details (if shop_owner)
            'shop_name' => 'required_if:role,shop_owner|nullable|string|max:255',
            'shop_address' => 'required_if:role,shop_owner|nullable|string|max:255',
            'shop_city' => 'nullable|string|max:100',
            'shop_barangay' => 'nullable|string|max:100',
            'shop_description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'status' => 'active',
        ]);

        if ($validated['role'] === 'shop_owner') {
            $shop = Shop::create([
                'user_id' => $user->id,
                'name' => $validated['shop_name'],
                'tagline' => null,
                'description' => $validated['shop_description'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'address' => $validated['shop_address'] ?? '',
                'city' => $validated['shop_city'] ?? '',
                'barangay' => $validated['shop_barangay'] ?? null,
                'cover_url' => null,
                'logo_url' => null,
                'status' => 'pending_payment',
                'starting_price' => 0.00,
            ]);

            // If user explicitly provided coordinates during registration, save them, otherwise leave clean for owner to configure
            if (!empty($validated['latitude']) && !empty($validated['longitude'])) {
                $shop->location()->create([
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'formatted_address' => $shop->address . ($shop->city ? ', ' . $shop->city : ''),
                    'is_marker_visible' => true,
                ]);
            }

            // Create default notification
            $user->notifications()->create([
                'title' => 'Welcome to BarberMap!',
                'message' => 'Your shop ' . $shop->name . ' is registered. Please set up your services, exact map location, and complete subscription payment to go live.',
                'type' => 'info',
                'link' => '/owner/profile',
            ]);
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        $user->load(['shop.location', 'shop.activeSubscription']);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
