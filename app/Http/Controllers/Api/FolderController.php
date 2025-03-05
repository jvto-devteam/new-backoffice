<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\FolderType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FolderController extends Controller
{
    /**
     * Mendapatkan daftar folder
     */
    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');
        $query = Folder::query();

        if ($parentId) {
            $query->where('parent_id', $parentId);
        } else {
            $query->whereNull('parent_id');
        }

        $folders = $query->with(['folderType', 'parent'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $folders
        ]);
    }

    /**
     * Mendapatkan struktur folder secara hierarkis
     */
    public function tree()
    {
        $rootFolders = Folder::whereNull('parent_id')
            ->with(['folderType', 'children.folderType'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rootFolders
        ]);
    }

    /**
     * Mendapatkan isi folder (subfolder dan file)
     */
    public function contents($id)
    {
        $folder = Folder::findOrFail($id);

        $subfolders = Folder::where('parent_id', $id)
            ->with('folderType')
            ->orderBy('name')
            ->get();

        $files = $folder->files()
            ->with(['fileType', 'tags'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'folder' => $folder,
                'subfolders' => $subfolders,
                'files' => $files
            ]
        ]);
    }

    /**
     * Membuat folder baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('folders')->where(function ($query) use ($request) {
                    return $query->where('parent_id', $request->parent_id);
                }),
            ],
            'parent_id' => 'nullable|exists:folders,id',
            'folder_type_id' => 'nullable|exists:folder_types,id',
            'is_system_folder' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tentukan path folder
        $path = '/';
        if ($request->parent_id) {
            $parentFolder = Folder::findOrFail($request->parent_id);
            $path = $parentFolder->path . $parentFolder->name . '/';
        }

        $folder = Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'folder_type_id' => $request->folder_type_id,
            'path' => $path,
            'is_system_folder' => $request->is_system_folder ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Folder berhasil dibuat',
            'data' => $folder
        ], 201);
    }

    /**
     * Mendapatkan detail folder
     */
    public function show($id)
    {
        $folder = Folder::with(['folderType', 'parent'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $folder
        ]);
    }

    /**
     * Memperbarui folder
     */
    public function update(Request $request, $id)
    {
        $folder = Folder::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => [
                'string',
                'max:255',
                Rule::unique('folders')->where(function ($query) use ($folder, $request) {
                    return $query->where('parent_id', $folder->parent_id)
                        ->where('id', '!=', $folder->id);
                }),
            ],
            'folder_type_id' => 'nullable|exists:folder_types,id',
            'is_system_folder' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $folder->update($request->only([
            'name',
            'folder_type_id',
            'is_system_folder',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Folder berhasil diperbarui',
            'data' => $folder
        ]);
    }

    /**
     * Memindahkan folder
     */
    public function move(Request $request, $id)
    {
        $folder = Folder::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'parent_id' => 'nullable|exists:folders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Pastikan tidak memindahkan ke folder sendiri atau ke subfolder
        if ($request->parent_id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat memindahkan folder ke dirinya sendiri'
            ], 400);
        }

        // Periksa apakah target adalah subfolder dari folder ini
        if ($request->parent_id) {
            $targetFolder = Folder::findOrFail($request->parent_id);
            $ancestorIds = collect();
            $ancestor = $targetFolder;

            while ($ancestor->parent_id) {
                $ancestorIds->push($ancestor->parent_id);
                $ancestor = $ancestor->parent;
            }

            if ($ancestorIds->contains($id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat memindahkan folder ke salah satu subfoldernya'
                ], 400);
            }
        }

        // Tentukan path baru
        $newPath = '/';
        if ($request->parent_id) {
            $parentFolder = Folder::findOrFail($request->parent_id);
            $newPath = $parentFolder->path . $parentFolder->name . '/';
        }

        // Simpan path lama untuk memperbarui path subfolder dan file
        $oldPath = $folder->path . $folder->name . '/';
        $newFullPath = $newPath . $folder->name . '/';

        // Perbarui folder
        $folder->parent_id = $request->parent_id;
        $folder->path = $newPath;
        $folder->save();

        // Perbarui path semua subfolder
        $subfolders = Folder::where('path', 'like', $oldPath . '%')->get();
        foreach ($subfolders as $subfolder) {
            $subfolder->path = str_replace($oldPath, $newFullPath, $subfolder->path);
            $subfolder->save();
        }

        // Perbarui path semua file di folder dan subfoldernya
        $allFolderIds = $folder->getAllChildren()->pluck('id')->push($folder->id);
        $files = \App\Models\File::whereIn('folder_id', $allFolderIds)->get();

        foreach ($files as $file) {
            $file->path = str_replace($oldPath, $newFullPath, $file->path);
            $file->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Folder berhasil dipindahkan',
            'data' => $folder
        ]);
    }

    /**
     * Menghapus folder
     */
    public function destroy($id)
    {
        $folder = Folder::findOrFail($id);

        if ($folder->is_system_folder) {
            return response()->json([
                'success' => false,
                'message' => 'Folder sistem tidak dapat dihapus'
            ], 400);
        }

        // Hapus semua file di dalam folder ini
        // File di subfolder akan dihapus otomatis karena cascade
        $folder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Folder berhasil dihapus'
        ]);
    }
}
