<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Support\Str;

class TrackPageView
{
    public static function visitor($request): string
    {
        if (! $request->session()->has('analytics_visitor')) {
            $request->session()->put('analytics_visitor', Str::random(32));
        }

        return hash_hmac('sha256', $request->session()->get('analytics_visitor'), config('app.key'));
    }

    public function handle($request, Closure $next)
    {
        $response = $next($request);
        if ($request->isMethod('GET') && $response->getStatusCode() === 200 && str_starts_with($request->route()?->getName() ?? '', 'public.')
            && ! $request->user()?->is_admin && ! preg_match('/bot|crawler|spider|preview|headless/i', $request->userAgent() ?? '')
            && ! $request->header('Purpose') && ! $request->header('X-Inertia-Prefetch')) {
            PageView::create(['visitor_hash' => self::visitor($request), 'path' => '/'.ltrim($request->path(), '/'),
                'viewable_type' => $request->attributes->get('viewable_type'), 'viewable_id' => $request->attributes->get('viewable_id'),
                'created_at' => now()]);
        }

        return $response;
    }
}
