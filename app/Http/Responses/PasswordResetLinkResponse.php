<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;

class PasswordResetLinkResponse implements FailedPasswordResetLinkRequestResponse, SuccessfulPasswordResetLinkRequestResponse
{
    public function __construct(public ?string $status = null) {}

    public function toResponse($request)
    {
        $message = __('passwords.sent');

        return $request->wantsJson() ? response()->json(['message' => $message]) : back()->with('status', $message);
    }
}
