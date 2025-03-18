import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

// Konfigurasi Firebase dari console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBY3Z8QJ5gdPj4xlaCdyJGE_NAbPqdR8-w",
  authDomain: "new-backoffice-97899.firebaseapp.com",
  projectId: "new-backoffice-97899",
  storageBucket: "new-backoffice-97899.firebasestorage.app",
  messagingSenderId: "686756118033",
  appId: "1:686756118033:web:995ec466c52118a24e7bb0",
  measurementId: "G-BFF5PLL35Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Fungsi untuk meminta izin notifikasi dan mendapatkan token FCM
export const requestNotificationPermission = async () => {
  try {
    // Minta izin notifikasi dari browser
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Izin notifikasi diberikan.');
      
      // Dapatkan token FCM
      const currentToken = await getToken(messaging, { 
        vapidKey: 'BMyEgR0NIMeK5-pVV1Hqnl9NpToz-2mtdYEIRtJ3M6HJPpqLmoK2VT2l7m46ZqEOI6-C5TDsca2UwdpKJarun6o' // Dapatkan dari Firebase Console (Web Push certificates)
      });
      
      if (currentToken) {
        console.log('Token FCM:', currentToken);
        
        // Kirim token ke server Laravel
        await sendTokenToServer(currentToken);
        return currentToken;
      } else {
        console.log('Tidak dapat mendapatkan token.');
        return null;
      }
    } else {
      console.log('Izin notifikasi ditolak.');
      return null;
    }
  } catch (error) {
    console.error('Error mendapatkan token FCM:', error);
    return null;
  }
};

// Fungsi untuk mengirim token ke server Laravel
const sendTokenToServer = async (token) => {
  try {
    // Dapatkan token autentikasi dari localStorage atau tempat penyimpanan lainnya
    const authToken = localStorage.getItem('auth_token');
    
    if (!authToken) {
      console.warn('Token autentikasi tidak ditemukan, melanjutkan tanpa autentikasi');
    }
    
    // Ganti URL dengan API endpoint Laravel Anda
    const response = await axios.post('http://127.0.0.1:8001/api/fcm/token', {
      token,
      device_type: 'web'
    }, {
      headers: authToken ? {
        'Authorization': `Bearer ${authToken}`
      } : {}
    });
    
    console.log('Token FCM berhasil dikirim ke server:', response.data);
    return true;
  } catch (error) {
    console.error('Error mengirim token FCM ke server:', error);
    return false;
  }
};

let processedNotifications = new Set();

// Reset processed notifications setiap 30 menit
setInterval(() => {
  processedNotifications.clear();
}, 30 * 60 * 1000);

// Fungsi untuk menangani pesan yang diterima saat aplikasi aktif (foreground)
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Pesan diterima:', payload);
      
      // Buat ID unik untuk pesan berdasarkan data dan waktu
      const messageId = payload.data?.booking_id || payload.data?.id || payload.messageId;
      const timestamp = payload.data?.timestamp || Date.now().toString();
      const notificationId = `${messageId}-${timestamp}`;
      
      // Cek apakah notifikasi sudah ditampilkan sebelumnya
      if (processedNotifications.has(notificationId)) {
        console.log('Notifikasi duplikat terdeteksi, mengabaikan:', notificationId);
        return;
      }
      
      // Tandai notifikasi ini sudah diproses
      processedNotifications.add(notificationId);
      
      // Lanjutkan dengan proses notifikasi
      resolve(payload);
    });
  });
};

// Fungsi untuk cek apakah browser mendukung notifikasi
export const checkNotificationSupport = () => {
  if (!('Notification' in window)) {
    console.log('Browser ini tidak mendukung notifikasi desktop');
    return false;
  }
  
  if (!('serviceWorker' in navigator)) {
    console.log('Browser ini tidak mendukung service worker');
    return false;
  }
  
  return true;
};
