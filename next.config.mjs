/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_SOCKET_BACKEND_URL: "https://chatapp.echoplay.site",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_Y2xlYW4tZWdyZXQtODcuY2xlcmsuYWNjb3VudHMuZGV2JA",
        CLERK_SECRET_KEY: "sk_test_Noilxo1PCOKjRRJ3AuEAunNjN1TAxLnksjQqpE18XK"
    },
};

export default nextConfig;
