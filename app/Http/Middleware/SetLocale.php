<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $sessionLocale = $request->is('admin', 'admin/*', 'login', 'logout', 'forgot-password', 'reset-password', 'reset-password/*', 'locale');
        $locale = $sessionLocale ? $request->session()->get('locale', 'fr') : ($request->is('en', 'en/*') ? 'en' : 'fr');
        app()->setLocale(in_array($locale, ['fr', 'en']) ? $locale : 'fr');

        return $next($request);
    }
}
