<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    /**
     * Mendapatkan semua tag
     */
    public function index()
    {
        $tags = Tag::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }

    /**
     * Membuat tag baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:tags',
            'color' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $tag = Tag::create([
            'name' => $request->name,
            'color' => $request->color ?? '#3B82F6',
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dibuat',
            'data' => $tag
        ], 201);
    }

    /**
     * Mendapatkan detail tag
     */
    public function show($id)
    {
        $tag = Tag::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tag
        ]);
    }

    /**
     * Memperbarui tag
     */
    public function update(Request $request, $id)
    {
        $tag = Tag::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => [
                'string',
                'max:100',
                Rule::unique('tags')->ignore($id),
            ],
            'color' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $tag->update($request->only([
            'name',
            'color',
            'description',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil diperbarui',
            'data' => $tag
        ]);
    }

    /**
     * Menghapus tag
     */
    public function destroy($id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dihapus'
        ]);
    }

    /**
     * Mendapatkan tag untuk file tertentu
     */
    public function getFileTags($fileId)
    {
        $file = File::findOrFail($fileId);
        $tags = $file->tags;

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }

    /**
     * Menambahkan tag ke file
     */
    public function addTagToFile(Request $request, $fileId)
    {
        $validator = Validator::make($request->all(), [
            'tag_id' => 'required|exists:tags,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = File::findOrFail($fileId);

        // Periksa apakah tag sudah ada di file
        if ($file->tags()->where('tags.id', $request->tag_id)->exists()) {
            return response()->json([
                'success' => true,
                'message' => 'Tag sudah ada di file'
            ]);
        }

        // Tambahkan tag ke file
        $file->tags()->attach($request->tag_id);

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil ditambahkan ke file'
        ]);
    }

    /**
     * Menghapus tag dari file
     */
    public function removeTagFromFile($fileId, $tagId)
    {
        $file = File::findOrFail($fileId);
        $file->tags()->detach($tagId);

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dihapus dari file'
        ]);
    }

    /**
     * Mengatur tag untuk file (menggantikan semua tag yang ada)
     */
    public function setFileTags(Request $request, $fileId)
    {
        $validator = Validator::make($request->all(), [
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = File::findOrFail($fileId);
        $file->tags()->sync($request->tag_ids);

        return response()->json([
            'success' => true,
            'message' => 'Tag file berhasil diperbarui'
        ]);
    }
}
