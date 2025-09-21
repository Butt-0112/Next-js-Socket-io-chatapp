'use client'
import { AspectRatio } from '@radix-ui/react-aspect-ratio'
import React, { useEffect, useRef } from 'react'

const VideoPlayer = ({stream}) => {
    const videoRef = useRef(null)
    useEffect(()=>{
        if(videoRef.current){
            videoRef.current.srcObject = stream
        }
    },[stream])
  return (
    
      <AspectRatio ratio={9/16}>

      <video className='rounded-xl object-cover w-full h-full' ref={videoRef} autoPlay></video>
      </AspectRatio>
    
  )
}

export default VideoPlayer
