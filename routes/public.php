<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\SeoController;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\TrackPageView;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::redirect('/projets/maliflow', '/projets/maliyaflow', 301);
Route::redirect('/en/projects/maliflow', '/en/projects/maliyaflow', 301);
Route::redirect('/projets/maliya-flow', '/projets/maliyaflow', 301);
Route::redirect('/en/projects/maliya-flow', '/en/projects/maliyaflow', 301);
Route::redirect('/projets/association-web-platform', '/projets/libiki-lya-kongo', 301);
Route::redirect('/en/projects/association-web-platform', '/en/projects/libiki-lya-kongo', 301);

foreach (['fr' => '', 'en' => 'en'] as $locale => $prefix) {
    Route::prefix($prefix)->name('public.'.$locale.'.')->group(function () use ($locale) {
        $segments = $locale === 'fr' ? ['home' => '', 'projects' => 'projets', 'about' => 'a-propos', 'activities' => 'activites', 'publications' => 'publications', 'contact' => 'contact']
            : ['home' => '', 'projects' => 'projects', 'about' => 'about', 'activities' => 'activities', 'publications' => 'publications', 'contact' => 'contact'];
        foreach ($segments as $key => $segment) {
            Route::get('/'.$segment, PublicPageController::class)->defaults('page', $key)->name($key);
            if (in_array($key, ['projects', 'activities', 'publications'])) {
                Route::get('/'.$segment.'/{slug}', [PublicPageController::class, 'show'])->defaults('page', $key)->name($key.'.show');
            }
        }
        Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');
    });
}
// The XML endpoint does not need browser sessions, cookies or Inertia negotiation.
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap')->withoutMiddleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    ShareErrorsFromSession::class,
    PreventRequestForgery::class,
    SetLocale::class,
    HandleInertiaRequests::class,
    TrackPageView::class,
]);
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('/og/{locale}.png', [SeoController::class, 'image'])->where('locale', 'fr|en');
