<?php

// Keep artisan serve consistent with the Apache and Nginx media gate.
$publicPath = __DIR__.'/public';
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
$normalizedUri = strtolower(preg_replace('~/+~', '/', $uri));
$protectedMedia = str_starts_with($normalizedUri, '/storage/') || str_starts_with($normalizedUri, '/images/projects/');

if ($uri !== '/' && file_exists($publicPath.$uri) && ! $protectedMedia) {
    return false;
}

$_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $publicPath.'/index.php';
require_once $publicPath.'/index.php';
