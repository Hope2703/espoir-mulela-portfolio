<?php

namespace App\Http\Responses;

class LogoutResponse extends \Laravel\Fortify\Http\Responses\LogoutResponse
{
    public function toResponse($request)
    {
        // Fortify already invalidated the authenticated session and rotated CSRF.
        $request->session()->put('locale', app()->getLocale());

        return parent::toResponse($request);
    }
}
