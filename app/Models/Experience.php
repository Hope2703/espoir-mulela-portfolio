<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasTranslations;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'description' => 'array', 'public_description' => 'array', 'role' => 'array', 'contributions' => 'array', 'current' => 'boolean', 'confidential' => 'boolean'];
    }

    public function hasConfidentialDetails(): bool
    {
        // Protect the existing institutional experience until its flag is reviewed.
        // An explicit admin choice takes precedence; no stored content is rewritten.
        return $this->confidential ?? in_array(mb_strtolower(trim($this->organization ?? '')), config('portfolio.confidential_experience_organizations'), true);
    }
}
