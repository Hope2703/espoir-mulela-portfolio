<?php

namespace App\Console\Commands;

use App\Services\PortfolioEditorial;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class RefreshPortfolioEditorial extends Command
{
    use ConfirmableTrait;

    protected $signature = 'portfolio:refresh-editorial {--force : Exécuter sans confirmation en production}';

    protected $description = 'Mettre à jour les contenus éditoriaux validés du parcours et de la formation Kadea Academy.';

    public function handle(PortfolioEditorial $editorial): int
    {
        if (! $this->confirmToProceed()) {
            return self::FAILURE;
        }

        $this->info($editorial->refresh().' enregistrement(s) mis à jour.');

        return self::SUCCESS;
    }
}
