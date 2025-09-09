// Mobile-optimized AudioCall component
import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card } from './ui/card'
import { Import, Loader2, Mic, MicOff, Phone, UserCircle, Video, VideoOff } from 'lucide-react'
import Image from 'next/image'

const MobileAudioCall = ({ 
  mainaudioRef, 
  audioRef, 
  mainlocalVidRef, 
  localVidRef,
  stream,
  muted,
  EnableVid,
  DisableVid,
  videoDisabled,
  handleMute,
  handleUnmute,
  screenShare,
  localStream,
  callType,
  hangUp,
  sendVidCallInvite,
  userID,
  clientPeer: peerID,
  isCalling,
  incomingCall,
  answerCall 
}) => {
  const { fetchUserById } = useContext(context)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [mutedbyme, setMutedByMe] = useState(false)
  const [toggleVid, setToggleVid] = useState(false)
  const hasVideo = stream && stream.getVideoTracks().length > 0

  useEffect(() => {
    const fetchUser = async () => {
      const user = await fetchUserById(peerID)
      setUser(user)
      setIsLoading(false)
    }
    if (peerID) fetchUser()
  }, [peerID])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Display */}
      {stream && hasVideo ? (
        <div className="h-full relative">
          <video 
            ref={mainaudioRef}
            autoPlay 
            className="h-full w-full object-cover"
            onContextMenu={(e) => e.preventDefault()}
          />
          <video
            ref={localVidRef}
            autoPlay
            muted
            className="absolute top-4 right-4 w-28 rounded-lg border border-white"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
          {user?.imageUrl ? (
            <Image 
              src={user.imageUrl} 
              width={120} 
              height={120} 
              alt={user.username}
              className="rounded-full mb-4"
            />
          ) : (
            <UserCircle size={120} className="mb-4" />
          )}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {isLoading ? <Loader2 className="animate-spin" /> : user?.username}
          </h2>
          <p className="text-gray-400">
            {incomingCall ? `Incoming ${callType} call...` : isCalling ? 'Calling...' : ''}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center gap-6">
          {stream && hasVideo && (
            <button 
              onClick={() => {
                toggleVideoStream()
                toggleVid ? EnableVid() : DisableVid()
              }}
              className="p-4 rounded-full bg-zinc-800 text-white"
            >
              {toggleVid ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}
          
          <button
            onClick={() => {
              setMutedByMe(!mutedbyme)
              mutedbyme ? handleUnmute() : handleMute()
            }}
            className="p-4 rounded-full bg-zinc-800 text-white"
          >
            {mutedbyme ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            onClick={hangUp}
            className="p-4 rounded-full bg-red-500 text-white"
          >
            <Phone style={{ transform: 'rotate(135deg)' }} size={24} />
          </button>
        </div>
      </div>

      {/* Incoming Call Controls */}
      {incomingCall && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex gap-4">
          <button
            onClick={() => answerCall(callType)}
            className="flex-1 py-4 bg-green-500 text-white rounded-full"
          >
            <Phone size={24} className="mx-auto" />
          </button>
          <button
            onClick={hangUp}
            className="flex-1 py-4 bg-red-500 text-white rounded-full"
          >
            <Phone size={24} className="mx-auto rotate-135" />
          </button>
        </div>
      )}
    </div>
  )
}

export default MobileAudioCall