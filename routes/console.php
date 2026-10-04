<?php

use App\Services\AdminAccounts;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\ValidationException;

Artisan::command('admin:create', function () {
    $name = $this->ask('Nom', 'Espoir Mulela Mastolo');
    $email = $this->ask('Email');
    $password = $this->secret('Mot de passe (12 caractères minimum)');
    $confirmation = $this->secret('Confirmer le mot de passe');
    if ($password !== $confirmation) {
        $this->error('La confirmation ne correspond pas.');

        return 1;
    }
    try {
        app(AdminAccounts::class)->create($name, $email, $password);
    } catch (ValidationException $e) {
        foreach ($e->errors() as $messages) {
            foreach ($messages as $message) {
                $this->error($message);
            }
        }

return 1;
    }
    $this->info('Administrateur créé.');

    return 0;
})->purpose('Créer explicitement un administrateur avec un mot de passe saisi de façon confidentielle.');
