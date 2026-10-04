<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\LogoutResponse;
use App\Http\Responses\PasswordResetLinkResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(\Laravel\Fortify\Http\Requests\LoginRequest::class, LoginRequest::class);
        $this->app->bind(\Laravel\Fortify\Contracts\LogoutResponse::class, LogoutResponse::class);
        $this->app->bind(SuccessfulPasswordResetLinkRequestResponse::class, PasswordResetLinkResponse::class);
        $this->app->bind(FailedPasswordResetLinkRequestResponse::class, PasswordResetLinkResponse::class);
    }

    public function boot(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::loginView(fn () => Inertia::render('auth/login'));
        Fortify::requestPasswordResetLinkView(fn () => Inertia::render('auth/forgot-password'));
        Fortify::resetPasswordView(fn (Request $r) => Inertia::render('auth/reset-password', ['email' => $r->email, 'token' => $r->route('token')]));
        RateLimiter::for('login', fn (Request $r) => Limit::perMinute(5)->by(Str::lower((string) $r->input('email')).'|'.$r->ip())->response(function (Request $request, array $headers) {
            $seconds = (int) ($headers['Retry-After'] ?? 60);
            $message = __('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)]);

            return $request->expectsJson()
                ? response()->json(['message' => $message, 'errors' => ['email' => [$message]]], 429, $headers)
                : back(303, $headers)->withErrors(['email' => $message])->withInput($request->only('email', 'remember'));
        }));
        RateLimiter::for('contact', fn (Request $r) => [Limit::perMinute(3)->by($r->ip()), Limit::perHour(10)->by($r->ip())]);
        RateLimiter::for('password-reset', fn (Request $r) => Limit::perMinute(5)->by($r->ip())->response(fn (Request $request, array $headers) => $request->expectsJson()
            ? response()->json(['message' => __('passwords.sent')], 429, $headers)
            : back(303, $headers)->with('status', __('passwords.sent'))));
    }
}
