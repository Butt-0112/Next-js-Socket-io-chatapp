import CryptoJS from 'crypto-js';

export const encryptMessage = (message) => {
  const secretKey = process.env.SECRET_KEY; // Use a secure key from environment variables
  console.log(secretKey)
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

export const decryptMessage = (encryptedMessage) => {
  const secretKey = process.env.SECRET_KEY; // Use a secure key from environment variables
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};