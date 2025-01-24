import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Import, Loader2, Mic, Phone, User2, UserCircle, Video } from 'lucide-react'
import { Button } from './ui/button'
import '../css/videoaudio.css'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
const AudioCall = ({ stream,screenShare,  incomingVidCall, localStream, callType, answerVidCall, isRndSelected, hangUp, sendVidCallInvite, userID, clientPeer: peerID, isCalling, incomingCall, answerCall }) => {
  const audioRef = useRef(null)
  const { fetchUserById } = useContext(context)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const hasVideo = stream && stream.getVideoTracks().length > 0;
  const [selected, setSelected] = useState(peerID)
  const mainaudioRef = useRef(null)
  const mainlocalVidRef = useRef(null)
  const localVidRef = useRef(null)
 
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream
    }
    if (localVidRef.current && localStream) {
      localVidRef.current.srcObject = localStream
    }
    if (mainaudioRef.current && stream) {
      mainaudioRef.current.srcObject = stream
    }

    if (mainlocalVidRef.current && localStream) {
      mainlocalVidRef.current.srcObject = localStream
    }

  }, [stream, localStream, selected])
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

 
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (


    <div className=''>
{incomingCall&& <audio className='hidden' autoPlay loop src='/audio/ringtone.mp3' />}
{isCalling&& <audio className='hidden' autoPlay loop src='/audio/ringing.mp3' />}
     
      <Card className='px-2 py-2 h-full'>
         {stream && hasVideo ? <div className='flex py-2'>
          <div className="max-w-52 video-container cursor-pointer">

          <video onContextMenu={(e) => { e.preventDefault() }}  onClick={() => { setSelected(peerID) }} ref={audioRef} autoPlay className={`video-element rounded-lg ${selected === peerID && 'border border-white'}`} ></video>
          </div>
          <div className="max-w-52 video-container cursor-pointer">

          <video onContextMenu={(e) => { e.preventDefault() }} muted onClick={() => { setSelected(userID) }} ref={localVidRef} autoPlay className={`video-element rounded-lg ${selected === userID && 'border border-white'}`}  ></video>
          </div>

        </div> : stream && <audio ref={audioRef} autoPlay className='hidden'></audio>}


        <Card className='dark:bg-zinc-900 bg-zinc-400' >
 

          {stream && hasVideo ?
            (
              <div className='max-w-[416px]  max-h-[311px]'>
                {
                  selected === userID ?
                  <div className="video-container">

                    <video onContextMenu={(e) => { e.preventDefault() }}  ref={mainlocalVidRef} autoPlay muted className={`video-element rounded-lg  `}  ></video>
                  </div>
                    :
                    <div className='video-container'>

                      <video onContextMenu={(e) => { e.preventDefault() }} ref={mainaudioRef} autoPlay muted className={`video-element rounded-lg  `} ></video>
                    </div>
                }
              </div>
            )
            : <div className="flex gap-2 h-40 justify-center flex-col items-center ">
              <CardTitle className='bg-green-500 animate-pulse px-2 py-2 rounded-lg'>
                {incomingCall&& `Incoming ${callType} call`}
                {isCalling&& `Calling`}
              </CardTitle>
              <UserCircle size={60} />
              <CardTitle className='text-2xl'>

                {isLoading ? <Loader2 className='animate-spin' /> :  user.name  }
              </CardTitle>
            </div>}

        </Card>
        {isRndSelected && !incomingCall && <div className="flex items-center justify-center gap-4 py-3">
          <button onClick={screenShare} disabled={isCalling} className='bg-zinc-800 px-2 py-2 disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

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

          <button onClick={() => answerCall(callType)} className="px-4 py-2 bg-green-500 text-white rounded-lg   w-full justify-center flex hover:bg-green-700">
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
