<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\FileType;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends Controller
{
    /**
     * Mencari file berdasarkan berbagai kriteria
     */
    public function search(Request $request)
    {
        $query = File::query();

        // Filter berdasarkan folder
        if ($request->has('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        // Filter berdasarkan kata kunci (nama file asli)
        if ($request->has('search') && !empty($request->search)) {
            $query->where('original_name', 'like', '%' . $request->search . '%');
        }

        // Filter berdasarkan tipe file
        if ($request->has('file_type_id')) {
            $query->where('file_type_id', $request->file_type_id);
        }

        // Filter berdasarkan tag
        if ($request->has('tags')) {
            $tagIds = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $query->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('tags.id', $tagIds);
            }, '=', count($tagIds)); // Harus memiliki semua tag yang diminta
        }

        // Pengurutan
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $files = $query->with(['fileType', 'folder', 'tags'])
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $files
        ]);
    }

    /**
     * Mengunggah file ke folder tertentu
     */
    public function store(Request $request, $folderId)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:20480', // Max 20MB
            'metadata' => 'nullable|json',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Dapatkan informasi folder
        $folder = Folder::findOrFail($folderId);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $mimeType = $uploadedFile->getMimeType();
        $size = $uploadedFile->getSize();

        // Buat nama file unik
        $uniqueName = time() . '_' . Str::random(8) . '.' . $extension;

        // Buat path relatif
        $relativePath = $folder->path . $folder->name . '/' . $uniqueName;

        // Tentukan file type berdasarkan ekstensi
        $fileType = FileType::where('extension', $extension)->first();

        // Simpan file ke storage
        $path = $uploadedFile->storeAs(
            'files/' . $folder->path . $folder->name,
            $originalName,
            'public'
        );

        // Buat record file di database
        $file = File::create([
            'name' => $uniqueName,
            'original_name' => $originalName,
            'folder_id' => $folderId,
            'file_type_id' => $fileType ? $fileType->id : null,
            'size' => $size,
            'path' => $relativePath,
            'mime_type' => $mimeType,
            'metadata' => $request->has('metadata') ? json_decode($request->metadata, true) : null,
        ]);

        // Tambahkan tag jika ada
        if ($request->has('tags')) {
            $file->tags()->sync($request->tags);
        }

        // Load relasi
        $file->load(['fileType', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'File berhasil diunggah',
            'data' => $file
        ], 201);
    }

    /**
     * Mendapatkan detail file
     */
    public function show($id)
    {
        $file = File::with(['fileType', 'folder', 'tags'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $file
        ]);
    }

    /**
     * Mengunduh file
     */
    public function download($id)
    {
        $file = File::findOrFail($id);

        $filePath = 'files/' . ltrim($file->path, '/'); // Remove "public/"

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found (Checked with Storage::disk("public"))'
            ], 404);
        }

        return Storage::disk('public')->download($filePath, $file->original_name, [
            'Content-Type' => $file->mime_type
        ]);
    }

    /**
     * Memindahkan file ke folder lain
     */
    public function move(Request $request, $id)
    {
        $file = File::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'folder_id' => 'required|exists:folders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Jika folder tujuan sama dengan folder saat ini, tidak perlu dipindahkan
        if ($file->folder_id == $request->folder_id) {
            return response()->json([
                'success' => true,
                'message' => 'File sudah berada di folder yang diminta',
                'data' => $file
            ]);
        }

        // Dapatkan informasi folder tujuan
        $targetFolder = Folder::findOrFail($request->folder_id);

        // Pindahkan file di storage
        $oldPath = 'public/files/' . $file->path;
        $fileName = basename($file->path);
        $newRelativePath = $targetFolder->path . $targetFolder->name . '/' . $fileName;
        $newPath = 'public/files/' . $newRelativePath;

        // Buat direktori tujuan jika belum ada
        $newDir = dirname($newPath);
        if (!Storage::exists($newDir)) {
            Storage::makeDirectory($newDir);
        }

        // Pindahkan file
        Storage::move($oldPath, $newPath);

        // Perbarui record di database
        $file->folder_id = $request->folder_id;
        $file->path = $newRelativePath;
        $file->save();

        // Load relasi
        $file->load(['fileType', 'folder', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'File berhasil dipindahkan',
            'data' => $file
        ]);
    }

    /**
     * Memperbarui metadata file
     */
    public function updateMetadata(Request $request, $id)
    {
        $file = File::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'metadata' => 'required|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $metadata = json_decode($request->metadata, true);
        $file->metadata = $metadata;
        $file->save();

        return response()->json([
            'success' => true,
            'message' => 'Metadata file berhasil diperbarui',
            'data' => $file
        ]);
    }

    /**
     * Menghapus file
     */
    public function destroy($id)
    {
        $file = File::findOrFail($id);

        // Hapus file dari storage
        $filePath = 'public/files/' . $file->path;
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        // Hapus record dari database
        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'File berhasil dihapus'
        ]);
    }
}
