<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        return (new MailMessage)->subject(__('mail.reset_subject'))->view('mail.reset-password', ['url' => $this->resetUrl($notifiable), 'minutes' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]);
    }
}
