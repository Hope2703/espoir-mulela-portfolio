<?php

use App\Models\Experience;
use App\Models\Project;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

require __DIR__.'/../../vendor/autoload.php';

if (getenv('E2E_DISPOSABLE') !== 'true') {
    throw new RuntimeException('E2E_DISPOSABLE=true is required for this isolated local fixture.');
}

$root = dirname(__DIR__, 2);
$qaDirectory = $root.'/artifacts/privacy-qa';
$database = $qaDirectory.'/portfolio.sqlite';
$bootstrap = PHP_SAPI === 'cli' && ($argv[1] ?? '') === 'bootstrap';
if ($bootstrap) {
    if (! is_dir($qaDirectory)) {
        mkdir($qaDirectory, 0755, true);
    }
    if (file_exists($database)) {
        throw new RuntimeException('Refusing to overwrite the existing disposable fixture.');
    }
    fclose(fopen($database, 'x'));
}
if (! is_file($database)) {
    throw new RuntimeException('Bootstrap the disposable fixture first.');
}

// Override connections before Laravel loads .env; never use the daily database or disk.
foreach (['APP_ENV' => 'testing', 'APP_DEBUG' => 'false', 'APP_URL' => 'http://127.0.0.1:8002', 'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $database, 'DB_URL' => '', 'MAIL_MAILER' => 'array', 'SESSION_DRIVER' => 'array', 'CACHE_STORE' => 'array', 'SITE_INDEXABLE' => 'false'] as $key => $value) {
    putenv($key.'='.$value);
    $_ENV[$key] = $_SERVER[$key] = $value;
}
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
config(['filesystems.disks.public.root' => $qaDirectory.'/media', 'inertia.ssr.url' => 'http://127.0.0.1:13715', 'inertia.ssr.throw_on_error' => true]);

if ($bootstrap) {
    Artisan::call('migrate', ['--force' => true]);
    (new PortfolioContentSeeder)->run();
    $project = Project::where('confidential', true)->firstOrFail();
    foreach (['title', 'excerpt', 'description', 'context', 'role', 'seo_title', 'seo_description'] as $field) {
        $project->$field = ['fr' => 'PRIVATE-QA-'.$field.'-FR', 'en' => 'PRIVATE-QA-'.$field.'-EN'];
    }
    $project->content_key = 'PRIVATE-QA-CONTENT-KEY';
    $project->external_url = 'https://private-qa.example.test';
    $project->save();
    Storage::disk('public')->put('uploads/project/private-qa.txt', 'PRIVATE-QA-FILE');
    $project->media()->create(['path' => 'uploads/project/private-qa.txt', 'alt' => ['fr' => 'PRIVATE-QA-ALT-FR', 'en' => 'PRIVATE-QA-ALT-EN'], 'public_safe' => true, 'type' => 'cover', 'width' => 200, 'height' => 200, 'sort_order' => 99]);
    Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail()->update(['current' => true, 'description' => ['fr' => 'PRIVATE-QA-EXPERIENCE-FR', 'en' => 'PRIVATE-QA-EXPERIENCE-EN'], 'contributions' => [['fr' => 'PRIVATE-QA-CONTRIBUTION-FR', 'en' => 'PRIVATE-QA-CONTRIBUTION-EN']]]);
    echo "Disposable privacy fixture ready in artifacts/privacy-qa. No daily data changed.\n";

    return;
}

if (PHP_SAPI !== 'cli-server' || ! in_array($_SERVER['SERVER_NAME'] ?? '', ['127.0.0.1', 'localhost'], true)) {
    throw new RuntimeException('Local PHP server only.');
}
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
$normalized = strtolower(preg_replace('~/+~', '/', $uri));
if (! str_starts_with($normalized, '/storage/') && ! str_starts_with($normalized, '/images/projects/')) {
    $publicFile = realpath($root.'/public'.$uri);
    if ($publicFile && is_file($publicFile) && str_starts_with($publicFile, realpath($root.'/public').DIRECTORY_SEPARATOR)) {
        return false;
    }
}
$_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $root.'/public/index.php';
$app->handleRequest(Request::capture());
