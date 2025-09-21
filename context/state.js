"use client"
import { useEffect, useId, useState } from "react";
import { context } from "./context";
import { connect, io } from "socket.io-client";
import { decryptMessage, decryptPrivateKey } from "@/app/encryption/encryptionUtils";
import { useNavigate, useNavigation } from "react-router-dom";
import { useRouter } from "next/navigation";
import { getFCMToken } from "@/lib/firebase";
import Peer from "peerjs";
import * as sodium from "libsodium-wrappers";

import { useUser } from "@clerk/nextjs";
import { savePrivateKey, savePublicKey } from "@/lib/keyUtils/keyDB";
const StateProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [users, setUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [messageStatuses, setMessageStatuses] = useState({});
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [userStatus, setUserStatus] = useState({})

  // const [user, setUser] = useState({})
  const [selectedUser, setSelectedUser] = useState({})
  const [messages, setMessages] = useState([])
  const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
  console.log(API_BASE_URL)
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
  // const SOCKET_URL = "http://me-visited.gl.at.ply.gg:21227"
  const [userPeer, setUserPeer] = useState(null)
  const router = useRouter()
  const [stream, setStream] = useState(null)
  const [peers, setPeers] = useState({});
  const [userchanged, setUserChanged] = useState(false)
  const { user, isSignedIn } = useUser()
  // Add these states after existing useState declarations
  const generateDeviceId = () => {
    return `device_${Math.random().toString(36).substr(2, 9)}`;
  };
  const [userPresence, setUserPresence] = useState({
    status: 'offline',
    lastSeen: null,
    deviceId: generateDeviceId(), // We'll create this function
    activeDevices: 0
  });

  // Add this helper function after existing helper functions
  const sendTokenToServer = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/fcm/default-token`, {
      method: 'POST',
      body: JSON.stringify({ token, clerkId: user.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json()
  };
  async function requestPermission() {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      if (user) {

        const token = await getFCMToken()
        if (token) {

          await sendTokenToServer(token)
        }
        console.log('token gen', token)
      }
    } else if (permission === 'denied') {
      // alert('you denied for the permission')
    }
  }
  const deleteContact = async (contactID) => {
    const response = await fetch(`${API_BASE_URL}/api/users/deleteContact`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        contactID: contactID,
        userId: user.id
      })
    })
    if (response.ok) {

      const json = await response.json()
      const contacts = json.contacts
      setContacts(contacts)
      return contacts

    }

  }
  const decryptMessage = async (messageDoc, recipientPrivateKeyBase64, recipientPublicKeyBase64) => {
    // Make sure sodium is ready
    await sodium.ready;

    // 1. Extract required fields from DB message document
    const { content, nonce, ephemeralPublicKey } = messageDoc;

    // 2. Load recipient’s private + public keys (the permanent keys)
    const recipientPrivateKey = sodium.from_base64(recipientPrivateKeyBase64);
    const recipientPublicKey = sodium.from_base64(recipientPublicKeyBase64);

    // 3. Derive the shared secret (recipient uses server session keys)
    // Sender used sharedTx to encrypt, so recipient must use sharedRx to decrypt
    const { sharedRx, sharedTx } = sodium.crypto_kx_server_session_keys(
      recipientPublicKey,               // server/recipient public key
      recipientPrivateKey,              // server/recipient private key
      sodium.from_base64(ephemeralPublicKey) // sender’s ephemeral public key
    );

    // 4. Decode ciphertext and nonce
    const cipherBytes = sodium.from_base64(content);
    const nonceBytes = sodium.from_base64(nonce);

    // 5. Decrypt message
    const decryptedBytes = sodium.crypto_secretbox_open_easy(
      cipherBytes,
      nonceBytes,
      sharedRx // recipient uses sharedRx to decrypt
    );

    if (!decryptedBytes) {
      throw new Error('Failed to decrypt message. Possible wrong keys or corrupted data.');
    }

    const plaintext = sodium.to_string(decryptedBytes);
    return plaintext;
  };
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

  const decryptMessagesArray = async (messages, currentUserId, privateKeyBase64, publicKeyBase64) => {
    await sodium.ready;
    return Promise.all(messages.map(async (msg) => {
      try {
        const plaintext = await decryptMessageForCurrentUser(msg, currentUserId, privateKeyBase64, publicKeyBase64);
        return { ...msg, content: plaintext };
      } catch (err) {
        console.warn(`Failed to decrypt ${msg._id}: ${err.message}`);
        return { ...msg, content: null };
      }
    }));
  };

  const fetchUserById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/users/getUserbyId`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: id
      })

    })
    if (response.ok) {
      const json = await response.json()
      return json

    }
  }

  const enterRoom = ({ roomId }) => {
    router.push(`/room/${roomId}`)


  }
  const getUsers = ({ roomId, participants }) => {
    console.log(participants, 'participants of room', roomId)
  }
  // Add after existing functions
  const updateUserStatus = (status) => {
    if (!socket || !user) return;

    const statusUpdate = {
      userId: user.id,
      status,
      timestamp: new Date(),
      lastSeen: status === 'offline' ? new Date() : null
    };

    socket.emit('user:status', statusUpdate);
    
     setUserStatus(prevStatus => ({
        ...prevStatus,
        [statusUpdate.userId]: {
          status: statusUpdate.status,
          lastSeen: statusUpdate.lastSeen,
        }
      }));

  };
  
  useEffect(() => {
    if (!socket || !user) return;

    // Handle incoming messages
    socket.on("private message", async ({ ephemeralPublicKey, from, _id, timestamp, ciphertexts }) => {
      // Add message to state
      const privateKey = localStorage.getItem('privateKey')
      const publicKey = localStorage.getItem('publicKey')
      if (!privateKey || !publicKey) {
        throw new Error("User Keys not found!")
      }
      const plainText = decryptMessageForCurrentUser({ ephemeralPublicKey, ciphertexts }, user.id, privateKey, publicKey)
      setMessages((prev) => [...prev, {
        content: plainText,
        from,
        _id,
        timestamp,
        status: {
          sent: true,
          delivered: false,
          read: false,
          sentAt: new Date()
        }
      }]);

      // Send delivery receipt immediately if online
      socket.emit('message-delivered', {
        messageId: _id,
        to: from,
        deliveredAt: new Date()
      });
    });

    // Handle delivery confirmations
    socket.on("message-delivery-status", ({ messageId, status }) => {
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], ...status }
      }));
    });

    // Handle read receipts
    socket.on("message-read", ({ messageId, timestamp }) => {
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          read: true,
          readAt: timestamp
        }
      }));
    });
    socket.on('user:status_change', (statusUpdate) => {
      // setContacts(prevContacts =>
        
      setUserStatus(prevStatus => ({
        ...prevStatus,
        [statusUpdate.userId]: {
          status: statusUpdate.status,
          lastSeen: statusUpdate.lastSeen,
        }
      }));
    

    });

    // Handle offline queue sync
    socket.on("sync-offline-messages", ({ messages }) => {
      messages.forEach(msg => {
        socket.emit('message-delivered', {
          messageId: msg._id,
          to: msg.from,
          deliveredAt: new Date()
        });
      });
    });


    const handleVisibilityChange = () => {
      const status = document.visibilityState === 'visible' ? 'online' : 'offline';
      updateUserStatus(status);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, user]);

  useEffect(() => {
    const fetchdata = async () => {



      if (user) {
        const peer = new Peer(user.id)
        setUserPeer(peer)
        const socket = io(`${SOCKET_URL}`, { auth: { userID: user.id } })
        setSocket(socket)
        socket.on('users', (users) => {
          setUsers(users)
        })
        socket.on('connect', () => {
          updateUserStatus('online');
        });

        socket.on('disconnect', () => {
          updateUserStatus('offline');
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          updateUserStatus('offline');
        });
        socket.on("user connected", (user) => {
          setUsers(prev => [...prev, user])
        });
        socket.on("room-created", enterRoom)
        socket.on('get-users', getUsers)

        // Add this inside the main socket useEffect

      }
    }
    fetchdata()
  }, [user])

  useEffect(() => {
    requestPermission()

  }, [user])
  useEffect(() => {
    const setupKeys = async () => {
      if (!isSignedIn || !user) return;

      await sodium.ready;
      async function storeKeys(privateKeyBase64, publicKeyBase64) {
        await savePrivateKey(privateKeyBase64);
        await savePublicKey(publicKeyBase64);
      }

      // Check if we already have a private key stored locally
      let privateKey = localStorage.getItem("privateKey");
      let publicKey = localStorage.getItem("publicKey");

      if (!privateKey || !publicKey) {
        // Generate new long-term key pair
        const keyPair = sodium.crypto_kx_keypair(); // X25519

        // Convert to base64 for storage
        const pub64 = sodium.to_base64(keyPair.publicKey);
        const priv64 = sodium.to_base64(keyPair.privateKey);

        await storeKeys(priv64, pub64)
        // Store private key locally
        localStorage.setItem("privateKey", priv64);
        localStorage.setItem("publicKey", pub64);

        publicKey = pub64;
        privateKey = priv64;

        // Send public key to server
        await fetch(`${API_BASE_URL}/api/users/storePublicKey`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            publicKey: pub64,
          }),
        });
      }
    };

    setupKeys();
  }, [isSignedIn, user]);

  const deleteMessage = async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/api/messaging/deleteMessage`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId
      })
    })
    if (response.ok) {

      const json = await response.json()
      return json.msg
    }

  }
  const generateMessageId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `msg_${timestamp}_${random}`;
  };
  const generateEphemeralKeyPair = async () => {
    await sodium.ready;
    const keyPair = sodium.crypto_kx_keypair();
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey)
    };
  };
  const sendMessage = async (content, to) => {
    const messageId = generateMessageId();
    const response = await fetch(`${API_BASE_URL}/api/users/fetchPublicKey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId: to })
    });
    const data = await response.json();
    const recipientPublicKey = data.publicKey

    if (!recipientPublicKey) {
      throw new Error('Recipient public key not found');
    }

    // 2. Generate ephemeral key pair for this message
    const ephemeralKeyPair = await generateEphemeralKeyPair();

    // 3. Get our stored keys
    const senderPrivateKey = localStorage.getItem('privateKey');
    const senderPublicKey = localStorage.getItem('publicKey');
    const encryptFor = (targetPublicKeyBase64) => {
      const { sharedTx } = sodium.crypto_kx_client_session_keys(
        sodium.from_base64(ephemeralKeyPair.publicKey),
        sodium.from_base64(ephemeralKeyPair.privateKey),
        sodium.from_base64(targetPublicKeyBase64)
      );
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(
        sodium.from_string(content),
        nonce,
        sharedTx
      );
      return {
        ciphertext: sodium.to_base64(cipher),
        nonce: sodium.to_base64(nonce)
      };
    };

    if (!senderPrivateKey || !senderPublicKey) {
      throw new Error('Sender keys not found');
    }
    const recipientCipher = encryptFor(recipientPublicKey);
    const senderCipher = encryptFor(senderPublicKey);

    console.log(recipientCipher, 'reci cipher')
    console.log(senderCipher, 'sender cipher')
    const message = {
      _id: messageId,
      ciphertexts: {
        [to]: recipientCipher,
        [user.id]: senderCipher
      },
      ephemeralPublicKey: ephemeralKeyPair.publicKey,
      from: user.id,
      to,
      timestamp: new Date(),
      status: {
        sent: false,
        delivered: false,
        read: false
      }
    };

    // Add to local state immediately
    setMessages(prev => [...prev, { ...message, content }]);

    try {
      // Try to send message
      await socket.emit('private message', message);

      // Update status on success
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: { ...message.status, sent: true, sentAt: new Date() }
      }));
    } catch (error) {
      // Add to offline queue if send fails
      throw new Error(error)
      setOfflineQueue(prev => [...prev, message]);
    }
  };
  const handleContactClick = (userId) => {
    socket.emit("message-read", { userId })
  }


  const sendNotification = async (token, title, body, url) => {
    const response = await fetch(`${API_BASE_URL}/api/fcm/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token, title, body, url
      })
    })
    const json = await response.json()
    return json

  }
  const getToken = async (clerkId) => {
    const response = await fetch(`${API_BASE_URL}/api/fcm/getToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clerkId })
    })
    const json = await response.json()
    const token = json.token
    return token
  }
  return <context.Provider value={{ userStatus, decryptMessagesArray, decryptMessage, sendMessage, handleContactClick, messageStatuses, contacts, setContacts, getToken, deleteContact, sendNotification, deleteMessage, userchanged, setUserChanged, fetchUserById, API_BASE_URL, socket, peers, setPeers, stream, userPeer, setUsers, users, selectedUser, setSelectedUser, user, messages, setMessages }}>
    {children}
  </context.Provider>
}
export default StateProvider