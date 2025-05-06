<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hasil Ekstraksi PDF</title>
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
            max-height: 500px;
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
                <h3 class="m-0">Hasil Ekstraksi PDF</h3>
                <a href="{{ route('pdf-extractor.index') }}" class="btn btn-light btn-sm">Kembali</a>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h5>File: {{ $fileName }}</h5>
                    <a href="{{ Storage::url($filePath) }}" target="_blank" class="btn btn-sm btn-outline-primary">Lihat PDF</a>
                </div>
                
                <h5>Teks yang diekstrak:</h5>
                <div class="text-content">
                    {{ $extractedText }}
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="copyText()">Salin Teks</button>
                    <a href="{{ route('pdf-extractor.index') }}" class="btn btn-outline-secondary">Upload File Lain</a>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function copyText() {
            const textContent = document.querySelector('.text-content').textContent;
            navigator.clipboard.writeText(textContent).then(() => {
                alert('Teks berhasil disalin!');
            }).catch(err => {
                console.error('Gagal menyalin teks: ', err);
            });
        }
    </script>
</body>
</html>