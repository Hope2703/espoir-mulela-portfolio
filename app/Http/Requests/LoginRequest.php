<?php

namespace App\Http\Requests;

class LoginRequest extends \Laravel\Fortify\Http\Requests\LoginRequest
{
    public function rules(): array
    {
        return ['email' => 'required|string|email|max:254', 'password' => 'required|string', 'remember' => 'sometimes|boolean'];
    }
}
