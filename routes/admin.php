<?php

use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\RecordController;
use App\Http\Controllers\Admin\SettingController;
use App\Services\PortfolioData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::post('/markdown-preview', function (Request $request) {
        $valid = $request->validate(['body' => 'required|string|max:200000']);

        return response()->json(['html' => app(PortfolioData::class)->markdown($valid['body'])]);
    })->name('markdown.preview');
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    foreach (['projects', 'activities', 'publications'] as $type) {
        Route::get('/'.$type, [ContentController::class, 'index'])->defaults('content_type', $type)->name($type.'.index');
        Route::get('/'.$type.'/create', [ContentController::class, 'create'])->defaults('content_type', $type)->name($type.'.create');
        Route::post('/'.$type, [ContentController::class, 'store'])->defaults('content_type', $type)->name($type.'.store');
        Route::get('/'.$type.'/{id}/edit', [ContentController::class, 'edit'])->defaults('content_type', $type)->name($type.'.edit');
        Route::put('/'.$type.'/{id}', [ContentController::class, 'update'])->defaults('content_type', $type)->name($type.'.update');
        Route::delete('/'.$type.'/{id}', [ContentController::class, 'destroy'])->defaults('content_type', $type)->name($type.'.destroy');
        Route::get('/'.$type.'/{id}/preview', [ContentController::class, 'preview'])->defaults('content_type', $type)->name($type.'.preview');
    }
    foreach (['experiences', 'education', 'certifications', 'skill-categories', 'skills', 'social-links'] as $module) {
        Route::get('/'.$module, [RecordController::class, 'index'])->defaults('module', $module)->name($module.'.index');
        Route::get('/'.$module.'/create', [RecordController::class, 'create'])->defaults('module', $module)->name($module.'.create');
        Route::post('/'.$module, [RecordController::class, 'store'])->defaults('module', $module)->name($module.'.store');
        Route::get('/'.$module.'/{id}/edit', [RecordController::class, 'edit'])->defaults('module', $module)->name($module.'.edit');
        Route::put('/'.$module.'/{id}', [RecordController::class, 'update'])->defaults('module', $module)->name($module.'.update');
        Route::delete('/'.$module.'/{id}', [RecordController::class, 'destroy'])->defaults('module', $module)->name($module.'.destroy');
    }
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::delete('/messages/{id}', [MessageController::class, 'destroy'])->name('messages.destroy');
    Route::patch('/{type}/{id}/archive', [ContentController::class, 'archive'])->whereIn('type', ['projects', 'activities', 'publications'])->name('content.archive');
    Route::get('/messages/{id}', [MessageController::class, 'show'])->name('messages.show');
    Route::patch('/messages/{id}', [MessageController::class, 'update'])->name('messages.update');
    Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    Route::post('/media', [MediaController::class, 'store'])->name('media.store');
    Route::put('/media/{type}/{id}', [MediaController::class, 'update'])->where('type', 'project|activity')->name('media.update');
    Route::delete('/media/{type}/{id}', [MediaController::class, 'destroy'])->where('type', 'project|activity')->name('media.destroy');
});
