let notificationData = ''  // Access any custom data
self.addEventListener('notificationclick', function (event) {
  event.notification.close();  // Close the notification when it's clicked

  // Example: Handle click by opening a URL or performing another action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Focus on an open tab with the same URL, if exists
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }

      // If no tab exists with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(notificationData);
      }
    })
  );
});

importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);
const firebaseConfig = {

  apiKey: "AIzaSyA1dQcha91rNqdBOdus07FGtBDp4PTCmW8",
  authDomain: "livechat-4ea6c.firebaseapp.com",
  projectId: "livechat-4ea6c",
  storageBucket: "livechat-4ea6c.firebasestorage.app",
  messagingSenderId: "148298278052",
  appId: "1:148298278052:web:3147c31ee38c288eaa3231",
  measurementId: "G-KD8T2X94Z7"
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  notificationData = payload.data.url
  // self.registration.showNotification(notificationTitle, notificationOptions);
});

