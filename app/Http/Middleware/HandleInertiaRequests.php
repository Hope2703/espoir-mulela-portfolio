<?php

namespace App\Http\Middleware;

use App\Services\PortfolioData;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [...parent::share($request), 'locale' => fn () => app()->getLocale(), 'ui' => fn () => __('ui'),
            'copy' => fn () => __('portfolio'), 'adminCopy' => fn () => __('admin'), 'authCopy' => fn () => __('auth-ui'), 'authFailure' => fn () => __('auth.failed'), 'status' => fn () => $request->session()->get('status'), 'contactCopy' => fn () => __('contact'),
            'auth' => ['user' => $request->user()?->only('id', 'name', 'email', 'is_admin')],
            'notificationId' => fn () => (string) Str::uuid(),
            'flash' => ['success' => fn () => $request->session()->get('success'), 'error' => fn () => $request->session()->get('error'), 'info' => fn () => $request->session()->get('info')],
            'portfolio' => fn () => app(PortfolioData::class)->profile(),
        ];
    }
}
