<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLog extends Model {
    protected $fillable = ['user_id', 'log'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
