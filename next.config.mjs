/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_SOCKET_BACKEND_URL: "https://livechat-ae9c.onrender.com",
        NEXT_PUBLIC_API_KEY: "AIzaSyA1dQcha91rNqdBOdus07FGtBDp4PTCmW8",
        NEXT_PUBLIC_AUTH_DOMAIN: "livechat-4ea6c.firebaseapp.com",
        NEXT_PUBLIC_PROJECT_ID: "livechat-4ea6c",
        NEXT_PUBLIC_STORAGE_BUCKET: "livechat-4ea6c.firebasestorage.app",
        NEXT_PUBLIC_MESSAGING_SENDER_ID: "148298278052",
        NEXT_PUBLIC_APP_ID: "1:148298278052:web:3147c31ee38c288eaa3231",
        NEXT_PUBLIC_MEASUREMENT_ID: "G-KD8T2X94Z7",
    },
    images:{
        domains:['img.clerk.com']
    }
};

export default nextConfig;
