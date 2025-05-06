<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Terstruktur dari PDF</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding-top: 50px;
        }
        .card {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .result-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .text-content {
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container result-container">
        <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h3 class="m-0">Data Terstruktur dari PDF</h3>
                <a href="{{ route('pdf-extractor.index') }}" class="btn btn-light btn-sm">Kembali</a>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h5>File: {{ $fileName }}</h5>
                    <a href="{{ Storage::url($filePath) }}" target="_blank" class="btn btn-sm btn-outline-primary">Lihat PDF</a>
                </div>
                
                <h5>Data yang Diekstrak:</h5>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <tbody>
                            @foreach($structuredData as $key => $value)
                                <tr>
                                    <th style="width: 30%">{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                                    <td>{{ $value }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <h5>JSON Data:</h5>
                <div class="text-content mb-4">
                    <pre>{{ json_encode($structuredData, JSON_PRETTY_PRINT) }}</pre>
                </div>
                
                <h5>Teks Mentah:</h5>
                <div class="text-content">
                    {{ $extractedText }}
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="copyJSON()">Salin JSON</button>
                    <button class="btn btn-outline-primary" onclick="copyText()">Salin Teks Mentah</button>
                    <a href="{{ route('pdf-extractor.index') }}" class="btn btn-outline-secondary">Upload File Lain</a>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function copyJSON() {
            const jsonContent = document.querySelector('.text-content pre').textContent;
            navigator.clipboard.writeText(jsonContent).then(() => {
                alert('JSON berhasil disalin!');
            }).catch(err => {
                console.error('Gagal menyalin JSON: ', err);
            });
        }
        
        function copyText() {
            const textContent = document.querySelectorAll('.text-content')[1].textContent;
            navigator.clipboard.writeText(textContent).then(() => {
                alert('Teks berhasil disalin!');
            }).catch(err => {
                console.error('Gagal menyalin teks: ', err);
            });
        }
    </script>
</body>
</html>