<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmail extends BaseVerifyEmail
{
    protected function buildMailMessage($url)
    {
        return (new MailMessage)->subject(__('mail.verify_subject'))->view('mail.verify-email', ['url' => $url]);
    }
}
