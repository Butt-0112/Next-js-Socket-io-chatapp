import { context } from '@/context/context'
import React, { useRef, useEffect, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Import, Loader2, Mic, MicOff, Phone, User2, UserCircle, Video, VideoOff } from 'lucide-react'
import { Button } from './ui/button'
import '../css/videoaudio.css'
import { AspectRatio } from "@/components/ui/aspect-ratio"

const AudioCall = ({mainaudioRef,audioRef,mainlocalVidRef,localVidRef,stream,muted,EnableVid,DisableVid, videoDisabled,handleMute,handleUnmute, screenShare, isScreenSharing, incomingVidCall, localStream, callType, answerVidCall, isRndSelected, hangUp, sendVidCallInvite, userID, clientPeer: peerID, isCalling, incomingCall, answerCall }) => {
 
  const { fetchUserById } = useContext(context)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const hasVideo = stream && stream.getVideoTracks().length > 0;
  const [selected, setSelected] = useState(peerID)
 
  const ringtoneRef = useRef(null)
  const [mutedbyme,setMutedByMe] = useState(false)
  const [toggleVid,setToggleVid] = useState(false)
const [ringtoneAudio] = useState(new Audio())
const [callEnded,setCallEnded]  =useState(false)
  useEffect(() => {
    console.log(isScreenSharing)
    if (audioRef.current && stream) {
      if(muted){
        console.log(stream, ' prev stream',stream.getAudioTracks())
        stream.getAudioTracks().forEach(track=> {
          track.enabled = false
          console.log('setting muted stream')
        });
        
     
      }else{
        stream.getAudioTracks().forEach(track=> {
          console.log('setting new stream')
          track.enabled = true
        });

      }
      if(videoDisabled){
        console.log('disabling video')
        stream.getVideoTracks().forEach(track=> {
          track.enabled = false
        });
        
      }else{
        console.log('enabling video')
        stream.getVideoTracks().forEach(track=> {
          track.enabled = true 
        });
      }
    
      audioRef.current.srcObject = stream
    }
    if (localVidRef.current && localStream) {
      if(toggleVid){
        console.log('disabling video')
        localStream.getVideoTracks().forEach(track=> {
          track.enabled = false
        });
        
      }else{
        console.log('enabling video')
        localStream.getVideoTracks().forEach(track=> {
          track.enabled = true 
        });
      }
      localVidRef.current.srcObject = localStream
    }
    if (mainaudioRef.current && stream) {
      if(videoDisabled){
        console.log('disabling video')
        stream.getVideoTracks().forEach(track=> {
          track.enabled = false
        });
        
      }else{
        console.log('enabling video')
        stream.getVideoTracks().forEach(track=> {
          track.enabled = true 
        });
      }
      mainaudioRef.current.srcObject = stream
    }

    if (mainlocalVidRef.current && localStream) {
      if(toggleVid){
        console.log('disabling video')
        localStream.getVideoTracks().forEach(track=> {
          track.enabled = false
        });
        
      }else{
        console.log('enabling video')
        localStream.getVideoTracks().forEach(track=> {
          track.enabled = true 
        });
      }
      mainlocalVidRef.current.srcObject = localStream
    }

  }, [stream, isScreenSharing, localStream, selected,muted,videoDisabled,toggleVid])
  
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
 
const toggleVideoStream = ()=>{
  setToggleVid(!toggleVid)
}
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  useEffect(()=>{
    console.log(muted)
    if(audioRef.current){
      audioRef.current.muted=muted
      console.log('set muted')
    }
  },[muted])
  return (


    <div className='max-w-screen-lg '>
      {incomingCall && <audio ref={ringtoneRef} className='hidden' autoPlay loop src='/audio/ringtone.mp3' /> }
 
      {isCalling && <audio className='hidden' autoPlay loop src='/audio/ringing.mp3' />}

      <Card className='px-2 py-2 h-full'>
        {stream && hasVideo ? <div className='flex justify-center gap-[8px]'>

          <div className='relative'>
            <span className='absolute flex justify-around overflow-hidden items-center font-semibold bg-[#00000082] inset-0'>

              {user.username}
            </span>

            <video onContextMenu={(e) => { e.preventDefault() }} onClick={() => { setSelected(peerID) }} ref={audioRef} autoPlay className={`object-cover cursor-pointer size-20 rounded-lg ${selected === peerID && 'border border-white'}`} ></video>
          </div>
          <div className='relative'>
            <span className='absolute flex justify-center items-center font-semibold bg-[#00000082] inset-0'>

              You
            </span>

            <video onContextMenu={(e) => { e.preventDefault() }} muted onClick={() => { setSelected(userID) }} ref={localVidRef} autoPlay className={`object-cover cursor-pointer size-20 rounded-lg ${selected === userID && 'border border-white'}`}  ></video>
          </div>
        </div> : stream && <audio  ref={audioRef} autoPlay className='hidden'></audio>}

        <Card className='dark:bg-zinc-900 bg-zinc-400' >
          {stream && hasVideo ?
            (
              <div className='max-h-[70vh]'>
                {
                  selected === userID ?
                    <div className=" ">
                      <video onContextMenu={(e) => { e.preventDefault() }} ref={mainlocalVidRef} autoPlay muted className={`rounded-lg max-h-[70vh] aspect-video`}  ></video>
                    </div>
                    :
                    <div className="">
                      <video onContextMenu={(e) => { e.preventDefault() }} ref={mainaudioRef} autoPlay muted className={`rounded-lg max-h-[70vh] aspect-video`} ></video>
                    </div>
                }
              </div>
            )
            : <div className="flex gap-2 h-40 justify-center flex-col items-center ">
              {(incomingCall || isCalling) && <CardTitle className='bg-green-500 animate-pulse px-2 py-2 rounded-lg'>
                {incomingCall && `Incoming ${callType} call`}
                {isCalling && `Calling`}
              </CardTitle>}
              <UserCircle size={60} />
              <CardTitle className='text-2xl'>

                {isLoading ? <Loader2 className='animate-spin' /> : user?.username || user?.firstName || user?.email}
              </CardTitle>
            </div>}

        </Card>
        {isRndSelected && !incomingCall && <div className="flex items-center justify-center gap-4 py-3">
          <button onClick={screenShare} disabled={isCalling} className='bg-zinc-800 px-2 py-2 disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Import className='rotate-180' size={25} />
          </button>
         {stream&&hasVideo? !toggleVid? 
         <button onClick={()=>{toggleVideoStream();DisableVid()}} disabled={isCalling} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Video size={25} />
          </button>
          :
         <button onClick={()=>{toggleVideoStream();EnableVid()}} disabled={isCalling} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <VideoOff size={25} />
          </button>
          :
         <button onClick={()=>{sendVidCallInvite(user)}} disabled={isCalling} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Video size={25} />
          </button>
          }
            {mutedbyme?
          <button disabled={isCalling} onClick={()=>{ setMutedByMe(false);handleUnmute()}} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <MicOff size={25}  />
          </button>

            :  <button disabled={isCalling} onClick={()=>{handleMute(); setMutedByMe(true)}} className='bg-zinc-800 px-2 py-2  disabled:text-gray-400 disabled:hover:bg-zinc-800 disabled:cursor-no-drop text-white rounded-full hover:bg-zinc-700'>

            <Mic size={25}  />
              </button>
          }
          <button onClick={()=>{hangUp();setCallEnded(true)}} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
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
