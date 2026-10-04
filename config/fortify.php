<?php

use Laravel\Fortify\Features;

return [
    'guard' => 'web', 'passwords' => 'users', 'username' => 'email', 'email' => 'email', 'lowercase_usernames' => true,
    'home' => '/admin', 'prefix' => '', 'domain' => null, 'middleware' => ['web'],
    'limiters' => ['login' => 'login'], 'views' => true, 'features' => [Features::resetPasswords()],
];
