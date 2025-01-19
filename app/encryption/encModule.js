import dynamic from 'next/dynamic';

// Dynamically import the encryption utility
const EncryptionUtils = dynamic(() => import('./encryptionUtils'), { ssr: false });

export default EncryptionUtils;