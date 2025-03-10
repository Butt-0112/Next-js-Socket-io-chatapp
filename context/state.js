"use client"
import { useEffect, useId, useState } from "react";
import { context } from "./context";
import { connect, io } from "socket.io-client";
import { decryptMessage, decryptPrivateKey } from "@/app/encryption/encryptionUtils";
import { useNavigate, useNavigation } from "react-router-dom";
import { useRouter } from "next/navigation";
import { getFCMToken } from "@/lib/firebase";
 
import Peer from "peerjs";
import { useUser } from "@clerk/nextjs";
const StateProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [users, setUsers] = useState([])
  // const [user, setUser] = useState({})
  const [selectedUser, setSelectedUser] = useState({})
  const [messages, setMessages] = useState([])
  const API_BASE_URL =process.env. NEXT_PUBLIC_SOCKET_BACKEND_URL
  console.log(API_BASE_URL)
  const SOCKET_URL = process.env. NEXT_PUBLIC_SOCKET_BACKEND_URL
  // const SOCKET_URL = "http://me-visited.gl.at.ply.gg:21227"
  const [userPeer, setUserPeer] = useState(null)
  const router = useRouter()
  const [stream,setStream] = useState(null)
  const [peers, setPeers] = useState({});
  const [userchanged,setUserChanged] = useState(false)
  const {user} = useUser()
  const sendTokenToServer = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/fcm/default-token`, {
      method: 'POST',
      body: JSON.stringify({ token ,clerkId:user.id}),
      headers: {
        'Content-Type': 'application/json',
      },
    });
   const json = await response.json()
  };
  async function requestPermission() {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      if(user){

        const token = await getFCMToken()
        if(token){

          await sendTokenToServer(token)
        }
        console.log('token gen', token)
      }
    } else if (permission === 'denied') {
      // alert('you denied for the permission')
    }
  }
  
  useEffect(()=>{
    requestPermission()
    
  },[user])
  const fetchUserById = async(id)=>{
    const response = await fetch(`${API_BASE_URL}/api/users/getUserbyId`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        userId:id
      })

    })
    if (response.ok) {
      const json = await response.json()
      return json

    }
  }
  const fetchUser = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/getuser`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },

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
 
  const showNotification = (title, body, from) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification(title, {
          body,
          actions: [{ action: 'reply', title: 'Reply' }],
          data: { from }
        });
      });
    }
  };
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

        socket.on("private message", async ({ content, from,_id }) => {


          setMessages((prev) => [...prev, { content: content, from ,_id}])
          socket.emit('message-delivered',{messageId:_id, delivered:true})
           
        });
        socket.on("user connected", (user) => {
          setUsers(prev => [...prev, user])
        });
        socket.on("room-created", enterRoom)
        socket.on('get-users', getUsers)
        
      }
    }
    fetchdata()
  }, [user])
  const deleteMessage = async(messageId)=>{
    const response = await fetch(`${API_BASE_URL}/api/messaging/deleteMessage`,{
      method:"DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        messageId
      })
    })
    if(response.ok){

      const json = await response.json()
      return json.msg
    }
    
  }
  useEffect(()=>{
    if(!socket)return
    if(!userPeer)return
    if(!stream)return
    // socket.on('user-join', ({ userId }) => {
    //   const call = userPeer.call(userId, stream);
    //   call.on('stream', (remoteStream) => {
    //     setPeers(prev => ({ ...prev, [userId]: remoteStream }));
    //   });
    // });

    // userPeer.on('call', (call) => {
    //   call.answer(stream);
    //   call.on('stream', (remoteStream) => {
    //     setPeers(prev => ({ ...prev, [call.peer]: remoteStream }));
    //   });
    // });

  },[socket,userPeer,stream])
  const sendNotification =  async(token,title,body,url)=>{
    const response = await fetch(`${API_BASE_URL}/api/fcm/send-notification`,{
    method:'POST',
    headers:{
    'Content-Type':'application/json'
    },
    body:JSON.stringify({
      token,title,body,url
    })
    })
    const json = await response.json()
    return json
    
  }
  const getToken = async(clerkId)=>{
    const response = await fetch(`${API_BASE_URL}/api/fcm/getToken`,{
    method:'POST',
    headers:{
    'Content-Type':'application/json'
    },
    body:JSON.stringify({clerkId})
    })
    const json  = await response.json()
    const token = json.token
    return token
  }
  return <context.Provider value={{getToken,sendNotification,deleteMessage,userchanged,setUserChanged,fetchUserById,API_BASE_URL,fetchUser, socket,peers,setPeers,stream, userPeer, setUsers, users, selectedUser, setSelectedUser, user, messages, setMessages }}>
    {children}
  </context.Provider>
}
export default StateProvider