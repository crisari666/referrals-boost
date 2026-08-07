/* global importScripts, firebase, clients, self */
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

fetch('/firebase-config.json')
  .then((response) => response.json())
  .then((config) => {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || 'La Ceiba';
      const body = (payload.notification && payload.notification.body) || '';
      const data = payload.data || {};
      const route =
        (data.route && String(data.route).trim()) ||
        (data.customerId ? '/clients/' + String(data.customerId).trim() : '/clients');
      return self.registration.showNotification(title, {
        body: body,
        icon: '/la-ceiba-icon.png',
        data: {
          route: route,
          type: data.type || '',
          customerId: data.customerId || '',
        },
      });
    });
  })
  .catch((error) => {
    console.error('Firebase messaging SW init failed', error);
  });

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route =
    (event.notification.data && event.notification.data.route) || '/clients';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', route: route });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(route);
      }
      return undefined;
    }),
  );
});
