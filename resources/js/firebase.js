import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

// Konfigurasi Firebase dari console Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
        vapidKey: 'YOUR_VAPID_KEY' // Dapatkan dari Firebase Console (Web Push certificates)
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
    const response = await axios.post('/api/fcm/token', {
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

// Fungsi untuk menangani pesan yang diterima saat aplikasi aktif (foreground)
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Pesan diterima di foreground:', payload);
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
