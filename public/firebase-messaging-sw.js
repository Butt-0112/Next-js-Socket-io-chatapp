self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || 'http://localhost:3000';
  const messageData = event.notification.data;

  event.waitUntil(
    (async () => {
      try {
        // Get all window clients
        const windowClients = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });

        // Try to find an existing window at root path
        const existingWindow = windowClients.find(client => 
          (client.url === urlToOpen || client.url === urlToOpen + '/') && 
          'focus' in client
        );

        if (existingWindow) {
          // If window exists, focus it and post message
          await existingWindow.focus();
          if (messageData) {
            existingWindow.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: messageData
            });
          }
          return;
        }

        // If no existing window, open new one
        if (clients.openWindow) {
          const client = await clients.openWindow(urlToOpen);
          // Wait for client to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (client && messageData) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: messageData
            });
          }
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    })()
  );
});
// IndexedDB helpers for service worker
// We can't use ES modules here, so attach everything to self

self.keyDB = {
  dbName: 'keys-db',
  storeName: 'keys',

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(self.keyDB.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(self.keyDB.storeName)) {
          db.createObjectStore(self.keyDB.storeName);
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },

  async saveKey(keyName, keyValue) {
    const db = await self.keyDB.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(self.keyDB.storeName, 'readwrite');
      tx.objectStore(self.keyDB.storeName).put(keyValue, keyName);
      tx.oncomplete = () => resolve(true);
      tx.onerror = (event) => reject(event.target.error);
    });
  },

  async getKey(keyName) {
    const db = await self.keyDB.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(self.keyDB.storeName, 'readonly');
      const request = tx.objectStore(self.keyDB.storeName).get(keyName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
};

importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

importScripts('https://cdn.jsdelivr.net/npm/libsodium@0.7.15/dist/modules/libsodium.min.js');
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/libsodium-wrappers/0.5.4/libsodium-wrappers.min.js')
importScripts('./sw-utils/ucrypt.js')

// import { decryptMessageForCurrentUser } from "@/lib/cryptoUtils/ucrypt";
// import { getPrivateKey, getPublicKey } from "@/lib/keyUtils/keyDB";
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

messaging.onBackgroundMessage(async(payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  console.log('before')
  const privateKey = await self.keyDB.getKey('privateKey')
  const publicKey = await self.keyDB.getKey('publicKey')
  console.log('after')

  const { title,userId, ciphertexts, ephemeralPublicKey, url , icon} = payload.data;
  console.log(JSON.parse(ciphertexts), 'ciphertexts')
  const plainText= await decryptMessageForCurrentUser({ciphertexts:JSON.parse(ciphertexts), ephemeralPublicKey},userId, privateKey, publicKey )
  self.registration.showNotification(title, {
    body: plainText,
    icon,
    data: { url },
  });
 });
// messaging.onMessage((payload) => {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );
//   const { title, body, url } = payload.data;

//   self.registration.showNotification(title, {
//     body,
//     data: { url },
//   });
//  });
