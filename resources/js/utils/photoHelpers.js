// src/utils/photoHelpers.js

export const processDestinationPhotos = (rawDestinations) => {
  // Validasi data input
  if (!rawDestinations || !Array.isArray(rawDestinations) || rawDestinations.length === 0) {
    console.warn('processDestinationPhotos: Invalid or empty rawDestinations data');
    return { destinations: [], photosByDestination: {} };
  }

  try {
    // Destinasi yang akan digunakan di dropdown select
    const destinations = rawDestinations.map(dest => ({
      id: dest.id.toString(),
      name: dest.name
    }));
  
    // Galeri foto per destinasi untuk ditampilkan
    const photosByDestination = {};
  
    // Proses setiap destinasi
    rawDestinations.forEach(destination => {
      const destId = destination.id.toString();
      
      // Validasi bahwa galleries ada dan merupakan array
      if (destination.galleries && Array.isArray(destination.galleries)) {
        // Tambahkan foto-foto destinasi ke object photosByDestination
        photosByDestination[destId] = destination.galleries.map(photo => ({
          id: photo.id.toString(),
          url: photo.url,
          caption: photo.caption || '',
          alt_text: photo.alt_text || ''
        }));
      } else {
        // Default empty array jika tidak ada galleries
        photosByDestination[destId] = [];
      }
    });
  
    return { destinations, photosByDestination };
  } catch (error) {
    console.error('Error in processDestinationPhotos:', error);
    return { destinations: [], photosByDestination: {} };
  }
};

export const preparePhotosForSubmission = (packageInfo) => {
  // Validasi input
  if (!packageInfo) {
    console.warn('preparePhotosForSubmission: Invalid packageInfo');
    return { coverPhoto: null, galleryPhotos: [] };
  }

  try {
    // Untuk cover photo
    let coverPhotoData = null;
    if (packageInfo.coverPhoto) {
      coverPhotoData = {
        id: packageInfo.coverPhoto.id,
        data: packageInfo.coverPhoto.isFromLibrary ? null : packageInfo.coverPhoto.preview, // Data base64 hanya jika upload sendiri
        preview_url: packageInfo.coverPhoto.preview,
        caption: packageInfo.coverPhoto.caption || '',
        alt_text: packageInfo.coverPhoto.alt_text || '',
        destination_id: packageInfo.coverPhoto.destinationId,
        is_from_library: packageInfo.coverPhoto.isFromLibrary || false
      };
    }
  
    // Untuk gallery photos
    const galleryPhotos = packageInfo.otherPhotos && Array.isArray(packageInfo.otherPhotos)
      ? packageInfo.otherPhotos.map(photo => ({
          id: photo.id,
          data: photo.isFromLibrary ? null : photo.preview, // Data base64 hanya jika upload sendiri
          preview_url: photo.preview,
          caption: photo.caption || '',
          alt_text: photo.alt_text || '',
          destination_id: photo.destinationId,
          is_from_library: photo.isFromLibrary || false
        }))
      : [];
  
    return {
      coverPhoto: coverPhotoData,
      galleryPhotos
    };
  } catch (error) {
    console.error('Error in preparePhotosForSubmission:', error);
    return { coverPhoto: null, galleryPhotos: [] };
  }
};