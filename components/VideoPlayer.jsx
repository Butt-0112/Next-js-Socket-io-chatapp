'use client'
import React, { useEffect, useRef } from 'react'

const VideoPlayer = ({stream}) => {
    const videoRef = useRef(null)
    useEffect(()=>{
        if(videoRef.current){
            videoRef.current.srcObject = stream
        }
    },[stream])
  return (
    <div>
      <video className='rounded-xl' ref={videoRef} autoPlay></video>
    </div>
  )
}

export default VideoPlayer
