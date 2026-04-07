importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBINwrU7NvNJRWe0KOhG5DhMmTjZudY_u4',
  authDomain: 'usdt-whale-tracker.firebaseapp.com',
  projectId: 'usdt-whale-tracker',
  storageBucket: 'usdt-whale-tracker.firebasestorage.app',
  messagingSenderId: '572069421846',
  appId: '1:572069421846:web:117f2c607e6da5c949e637',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Whale Alert!', {
    body: body || 'New whale transfer detected',
    icon: '/favicon.ico',
    data: payload.data,
  });
});
