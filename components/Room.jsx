'use client'
import { context } from '@/context/context'
import React, { useContext, useEffect,useRef, useState } from 'react'
import { Alert, AlertDescription } from './ui/alert'
import { AlertCircle } from 'lucide-react'
import VideoPlayer from './VideoPlayer'

const Room = ({roomId}) => {
  const {socket, user ,stream,peers,setPeers} = useContext(context)
  const hasJoinedRoom = useRef(false); // Use a ref to track if the room has been joined
  const [alert,setAlert]  =useState('')
  useEffect(() => {
    if (socket && roomId && user&& !hasJoinedRoom.current) {
      socket.emit('join-room', { roomId ,userId:user?._id});
      hasJoinedRoom.current = true; // Set the flag to true after emitting the event
    }
    if(socket){
      socket.on("member-disconnected",({userId})=>{
        setAlert(`${userId} left the room!`)
        setPeers(prev => {
          const updatedPeers = { ...prev }
          delete updatedPeers[userId]
          return updatedPeers
        })
      })
    }
  }, [socket, roomId,user]); // Add socket and roomId as dependencies

  return (
    <div>{ alert&&
      <Alert>
        
        <AlertCircle />        
        <AlertDescription>
          {alert}
        </AlertDescription>
      </Alert>}
      Room Joined - {roomId}
      <div className="flex justify-center">

      <VideoPlayer stream={stream} />
      </div>
      <div className="grid grid-cols-4">

      {Object.values(peers).map((peerStream, index) => (
        <VideoPlayer key={index} stream={peerStream} />
      ))}
      </div>
    </div>
  )
}

export default Room
