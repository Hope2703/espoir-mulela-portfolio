<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityMedia extends Model
{
    protected $guarded = ['id'];

    protected $table = 'activity_media';

    protected function casts(): array
    {
        return ['alt' => 'array'];
    }

    public function owner()
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }
}
