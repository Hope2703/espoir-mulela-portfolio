<?php

return ['admin_email' => env('ADMIN_EMAIL'), 'admin_password' => env('ADMIN_PASSWORD'), 'send_confirmation' => (bool) env('CONTACT_SEND_CONFIRMATION', false), 'indexable' => (bool) env('SITE_INDEXABLE', false)];
