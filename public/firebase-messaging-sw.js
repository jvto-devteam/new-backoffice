// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Konfigurasi Firebase - copy dari .env yang di-expose ke script worker
firebase.initializeApp({
  apiKey: "AIzaSyBY3Z8QJ5gdPj4xlaCdyJGE_NAbPqdR8-w",
  authDomain: "new-backoffice-97899.firebaseapp.com",
  projectId: "new-backoffice-97899",
  storageBucket: "new-backoffice-97899.firebasestorage.app",
  messagingSenderId: "686756118033",
  appId: "1:686756118033:web:995ec466c52118a24e7bb0",
  measurementId: "G-BFF5PLL35Z"
});

const messaging = firebase.messaging();

// Konfigurasi notifikasi yang SANGAT dioptimalkan untuk persistensi desktop & mobile
const getNotificationOptions = (notification, data) => {
  // Base options untuk semua platform
  const options = {
    icon: '/assets/images/icon192.png', // Logo aplikasi Anda di folder /public
    badge: '/assets/images/icon72.png', // Badge icon untuk notifikasi
    tag: data.tag || `notification_${Date.now()}`, // Tag unik atau dari data
    timestamp: Date.now(),
    renotify: true, // Memicu suara/getar meskipun dengan tag sama
    requireInteraction: true, // KUNCI untuk notifikasi persisten di desktop
    
    // Data untuk handler klik
    data: data || {},
    
    // Platform-specific refinements:
    // 1. Mobile: vibration pattern & sound
    vibrate: [200, 100, 200, 100, 200],
    silent: false, // Pastikan menghasilkan suara
    
    // 2. Interaktivitas
    actions: [
      { action: 'view', title: 'Lihat Detail' },
      { action: 'close', title: 'Tutup' }
    ],
  };
  
  // Tambahkan media jika ada (hanya bekerja di desktop)
  if (data.image || '/notification-image.png') {
    options.image = data.image || '/notification-image.png';
  }
  
  return options;
};

// Tangani pesan background (SANGAT PENTING untuk notifikasi saat aplikasi ditutup)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Pesan diterima dalam background:', payload);

  // Extract notification data
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  // Siapkan data spesifik untuk booking jika ada
  let tag = 'general_notification';
  if (data.type === 'new_booking' && data.booking_id) {
    tag = `booking_${data.booking_id}`;
    
    // Tambahkan data langsung ke objek data
    data.tag = tag;
    data.timestamp = data.timestamp || Date.now();
  }
  
  // Tampilkan notifikasi dengan opsi yang dioptimalkan
  const options = getNotificationOptions(notification, data);
  
  // Tampilkan notifikasi yang persisten
  self.registration.showNotification(
    notification.title || 'Notifikasi Baru',
    {
      body: notification.body || '',
      ...options
    }
  );
});

// Handler untuk klik notifikasi
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notifikasi diklik:', event);
  
  // Tutup notifikasi yang diklik
  event.notification.close();
  
  // Dapatkan data dari notifikasi
  const data = event.notification.data || {};
  
  // Tentukan URL tujuan berdasarkan tipe notifikasi
  let targetUrl = '/';
  
  // if (data.type === 'new_booking' && data.booking_id) {
  //   targetUrl = `/bookings/${data.booking_id}`;
  // } else if (data.url) {
  // }
  targetUrl = data.url;
  
  // Handler untuk action khusus
  if (event.action === 'view') {
    // Action view - buka detail
  } else if (event.action === 'close') {
    // Action close - hanya tutup notifikasi tanpa navigasi
    return;
  }
  
  // Fokuskan aplikasi yang sudah terbuka atau buka window baru
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true // Penting! Mencakup semua tab/window
    }).then((clientList) => {
      // Cek apakah ada client yang sudah terbuka
      for (const client of clientList) {
        // Jika ada client yang sudah terbuka, fokuskan
        if ('focus' in client) {
          client.focus();
          
          // Jika client bisa diubah URL-nya, navigasikan
          if ('navigate' in client) {
            client.navigate(targetUrl);
            return;
          }
          return;
        }
      }
      
      // Jika tidak ada client yang terbuka, buka jendela baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handler untuk notifikasi yang ditutup tanpa diklik
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notifikasi ditutup tanpa interaksi:', event);
  // Bisa ditambahkan tracking atau analitik disini
});

// Handler untuk push tanpa payload (jarang terjadi)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event tanpa payload:', event);
  
  if (!event.data) {
    console.log('[SW] Push tanpa data payload');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('[SW] Push dengan JSON payload:', payload);
    
    // Tampilkan notifikasi jika ada data notification
    if (payload.notification) {
      const options = getNotificationOptions(payload.notification, payload.data || {});
      
      self.registration.showNotification(
        payload.notification.title || 'Notifikasi Baru',
        {
          body: payload.notification.body || '',
          ...options
        }
      );
    }
  } catch (e) {
    console.error('[SW] Error memproses push payload:', e);
  }
});

// Handling service worker installation (opsional)
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalasi berhasil');
  self.skipWaiting(); // Aktifkan SW baru segera
});

// Handling service worker activation (opsional)
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker aktivasi berhasil');
  // Klaim klien yang tidak terkontrol
  event.waitUntil(clients.claim());
});