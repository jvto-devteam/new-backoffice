// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

// Konfigurasi Firebase dari .env
const firebaseConfig = {
  apiKey: "AIzaSyBY3Z8QJ5gdPj4xlaCdyJGE_NAbPqdR8-w",
  authDomain: "new-backoffice-97899.firebaseapp.com",
  projectId: "new-backoffice-97899",
  storageBucket: "new-backoffice-97899.firebasestorage.app",
  messagingSenderId: "686756118033",
  appId: "1:686756118033:web:995ec466c52118a24e7bb0",
  measurementId: "G-BFF5PLL35Z"
};

// Inisialisasi Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Minta izin notifikasi dan dapatkan token FCM
 * @returns Promise<string|null> Token FCM atau null jika gagal
 */
export const requestNotificationPermission = async () => {
  try {
    // Periksa dukungan browser
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi desktop');
      return null;
    }
    
    if (!('serviceWorker' in navigator)) {
      console.log('Browser tidak mendukung service worker');
      return null;
    }
    
    // Cek izin notifikasi yang sudah ada
    let permission = Notification.permission;
    console.log('Izin notifikasi saat ini:', permission);
    
    // Minta izin jika belum granted
    if (permission !== 'granted') {
      console.log('Meminta izin notifikasi...');
      permission = await Notification.requestPermission();
      console.log('Hasil permintaan izin:', permission);
    }
    
    if (permission === 'granted') {
      try {
        console.log('Mendaftarkan service worker...');
        
        // Dapatkan atau daftarkan service worker
        const serviceWorkerRegistration = await getServiceWorkerRegistration();
        
        if (!serviceWorkerRegistration) {
          throw new Error('Gagal mendaftarkan service worker');
        }
        
        // VAPID key dari Firebase Cloud Messaging (Web Push certificate)
        const vapidKey = 'BMyEgR0NIMeK5-pVV1Hqnl9NpToz-2mtdYEIRtJ3M6HJPpqLmoK2VT2l7m46ZqEOI6-C5TDsca2UwdpKJarun6o';
        
        if (!vapidKey) {
          console.warn('VAPID key tidak ditemukan di .env, notifikasi mungkin tidak berfungsi');
        }
        
        console.log('Meminta token FCM...');
        const tokenOptions = {
          vapidKey,
          serviceWorkerRegistration
        };
        
        const currentToken = await getToken(messaging, tokenOptions);
        
        if (currentToken) {
          console.log('Token FCM berhasil didapatkan');
          console.log('Token:', currentToken.substring(0, 20) + '...');
          
          // Kirim token ke server
          await sendTokenToServer(currentToken);
          
          // Simpan token di localStorage
          localStorage.setItem('fcm_token', currentToken);
          localStorage.setItem('fcm_token_timestamp', Date.now().toString());
          
          return currentToken;
        } else {
          console.error('Tidak dapat mendapatkan token meskipun izin diberikan');
          return null;
        }
      } catch (tokenError) {
        console.error('Error mendapatkan token FCM:', tokenError);
        
        // Jika error berkaitan dengan service worker, coba lagi dengan pendaftaran SW baru
        if (tokenError.message && tokenError.message.includes('serviceWorker')) {
          console.log('Mencoba mendaftarkan service worker baru...');
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/',
              updateViaCache: 'none'
            });
            
            // Rekursif - coba lagi mendapatkan token
            return await requestNotificationPermission();
          } catch (swError) {
            console.error('Error mendaftarkan service worker baru:', swError);
          }
        }
        
        return null;
      }
    } else {
      console.log('Izin notifikasi ditolak oleh pengguna');
      return null;
    }
  } catch (error) {
    console.error('Error global mendapatkan token FCM:', error);
    return null;
  }
};

/**
 * Mendapatkan service worker registration untuk FCM
 * @returns Promise<ServiceWorkerRegistration|null>
 */
const getServiceWorkerRegistration = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    // Periksa service worker yang sudah terdaftar
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Jika service worker FCM sudah ada, gunakan
    for (const registration of registrations) {
      if (registration.active && registration.active.scriptURL.includes('firebase-messaging-sw.js')) {
        console.log('Service worker FCM ditemukan', registration);
        return registration;
      }
    }
    
    // Jika tidak ditemukan, daftarkan service worker baru
    console.log('Mendaftarkan service worker FCM baru');
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
      updateViaCache: 'none' // Penting: jangan cache SW
    });
  } catch (err) {
    console.error('Error mendaftarkan service worker:', err);
    return null;
  }
};

/**
 * Kirim token FCM ke server Laravel
 * @param {string} token - Token FCM yang akan dikirim
 * @returns {Promise<boolean>} Berhasil atau tidak
 */
const sendTokenToServer = async (token) => {
  try {
    // Endpoint API untuk menyimpan token
    const response = await axios.post('https://javavolcano-touroperator.com/api/fcm/token/store', {
      token,
      device_type: detectDeviceType(),
      device_id: getOrCreateDeviceId()
    });
    
    console.log('Token FCM berhasil dikirim ke server:', response.data);
    return true;
  } catch (error) {
    console.error('Error mengirim token ke server:', error);
    return false;
  }
};

/**
 * Deteksi tipe perangkat
 * @returns {string} Tipe perangkat (android, ios, windows, macos, linux, web)
 */
const detectDeviceType = () => {
  const ua = navigator.userAgent;
  
  // Mobile detection
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  
  // Desktop detection
  if (/Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(ua)) return 'macos';
  if (/Linux/i.test(ua)) return 'linux';
  
  return 'web';
};

/**
 * Dapatkan atau buat device ID
 * @returns {string} Device ID
 */
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

/**
 * Listener untuk pesan foreground
 * @returns {Promise} Promise yang menerima payload notifikasi
 */
export const onMessageListener = () => {
  if (!messaging) {
    console.error('Messaging tidak terinisialisasi');
    return Promise.reject(new Error('Messaging tidak terinisialisasi'));
  }
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Pesan diterima di foreground:', payload);
      resolve(payload);
    });
  });
};

/**
 * Hapus pendaftaran FCM dan service worker
 * @returns {Promise<boolean>} Berhasil atau tidak
 */
export const unregisterFCM = async () => {
  try {
    // Hapus token dari localStorage
    localStorage.removeItem('fcm_token');
    localStorage.removeItem('fcm_token_timestamp');
    
    // Hapus token dari server
    if (navigator.onLine) {
      try {
        await axios.post('/api/fcm/token/delete', {
          device_id: localStorage.getItem('device_id')
        });
      } catch (e) {
        console.error('Error menghapus token dari server:', e);
      }
    }
    
    // Hapus pendaftaran service worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      if (registration.active && registration.active.scriptURL.includes('firebase-messaging-sw.js')) {
        await registration.unregister();
        console.log('Service worker FCM berhasil dihapus');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error menghapus pendaftaran FCM:', error);
    return false;
  }
};

export default { requestNotificationPermission, onMessageListener, unregisterFCM };