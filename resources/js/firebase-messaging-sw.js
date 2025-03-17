importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Konfigurasi Firebase (sama dengan di firebase.js)
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

// Tangani pesan background
messaging.onBackgroundMessage((payload) => {
  console.log('Pesan diterima dalam background:', payload);

  const notificationTitle = payload.notification.title || 'Notifikasi Baru';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/logo192.png', // Logo aplikasi Anda
    badge: '/badge-icon.png', // Opsional
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Tangani klik notifikasi
self.addEventListener('notificationclick', (event) => {
  console.log('Notifikasi diklik:', event);
  
  // Dapatkan data dari notifikasi
  const data = event.notification.data;
  event.notification.close();
  
  // Buka aplikasi dan navigasi ke halaman yang relevan
  if (data && data.booking_id) {
    // URL untuk halaman detail booking
    const url = `/bookings/${data.booking_id}`;
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Cek apakah ada window yang sudah terbuka
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Jika tidak ada window yang terbuka, buka window baru
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else {
    // Jika tidak ada data spesifik, buka halaman utama
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
