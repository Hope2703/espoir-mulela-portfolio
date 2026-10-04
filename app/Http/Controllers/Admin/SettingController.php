<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\SocialLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('admin/settings', ['settings' => SiteSetting::whereIn('key', ['name', 'email', 'whatsapp', 'location', 'introduction', 'professional_title', 'seo_title', 'seo_description'])->pluck('value', 'key')]);
    }

    public function update(Request $r)
    {
        $rules = ['name' => 'required|string|max:120', 'email' => 'required|email|max:254', 'whatsapp' => 'required|regex:/^[0-9]{8,15}$/'];
        foreach (['location', 'introduction', 'professional_title', 'seo_title', 'seo_description'] as $field) {
            $rules[$field] = 'required|array:fr,en';
            foreach (['fr', 'en'] as $l) {
                $rules[$field.'.'.$l] = 'required|string|max:3000';
            }
        }
        $valid = $r->validate($rules);
        DB::transaction(function () use ($valid) {
            foreach ($valid as $key => $value) {
                SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
            }SocialLink::updateOrCreate(['platform' => 'Email'], ['url' => 'mailto:'.$valid['email']]);
            SocialLink::updateOrCreate(['platform' => 'WhatsApp'], ['url' => 'https://wa.me/'.$valid['whatsapp']]);
        });

        return back()->with('success', __('ui.saved'));
    }
}
