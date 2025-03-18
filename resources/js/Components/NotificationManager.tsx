import React, { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener, checkNotificationSupport } from '../firebase';
import { toast } from 'react-toastify'; // Atau library notifikasi lainnya

const NotificationManager = () => {
  const [notification, setNotification] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Cek dukungan notifikasi pada browser
    const supported = checkNotificationSupport();
    setIsSupported(supported);
    
    if (!supported) {
      console.log('Notifikasi tidak didukung pada browser ini');
      return;
    }
    
    // Minta izin notifikasi saat komponen dimuat
    const requestPermission = async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          console.log('Berhasil mendaftarkan perangkat untuk notifikasi');
        }
      } catch (error) {
        console.error('Error saat meminta izin notifikasi:', error);
      }
    };

    requestPermission();

    // Setup listener untuk pesan yang masuk
    const messageListener = onMessageListener().then((payload) => {
      console.log('Pesan diterima di foreground:', payload);
      setNotification(payload);

      // Tampilkan toast notification
      toast.info(
        <div className="notification-toast">
          <h4>{payload.notification?.title}</h4>
          <p>{payload.notification?.body}</p>
        </div>, 
        {
          onClick: () => {
            // Navigasi ke halaman detail booking
            if (payload.data?.booking_id) {
              window.location.href = `/bookings/${payload.data.booking_id}`;
            }
          },
          autoClose: 5000,
          position: "top-right",
        }
      );
    }).catch(err => {
      console.error('Error pada listener pesan:', err);
    });

    return () => {
      // Cleanup
      if (messageListener) {
        messageListener.catch(err => console.log('Failed to unsubscribe from FCM:', err));
      }
    };
  }, []);

  if (!isSupported) {
    return null; // Tidak tampilkan apapun jika notifikasi tidak didukung
  }

  return null; // Komponen ini tidak merender apapun di UI
};

export default NotificationManager;
