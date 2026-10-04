<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\AdminAccounts;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('portfolio.admin_email');
        $password = config('portfolio.admin_password');
        if (! is_string($email) || ! $email || ! is_string($password) || ! $password) {
            throw new \RuntimeException('ADMIN_EMAIL et ADMIN_PASSWORD sont nécessaires pour ce bootstrap explicite.');
        }
        $existing = User::where('email', $email)->first();
        if ($existing) {
            $this->command?->warn('Compte existant préservé : mot de passe et permissions inchangés.');

            return;
        }
        app(AdminAccounts::class)->create('Espoir Mulela Mastolo', $email, $password);
        $this->command?->info('Compte administrateur créé. Retirez ADMIN_PASSWORD après le bootstrap.');
    }
}
