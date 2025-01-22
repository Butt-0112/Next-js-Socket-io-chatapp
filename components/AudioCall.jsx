import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Import, Loader2, Mic, Phone, User2, UserCircle, Video } from 'lucide-react'
import { Button } from './ui/button'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
const AudioCall = ({ stream, incomingVidCall, localStream, callType, answerVidCall, isRndSelected, hangUp, sendVidCallInvite, userID, clientPeer: peerID, isCalling, incomingCall, answerCall }) => {
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




  return (


    <div className=''>


      {/* {stream&&hasVideo?<Tabs defaultValue={peerID} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value={peerID}>
           {peerID}
          </TabsTrigger>
        <TabsTrigger value={userID}>{userID}    </TabsTrigger>
      </TabsList>
      <TabsContent value={peerID}>
        other stream {peerID}
        <Card>
        <video ref={audioRef} autoPlay    ></video>
        </Card>
      </TabsContent>
      <TabsContent value={userID}>
        my stream {userID}
        <Card>
        <video ref={localVidRef} autoPlay muted  ></video>
         
        </Card>
      </TabsContent>
    </Tabs>
:stream&& <audio ref={audioRef} autoPlay className='hidden'></audio>} */}

      <Card className='px-2 py-2 h-full'>
        {stream && hasVideo ? <div className='flex py-2'>
          <video onContextMenu={() => { return }} onClick={() => { setSelected(peerID) }} ref={audioRef} autoPlay className={`max-w-52 rounded-lg ${selected === peerID && 'border border-white'}`} ></video>
          <video onContextMenu={() => { return }} onClick={() => { setSelected(userID) }} ref={localVidRef} autoPlay className={`max-w-52 rounded-lg ${selected === userID && 'border border-white'}`}  ></video>

        </div> : stream && <audio ref={audioRef} autoPlay className='hidden'></audio>}


        <Card className='dark:bg-zinc-900 bg-zinc-400' >
          {/* {stream && !hasVideo && (
      <video ref={audioRef} autoPlay   className='max-w-'></video>
    ) : stream&& (
     
    )
  } */}

          {stream && hasVideo ?
            (
              <div className='max-w-[416px] max-h-[311px]'>
                {
                  selected === userID ?

                    <video onContextMenu={() => { return }}  ref={mainlocalVidRef} autoPlay muted className={`max-w-[416px] max-h-[311px] rounded-lg  `}  ></video>
                    :
                    <video onContextMenu={() => { return }} ref={mainaudioRef} autoPlay muted className={`max-w-[416px] max-h-[311px] rounded-lg  `} ></video>
                }
              </div>
            )
            : <div className="flex gap-2 h-40 justify-center flex-col items-center ">

              <UserCircle size={60} />
              <CardTitle className='text-2xl'>

                {isLoading ? <Loader2 className='animate-spin' /> : isCalling ? `Calling to ${user.name}` : user.name}
              </CardTitle>
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

          <button onClick={() => answerCall(callType)} className="px-4 py-2 bg-green-500 text-white rounded-lg w-full justify-center flex hover:bg-green-700">
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
