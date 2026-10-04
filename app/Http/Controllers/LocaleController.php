<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function __invoke(Request $request)
    {
        $valid = $request->validate(['locale' => 'required|in:fr,en']);
        $request->session()->put('locale', $valid['locale']);
        app()->setLocale($valid['locale']);

        return back(303);
    }
}
