<?php

use App\Models\Experience;
use App\Services\AdminAccounts;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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

Artisan::command('portfolio:protect-taprinella {--force : Autoriser une exécution en production}', function () {
    if (app()->isProduction() && ! $this->option('force')) {
        $this->error('En production, confirmer explicitement l’exécution avec --force.');

        return 1;
    }

    return DB::transaction(function () {
        $matches = Experience::whereIn(DB::raw('LOWER(TRIM(organization))'), config('portfolio.taprinella_experience_organizations'))->lockForUpdate()->limit(2)->get();
        if ($matches->count() !== 1) {
            $this->error('Une seule expérience Taprinella doit être identifiée.');

            return 1;
        }

        $experience = $matches->first();
        $experience->confidential = true;
        $approved = Experience::approvedTaprinellaResponsibilities();
        $stored = $experience->public_description;
        if (! is_array($stored) || count($stored) !== count($approved) || ($stored['fr'] ?? null) !== $approved['fr'] || ($stored['en'] ?? null) !== $approved['en']) {
            $experience->public_description = $approved;
        }
        if ($experience->isDirty()) {
            $experience->save();
            $this->info('Responsabilités publiques Taprinella enregistrées.');
        } else {
            $this->info('Responsabilités publiques Taprinella déjà conformes.');
        }

        return 0;
    });
})->purpose('Appliquer uniquement la présentation publique approuvée et la confidentialité à l’expérience Taprinella.');
