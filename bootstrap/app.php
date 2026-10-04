<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\TrackPageView;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [SetLocale::class, HandleInertiaRequests::class, TrackPageView::class, SecurityHeaders::class]);
        $middleware->alias(['admin' => EnsureAdmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, $exception, Request $request) {
            $status = $response->getStatusCode();
            if (in_array($status, [500, 503]) && ! $request->expectsJson() && ! config('app.debug')) {
                return response()->view('errors.fallback', ['status' => $status], $status);
            }
            if (in_array($status, [403, 404, 419, 500, 503]) && (! $request->expectsJson()) && (! config('app.debug') || $status !== 500)) {
                $private = $request->is('admin', 'admin/*', 'login', 'logout', 'forgot-password', 'reset-password', 'reset-password/*', 'locale');
                $locale = $private && $request->hasSession() ? $request->session()->get('locale', 'fr') : ($request->is('en', 'en/*') ? 'en' : 'fr');
                app()->setLocale(in_array($locale, ['fr', 'en']) ? $locale : 'fr');

                return Inertia::render('errors/show', ['status' => $status, 'copy' => __('errors')])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
