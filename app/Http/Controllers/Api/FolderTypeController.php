<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FolderType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FolderTypeController extends Controller
{
    /**
     * Mendapatkan semua tipe folder
     */
    public function index()
    {
        $folderTypes = FolderType::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $folderTypes
        ]);
    }

    /**
     * Membuat tipe folder baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:folder_types',
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

        $folderType = FolderType::create($request->only([
            'name',
            'icon_name',
            'icon_color',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tipe folder berhasil dibuat',
            'data' => $folderType
        ], 201);
    }

    /**
     * Mendapatkan detail tipe folder
     */
    public function show($id)
    {
        $folderType = FolderType::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $folderType
        ]);
    }

    /**
     * Memperbarui tipe folder
     */
    public function update(Request $request, $id)
    {
        $folderType = FolderType::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => [
                'string',
                'max:100',
                Rule::unique('folder_types')->ignore($id),
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

        $folderType->update($request->only([
            'name',
            'icon_name',
            'icon_color',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tipe folder berhasil diperbarui',
            'data' => $folderType
        ]);
    }

    /**
     * Menghapus tipe folder
     */
    public function destroy($id)
    {
        $folderType = FolderType::findOrFail($id);

        // Periksa apakah tipe folder sedang digunakan
        $folderCount = $folderType->folders()->count();
        if ($folderCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe folder sedang digunakan oleh ' . $folderCount . ' folder dan tidak dapat dihapus'
            ], 400);
        }

        $folderType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe folder berhasil dihapus'
        ]);
    }
}
