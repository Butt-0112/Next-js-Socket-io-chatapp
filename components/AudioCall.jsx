import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Import, Mic, Phone, User2, UserCircle, Video } from 'lucide-react'
import { Button } from './ui/button'
import { dotPulse } from 'ldrs'

dotPulse.register()

// Default values shown

const AudioCall = ({ stream, isRndSelected, hangUp, userID, clientPeer: peerID }) => {
  const audioRef = useRef(null)
  const { fetchUserById } = useContext(context)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (audioRef.current) {
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
      {/* {!isRndSelected && (
          <div className=" rounded-lg absolute h-[90%] w-full bg-black bg-opacity-50 z-10 pointer-events-none"></div>
        )} */}
      <audio ref={audioRef} autoPlay className='hidden'></audio>

      {/* <p className='w-full'>

      playing stream {stream?.id} of Peer {peerID}
      </p> */}
      <Card className='px-2 py-2 h-full'>


        <Card className='dark:bg-zinc-900 bg-zinc-400' >

          <div className="flex gap-2 h-40 justify-center flex-col items-center ">

            <UserCircle size={60} />
            <CardTitle className='text-2xl'>

              {isLoading ? <l-dot-pulse
                size="43"
                speed="1.3"
                color="white"
              ></l-dot-pulse> : user.name}
            </CardTitle>
          </div>
        </Card>
        {isRndSelected && <div className="flex items-center justify-center gap-4 py-3">
          <button className='bg-zinc-800 px-2 py-2 text-white rounded-full hover:bg-zinc-700'>

            <Import className='rotate-180' size={25} />
          </button>
          <button className='bg-zinc-800 px-2 py-2 text-white rounded-full hover:bg-zinc-700'>

            <Video size={25} />
          </button>
          <button className='bg-zinc-800 px-2 py-2 text-white rounded-full hover:bg-zinc-700'>

            <Mic size={25} />
          </button>
          <button onClick={hangUp} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
            <Phone style={{ rotate: '135deg' }} />
          </button>

        </div>}
      </Card>
    </div>
  )
}

export default AudioCall
