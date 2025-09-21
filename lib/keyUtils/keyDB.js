import { openDB } from 'idb';

const DB_NAME = 'keys-db';
const STORE_NAME = 'keys';

// Ensure DB is ready
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Save a key (private or public)
export async function saveKey(keyName, keyValueBase64) {
  const db = await getDB();
  await db.put(STORE_NAME, keyValueBase64, keyName);
}

// Get a key (private or public)
export async function getKey(keyName) {
  const db = await getDB();
  return db.get(STORE_NAME, keyName);
}

// Convenience wrappers
export async function savePrivateKey(privateKeyBase64) {
  return saveKey('privateKey', privateKeyBase64);
}

export async function getPrivateKey() {
  return getKey('privateKey');
}

export async function savePublicKey(publicKeyBase64) {
  return saveKey('publicKey', publicKeyBase64);
}

export async function getPublicKey() {
  return getKey('publicKey');
}
