<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicShopController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {
    Route::get('/map-shops', [PublicShopController::class, 'getMapShops']);
    Route::get('/shop/{slug}', [PublicShopController::class, 'getShopBySlug']);
    Route::post('/shop/{id}/reviews', [PublicShopController::class, 'submitReview']);
    Route::post('/report', [PublicShopController::class, 'reportContent']);
    Route::get('/settings', [PublicShopController::class, 'getPublicSettings']);
    
    // Reservations
    Route::get('/shop/{id}/available-slots', [ReservationController::class, 'getAvailableSlots']);
    Route::post('/shop/{id}/reserve', [ReservationController::class, 'makeReservation']);
    
    // Stored media streamer
    Route::get('/media/{folder}/{filename}', [PublicShopController::class, 'getMedia']);
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

/*
|--------------------------------------------------------------------------
| Authenticated Notifications
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications/read/{id?}', [NotificationController::class, 'markAsRead']);
});

// Fallback for session auth
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications/read/{id?}', [NotificationController::class, 'markAsRead']);
});

/*
|--------------------------------------------------------------------------
| Owner Routes (Role: shop_owner, super_admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:shop_owner'])->prefix('owner')->group(function () {
    Route::get('/dashboard', [OwnerController::class, 'getDashboard']);
    Route::get('/profile', [OwnerController::class, 'getProfile']);
    Route::post('/profile', [OwnerController::class, 'updateProfile']);
    Route::post('/location', [OwnerController::class, 'updateLocation']);
    
    // Services
    Route::get('/services', [OwnerController::class, 'getServices']);
    Route::post('/services/{id?}', [OwnerController::class, 'saveService']);
    Route::delete('/services/{id}', [OwnerController::class, 'deleteService']);
    
    // Business Hours
    Route::get('/hours', [OwnerController::class, 'getHours']);
    Route::post('/hours', [OwnerController::class, 'updateHours']);
    
    // Portfolio & Photos
    Route::get('/media', [OwnerController::class, 'getPhotosAndPortfolio']);
    Route::post('/portfolio/{id?}', [OwnerController::class, 'savePortfolioItem']);
    Route::delete('/portfolio/{id}', [OwnerController::class, 'deletePortfolioItem']);
    Route::post('/photos', [OwnerController::class, 'saveGalleryPhoto']);
    Route::delete('/photos/{id}', [OwnerController::class, 'deleteGalleryPhoto']);
    
    // Posts / CMS
    Route::get('/posts', [OwnerController::class, 'getPosts']);
    Route::post('/posts/{id?}', [OwnerController::class, 'savePost']);
    Route::delete('/posts/{id}', [OwnerController::class, 'deletePost']);
    
    // Reservations
    Route::get('/reservations', [OwnerController::class, 'getReservations']);
    Route::post('/reservations/{id}/status', [OwnerController::class, 'updateReservationStatus']);
    
    // Reviews
    Route::get('/reviews', [OwnerController::class, 'getReviews']);
    Route::post('/reviews/{id}/reply', [OwnerController::class, 'replyToReview']);
    
    // Subscription & Billing
    Route::get('/billing', [OwnerController::class, 'getBillingOverview']);
    Route::post('/billing/payment', [OwnerController::class, 'submitPayment']);
    Route::get('/billing/payment-proof/{filename}', [OwnerController::class, 'viewPaymentProof']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Role: admin, super_admin, moderator, payment_admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'getDashboard']);
    
    // Payments
    Route::get('/payments', [AdminController::class, 'getPayments']);
    Route::post('/payments/{id}/verify', [AdminController::class, 'verifyPayment']);
    
    // Shops
    Route::get('/shops', [AdminController::class, 'getShops']);
    Route::post('/shops/{id}/status', [AdminController::class, 'updateShopStatus']);
    
    // Map Locations
    Route::get('/locations', [AdminController::class, 'getMapLocations']);
    Route::post('/locations/{id}/toggle-marker', [AdminController::class, 'toggleMarkerVisibility']);
    
    // Users
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::post('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
    
    // Moderation & Reports
    Route::get('/reports', [AdminController::class, 'getReports']);
    Route::post('/reports/{id}/resolve', [AdminController::class, 'resolveReport']);
    
    // Billing Settings
    Route::get('/billing-settings', [AdminController::class, 'getBillingSettings']);
    Route::post('/billing-settings', [AdminController::class, 'updateBillingSettings']);
    
    // Logs & Invoices & Reservations
    Route::get('/logs', [AdminController::class, 'getActivityLogs']);
    Route::get('/invoices', [AdminController::class, 'getInvoices']);
    Route::get('/reservations', [AdminController::class, 'getReservations']);
});
