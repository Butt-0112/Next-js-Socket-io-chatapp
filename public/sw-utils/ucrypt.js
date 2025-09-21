importScripts("https://cdn.jsdelivr.net/npm/libsodium-wrappers@0.7.15/dist/modules/libsodium-wrappers.min.js")
const decryptMessageForCurrentUser = async (messageDoc, currentUserId, privateKeyBase64, publicKeyBase64) => {
    await sodium.ready;

    const entry = messageDoc.ciphertexts?.[currentUserId];
    if (!entry) throw new Error('No ciphertext for this user');

    const ciphertext = sodium.from_base64(entry.ciphertext);
    const nonce = sodium.from_base64(entry.nonce);
    const ephemeralPublic = sodium.from_base64(messageDoc.ephemeralPublicKey);

    // derive shared secret
    const { sharedRx } = sodium.crypto_kx_server_session_keys(
      sodium.from_base64(publicKeyBase64),
      sodium.from_base64(privateKeyBase64),
      ephemeralPublic
    );

    const plainBytes = sodium.crypto_secretbox_open_easy(ciphertext, nonce, sharedRx);
    if (!plainBytes) throw new Error('Decryption failed');

    return sodium.to_string(plainBytes);
  };