"use client"
import { context } from '@/context/context'
import React, { useContext } from 'react'
import { Button } from './ui/button'

const JoinRoom = () => {
    const {socket,user} = useContext(context)
    const createRoom = ()=>{
        if(socket&&user){

            socket.emit('create-room',{userId:user?._id})
        }
       
    }
  return (
    <div>
        <div className="flex justify-center items-center h-[100vh]">
            <Button onClick={createRoom}>Create Room</Button>
        </div>
    </div>
  )
}

export default JoinRoom
