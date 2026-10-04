<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('admin/profile', ['user' => $request->user()->only('name', 'email')]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $sensitive = $request->input('email') !== $user->email || $request->filled('password');
        $valid = $request->validate(['name' => 'required|string|max:120', 'email' => ['required', 'email', 'max:254', Rule::unique('users')->ignore($user->id)], 'current_password' => [$sensitive ? 'required' : 'nullable', 'current_password:web'], 'password' => ['nullable', 'confirmed', Password::min(12)], 'password_confirmation' => 'nullable|string']);
        $user->name = $valid['name'];
        if ($user->email !== $valid['email']) {
            $user->email = $valid['email'];
            $user->email_verified_at = null;
        }
        if (! empty($valid['password'])) {
            $user->password = Hash::make($valid['password']);
            $user->setRememberToken(Str::random(60));
        }
        $user->save();
        $request->session()->regenerate();

        return back()->with('success', __('admin.Profile updated.'));
    }
}
