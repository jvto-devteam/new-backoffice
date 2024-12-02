<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingDocument extends Model
{
    use HasFactory;

    public function attachmentType()
    {
        return $this->belongsTo(AttachmentType::class, 'attachment_type_id');
    }

}
