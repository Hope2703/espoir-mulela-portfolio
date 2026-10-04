<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'min:2', 'max:120'], 'email' => ['required', 'email', 'max:254'],
            'subject' => ['required', 'string', 'max:180'], 'message' => ['required', 'string', 'min:20', 'max:5000'], 'website' => ['nullable', 'string', 'max:200']];
    }
}
