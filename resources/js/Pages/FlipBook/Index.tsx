import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { pdfjs } from 'react-pdf';

// Konfigurasi worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const Index = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bookRef = useRef();

  // Handler untuk upload file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      setPdfFile(file);
      const fileUrl = URL.createObjectURL(file);
      
      try {
        // Load PDF document
        const pdf = await pdfjs.getDocument(fileUrl).promise;
        setNumPages(pdf.numPages);
        
        // Render setiap halaman sebagai gambar
        const images = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          images.push(canvas.toDataURL());
        }
        setPageImages(images);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
        alert('Error loading PDF file');
      }
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  // Component untuk single page
  const Page = React.forwardRef((props, ref) => {
    return (
      <div ref={ref} className="relative bg-white shadow-lg" style={{ width: '400px', height: '600px' }}>
        {props.image && (
          <img 
            src={props.image} 
            alt={`Page ${props.number}`}
            className="w-full h-full object-contain"
          />
        )}
        <div className="absolute bottom-4 right-4 text-gray-500 text-sm">
          Page {props.number}
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">PDF Flipbook Viewer</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Converting PDF to Flipbook...</p>
          </div>
        )}

        {/* Flipbook */}
        {pageImages.length > 0 && !loading && (
          <div className="flex justify-center">
            <div className="flipbook-container">
              <HTMLFlipBook
                width={400}
                height={600}
                size="stretch"
                minWidth={400}
                maxWidth={400}
                minHeight={600}
                maxHeight={600}
                showCover={true}
                mobileScrollSupport={true}
                className="mx-auto"
                ref={bookRef}
              >
                {pageImages.map((image, index) => (
                  <Page key={index} image={image} number={index + 1} />
                ))}
              </HTMLFlipBook>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;