<?php

use App\Models\Project;
use App\Models\User;
use App\Services\AdminAccounts;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\File;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (config('database.default') !== 'pgsql'
    || ! in_array(config('database.connections.pgsql.host'), ['127.0.0.1', 'localhost'], true)
    || config('database.connections.pgsql.database') !== 'espoir_portfolio_test'
    || (string) config('database.connections.pgsql.port') !== '55432') {
    throw new RuntimeException('Isolated local test database required.');
}
(new PortfolioContentSeeder)->run();
if (! User::where('email', config('portfolio.admin_email'))->exists()) {
    app(AdminAccounts::class)->create('Disposable QA administrator', config('portfolio.admin_email'), config('portfolio.admin_password'));
}
File::ensureDirectoryExists(base_path('artifacts'));
file_put_contents(base_path('artifacts/browser-credentials.json'), json_encode(['email' => config('portfolio.admin_email'), 'password' => config('portfolio.admin_password')]));
for ($i = 1; $i <= 8; $i++) {
    Project::firstOrCreate(['slug->fr' => 'automatic-pagination-'.$i], ['title' => ['fr' => 'Pagination automatique '.$i, 'en' => 'Automatic pagination '.$i], 'slug' => ['fr' => 'automatic-pagination-'.$i, 'en' => 'automatic-pagination-'.$i], 'excerpt' => ['fr' => 'Test isolé', 'en' => 'Isolated test'], 'description' => ['fr' => 'Test isolé', 'en' => 'Isolated test'], 'status' => 'draft', 'featured' => false, 'confidential' => false, 'sort_order' => 100 + $i]);
}
echo "Isolated browser fixtures ready.\n";
