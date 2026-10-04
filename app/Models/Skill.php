<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected function casts(): array
    {
        return ['visible' => 'boolean'];
    }

    protected $guarded = ['id'];
}
