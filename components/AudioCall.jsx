import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Import, Loader2, Mic, Phone, User2, UserCircle, Video } from 'lucide-react'
import { Button } from './ui/button'

const AudioCall = ({ stream,incomingVidCall,callType, answerVidCall, isRndSelected, hangUp, sendVidCallInvite, userID, clientPeer: peerID, isCalling, incomingCall, answerCall }) => {
  const audioRef = useRef(null)
  const { fetchUserById } = useContext(context)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const hasVideo = stream && stream.getVideoTracks().length > 0;

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream
    }
  }, [stream])
  useEffect(() => {
    const fetchUser = async () => {

      const user = await fetchUserById(peerID)
      setUser(user)
      setIsLoading(false)
    }
    if (peerID) {
      fetchUser()
    }
  }, [peerID])




  return (


    <div className=''>

{stream && hasVideo ? (
      <video ref={audioRef} autoPlay  ></video>
    ) : stream&& (
      <audio ref={audioRef} autoPlay className='hidden'></audio>
    )}

      <Card className='px-2 py-2 h-full'>


        <Card className='dark:bg-zinc-900 bg-zinc-400' >

          <div className="flex gap-2 h-40 justify-center flex-col items-center ">

            <UserCircle size={60} />
            <CardTitle className='text-2xl'>

              {isLoading ? <Loader2 className='animate-spin' /> : isCalling ? `Calling to ${user.name}` : user.name}
            </CardTitle>
          </div>
         {incomingVidCall&& <div>
            <Button onClick={answerVidCall} > Answer vid call</Button>
          </div>}
        </Card>
        {isRndSelected && !incomingCall && <div className="flex items-center justify-center gap-4 py-3">
          <button disabled={isCalling} className='bg-zinc-800 px-2 py-2 disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Import className='rotate-180' size={25} />
          </button>
          <button onClick={sendVidCallInvite} disabled={isCalling} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Video size={25} />
          </button>
          <button disabled={isCalling} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Mic size={25} />
          </button>
          <button onClick={hangUp} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
            <Phone style={{ rotate: '135deg' }} />
          </button>

        </div>}
        {isRndSelected && incomingCall && <div className='flex items-center justify-center gap-2   py-3'>

          <button onClick={()=> answerCall(callType)} className="px-4 py-2 bg-green-500 text-white rounded-lg w-full justify-center flex hover:bg-green-700">
            <Phone />
          </button>
          <button onClick={hangUp} className="px-4 py-2 bg-red-500 text-white rounded-lg w-full justify-center flex hover:bg-red-700">
            <Phone style={{ rotate: '135deg' }} />
          </button>
        </div>}
      </Card>
    </div>
  )
}

export default AudioCall
