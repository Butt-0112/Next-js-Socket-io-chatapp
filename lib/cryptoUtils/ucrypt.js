import CryptoJS from 'crypto-js';

const secretKey = process.env.SECRET_KEY; // Use a secure key from environment variables

export const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

export const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};