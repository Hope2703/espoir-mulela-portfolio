<?php

use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;

require __DIR__.'/public.php';
require __DIR__.'/admin.php';

Route::post('/locale', LocaleController::class)->name('locale.update');
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware(['guest', 'throttle:password-reset'])->name('password.email');
