"use client"
import { useEffect, useId, useState } from "react";
import { context } from "./context";
import { io } from "socket.io-client";
import { decryptMessage, decryptPrivateKey } from "@/app/encryption/encryptionUtils";
import { useNavigate, useNavigation } from "react-router-dom";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
const StateProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [users, setUsers] = useState([])
  const [user, setUser] = useState({})
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
  useEffect(() => {
    console.log(selectedUser)
  }, [selectedUser])
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
  const token = localStorage.getItem('token')
  useEffect(() => {
    const fetchdata = async () => {
      if (!token) { return }
      const user = await fetchUser()
      console.log(user)
      setUser(user)
      const peer = new Peer(user._id)
      setUserPeer(peer)
      // try{
      //   navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(stream=>setStream(stream))
      // }catch(e){
      //   console.error(e)
      // }
      if (user) {
        const socket = io(`${SOCKET_URL}`, { auth: { userID: user._id } })
        setSocket(socket)
        socket.on('users', (users) => {
          setUsers(users)
        })

        socket.on("private message", async ({ content, from }) => {


          setMessages((prev) => [...prev, { content: content, from }])


        });
        socket.on("user connected", (user) => {
          setUsers(prev => [...prev, user])
        });
        socket.on("room-created", enterRoom)
        socket.on('get-users', getUsers)
        // return () => {
        //   socket.disconnect()
        // }
      }
    }
    fetchdata()
  }, [token])

  useEffect(()=>{
    if(!socket)return
    if(!userPeer)return
    if(!stream)return
    socket.on('user-join', ({ userId }) => {
      const call = userPeer.call(userId, stream);
      call.on('stream', (remoteStream) => {
        setPeers(prev => ({ ...prev, [userId]: remoteStream }));
      });
    });

    userPeer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (remoteStream) => {
        setPeers(prev => ({ ...prev, [call.peer]: remoteStream }));
      });
    });

  },[socket,userPeer,stream])
  return <context.Provider value={{fetchUserById,API_BASE_URL,fetchUser, socket,peers,setPeers,stream, userPeer, setUsers, users, selectedUser, setSelectedUser, user, messages, setMessages }}>
    {children}
  </context.Provider>
}
export default StateProvider