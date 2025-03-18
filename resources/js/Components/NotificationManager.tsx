// src/Components/NotificationManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react'; // Gunakan router dari Inertia.js
import { requestNotificationPermission, onMessageListener } from '../firebase';

interface NotificationData {
  [key: string]: any;
  booking_id?: string | number;
  type?: string;
  url?: string;
  click_action?: string;
}

const NotificationManager: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Fungsi untuk menangani klik notifikasi
  const handleNotificationClick = useCallback((data: NotificationData) => {
    console.log('Notifikasi diklik dengan data:', data);
    
    // Navigasi berdasarkan tipe notifikasi menggunakan Inertia router
    if (data.type === 'new_booking' && data.booking_id) {
      router.visit(`/bookings/${data.booking_id}`);
    } else if (data.url) {
      router.visit(data.url);
    } else {
      router.visit('/');
    }
  }, []);

  // Fungsi untuk memainkan suara notifikasi
  const playNotificationSound = useCallback(() => {
    try {
      // Cek apakah browser mendukung Audio API
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        
        // Coba mainkan suara
        const playPromise = audio.play();
        
        // Handle promise untuk browser modern
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Gagal memainkan suara notifikasi:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error memainkan suara notifikasi:', error);
    }
  }, []);

  // Fungsi untuk menampilkan toast notification
  const showToastNotification = useCallback((payload: any) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    
    // Mainkan suara notifikasi
    playNotificationSound();
    
    // Tampilkan toast yang tidak hilang secara otomatis (persistent)
    toast.info(
      <div className="notification-toast" onClick={() => handleNotificationClick(data)}>
        <h4>{notification.title || 'Notifikasi Baru'}</h4>
        <p>{notification.body || ''}</p>
        {data.booking_id && (
          <div className="mt-2">
            <small>Booking #{data.booking_id}</small>
          </div>
        )}
      </div>,
      {
        autoClose: false, // Tidak hilang otomatis
        closeOnClick: false, // Tidak menutup saat diklik
        draggable: true,
        position: "top-right",
        className: 'interactive-toast',
        hideProgressBar: false,
        pauseOnHover: true,
      }
    );
  }, [handleNotificationClick, playNotificationSound]);

  // Setup notifikasi ketika komponen dimount
  useEffect(() => {
    // Mencegah inisialisasi ganda
    if (isInitialized) return;
    
    // Periksa dukungan browser untuk notifikasi
    const isNotificationSupported = 'Notification' in window;
    const isServiceWorkerSupported = 'serviceWorker' in navigator;
    
    if (!isNotificationSupported || !isServiceWorkerSupported) {
      console.log('Browser tidak mendukung notifikasi push:', { 
        notificationSupport: isNotificationSupported, 
        serviceWorkerSupport: isServiceWorkerSupported 
      });
      return;
    }

    // Inisialisasi notifikasi
    const initializeNotifications = async () => {
      try {
        console.log('Menginisialisasi notifikasi...');
        
        // Dapatkan token FCM
        const token = await requestNotificationPermission();
        setFcmToken(token);
        
        if (token) {
          console.log('Berhasil mendaftarkan perangkat untuk notifikasi');
          setIsInitialized(true);
        } else {
          console.warn('Gagal mendapatkan token FCM');
        }
      } catch (error) {
        console.error('Error menginisialisasi notifikasi:', error);
      }
    };

    // Mulai proses inisialisasi
    initializeNotifications();

    // Setup listener untuk pesan masuk ketika aplikasi aktif (foreground)
    const setupMessageListener = async () => {
      try {
        onMessageListener().then((payload) => {
          console.log('Pesan FCM diterima di foreground:', payload);
          
          // Tampilkan toast notification
          showToastNotification(payload);
        }).catch(err => {
          console.error('Error pada listener pesan FCM:', err);
        });
      } catch (err) {
        console.error('Gagal setup listener pesan FCM:', err);
      }
    };
    
    // Setup listener jika browser mendukung
    if (isNotificationSupported && isServiceWorkerSupported) {
      setupMessageListener();
    }

    // Cleanup saat komponen di-unmount
    return () => {
      // Tidak perlu cleanup khusus karena onMessageListener sudah menangani
      console.log('NotificationManager unmounted');
    };
  }, [isInitialized, showToastNotification]);

  // Komponen ini tidak merender apapun di UI
  return null;
};

export default NotificationManager;