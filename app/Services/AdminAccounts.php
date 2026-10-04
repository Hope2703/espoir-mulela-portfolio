<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAccounts
{
    public function create(string $name, string $email, string $password): User
    {
        $data = Validator::make(compact('name', 'email', 'password'), ['name' => 'required|string|max:120', 'email' => 'required|email|max:254|unique:users,email', 'password' => 'required|string|min:12'])->validate();
        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password'])]);
        $user->is_admin = true;
        $user->save();

        return $user;
    }
}
