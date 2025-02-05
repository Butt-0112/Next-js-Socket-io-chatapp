'use client'// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging,getToken,onMessage,isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain:process.env.NEXT_PUBLIC_AUTH_DOMAIN ,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID ,
  measurementId:  process.env.NEXT_PUBLIC_MEASUREMENT_ID
};
console.log('initializing firebase',firebaseConfig)
isSupported().then(supported=>console.log(supported))
// Initialize Firebase

const app = initializeApp(firebaseConfig);
let messaging;
if(typeof window!==undefined){

   messaging = getMessaging(app) 
}
export const getFCMToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: 'BJGy40imkXrwJUZ3D_Ouf7dNT3zbnd5v3qHoki8A3TCl_hvJEhKvY4-mCNISmYSxSurneO5daz6Cs1rwW_wpY7Q' });
    if (currentToken) {
      // Return token if it exists
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (error) {
    console.log('An error occurred while retrieving token. ', error);
  }
}
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  const { title, body } = payload.notification;

  // Show a system notification
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      // icon: '/logo512.png', // Optional: Add an icon
    });
  }
});
