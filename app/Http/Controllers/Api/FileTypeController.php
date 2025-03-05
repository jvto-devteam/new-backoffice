<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FileType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FileTypeController extends Controller
{
    /**
     * Mendapatkan semua tipe file
     */
    public function index()
    {
        $fileTypes = FileType::orderBy('extension')->get();

        return response()->json([
            'success' => true,
            'data' => $fileTypes
        ]);
    }

    /**
     * Membuat tipe file baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'extension' => 'required|string|max:20|unique:file_types',
            'icon_name' => 'required|string|max:100',
            'icon_color' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $fileType = FileType::create($request->only([
            'extension',
            'icon_name',
            'icon_color',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tipe file berhasil dibuat',
            'data' => $fileType
        ], 201);
    }

    /**
     * Mendapatkan detail tipe file
     */
    public function show($id)
    {
        $fileType = FileType::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $fileType
        ]);
    }

    /**
     * Memperbarui tipe file
     */
    public function update(Request $request, $id)
    {
        $fileType = FileType::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'extension' => [
                'string',
                'max:20',
                Rule::unique('file_types')->ignore($id),
            ],
            'icon_name' => 'string|max:100',
            'icon_color' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $fileType->update($request->only([
            'extension',
            'icon_name',
            'icon_color',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tipe file berhasil diperbarui',
            'data' => $fileType
        ]);
    }

    /**
     * Menghapus tipe file
     */
    public function destroy($id)
    {
        $fileType = FileType::findOrFail($id);

        // Periksa apakah tipe file sedang digunakan
        $fileCount = $fileType->files()->count();
        if ($fileCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe file sedang digunakan oleh ' . $fileCount . ' file dan tidak dapat dihapus'
            ], 400);
        }

        $fileType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe file berhasil dihapus'
        ]);
    }
}
