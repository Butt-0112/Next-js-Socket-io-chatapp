"use client"
import { context } from '@/context/context'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ModeToggle } from './ModeToggle'
import { Textarea } from './ui/textarea'
import { CalendarDays, PhoneCall, SendHorizonal, SettingsIcon } from 'lucide-react'
import { encryptMessage } from '@/app/encryption/encryptionUtils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogOverlay } from './ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import AudioCall from './AudioCall'
import { Rnd } from 'react-rnd';

const MainChat = () => {
  const { socket, userPeer, setSelectedUser, setUsers, users, selectedUser, user, messages, setMessages } = useContext(context)
  const [message, setMessage] = useState("")
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  // const [messages,setMessages] = useState([])
  const API_BASE_URL = "http://no-knives.gl.at.ply.gg:21223"
  const [callingToPeer, setCallingToPeer] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [incomingCall, setIncomingCall] = useState(false)
  const [streamingCall, setStreamingCall] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [stream, setStream] = useState(null)
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [clientPeer, setClientPeer] = useState(null)
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isRndSelected, setIsRndSelected] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 280, height: 245 })
  const windowRef = useRef(null)
  useEffect(() => {
    const fetchDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputDevices);
    };

    fetchDevices();
  }, []);
  const onMessage = async () => {
    if (message.length > 0) {

      if (selectedUser) {
        console.log(selectedUser)
        // const encryptedMessage = await encryptMessage(message,selectedUser.publicKey)
        socket.emit("private message", {
          content: message,
          to: selectedUser.userID,
        });
        setMessages((prev) => [...prev, { content: message, from: user._id }])
        setMessage("")
      }
    }
  }
  const handleEnterPress = (e) => {

    if (e.key === "Enter" || e.keyCode === 13) { // Check if "Enter" is pressed
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      onMessage();
    }
  };
  useEffect(() => {


    const fetchMessages = async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/fetchMessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        },
        body: JSON.stringify({
          from: user._id,
          to: selectedUser.userID
        })
      })
      if (response.ok) {
        const json = await response.json()
        setMessages(json)
      }
    }
    if (selectedUser && selectedUser.userID && user && user._id) {
      const fetchdata = async () => {

        await fetchMessages()
      }
      fetchdata()
    }
  }, [selectedUser, user])
  const sendCall = () => {
    setClientPeer(selectedUser?.userID)
    if (socket) {

      socket.emit('call', { from: user?._id, to: selectedUser?.userID })

      setCallingToPeer(true)
    }
  }
  useEffect(() => {
    if (socket) {
      socket.on('incoming-call', ({ from, to }) => {
        console.log(to)
        console.log(user?._id)
        setClientPeer(from)
        setIncomingCall(true)
      })
      socket.on('call-ended-from', ({ to }) => {
        setCallEnded(true)
        setIncomingCall(false)
        setCallingToPeer(false)
        setStreamingCall(false)
        setIsRndSelected(true)
      })
      socket.on('call-answered', ({ from, remoteStream }) => {
        setAnswered(true)
        setCallingToPeer(false)
        try {
          navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDeviceId } }).then(localStream => {
            // setStream(localStream)
            localStreamRef.current = localStream
            console.log(from)
            console.log(userPeer?._id, 'user peer detected')
            console.log(selectedUser, 'client peer detected')
            const call = userPeer.call(from, localStream);
            console.log('initiating peer call to', from, 'with stream', localStreamRef.current)
            call.on('stream', (remoteStream) => {
              remoteStreamRef.current = remoteStream
              console.log('received remote stream', remoteStream.id)
              setStreamingCall(true)

            })
          })
        } catch (e) {
          console.error(e)
        }
        console.log('getting answer from client')
        socket.emit('stream', { from: user?._id, stream: localStreamRef.current, to: clientPeer })
      })
      userPeer.on('call', (call) => {
        try {
          navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDeviceId } }).then(localStream => {
            console.log('send stream', localStream, 'as answer')
            localStreamRef.current = localStream
            setStreamingCall(true)
            setIncomingCall(false)
            console.log(userPeer._id, 'peer answering the call with stream', localStreamRef.current)
            call.answer(localStream)
            call.on('stream', (remoteStream) => {
              remoteStreamRef.current = remoteStream
              console.log('received remote stream', remoteStream.id)

            })
          })
        } catch (e) {
          console.error(e)
        }
      })
    }
  }, [socket])
  const hangUpCall = () => {
    if (socket) {
      console.log(clientPeer)
      socket.emit('call-ended', { to: clientPeer })
      setIncomingCall(false)
      setCallingToPeer(false)
      setIsRndSelected(true)
      setStreamingCall(false)
    }
  }
  const AnswerCall = () => {

    if (socket) {

      socket.emit('answer', { from: user?._id, to: clientPeer })

    }
  }
  useEffect(() => {
    console.log(streamingCall)
    console.log(callEnded)
    console.log(answered)
    console.log(selectedDeviceId)
    console.log(audioDevices)
  }, [streamingCall, audioDevices, callEnded, answered, selectedDeviceId])
  const handleRndClick = (e) => {
    // e.stopPropagation();
    setIsRndSelected(true);

  };

  const handleClickOutside = (e) => {
    if (windowRef.current && !(windowRef.current.contains(e.target))) {
      setIsRndSelected(false)
    }
  }
  useEffect(() => {
    if (streamingCall) {

      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [streamingCall]);


  return (
    <div className=' h-[100vh]' style={{ display: 'grid', gridTemplateRows: "1fr 9fr 1fr", gridTemplateAreas: "'head''main''foot'", width: 'calc(100vw-14rem)' }}>
      <div className='flex items-center p-[8px] border-b' style={{ gridArea: 'head' }}>
        <div className='flex flex-col h-full justify-center w-full'>

        <div className='flex'>

          {selectedUser?.userID && <div className='flex justify-between items-center w-full'>

            <h3 className="font-bold">

              {selectedUser?.name}
            </h3>
            <Button onClick={sendCall} variant='outline'>

            <PhoneCall  />
            </Button>
          </div>}
          <ModeToggle />
        </div>
        
        <div className='h-4 flex items-center justify-center'>
        {streamingCall&&!isRndSelected&&
          <div onClick={handleRndClick} className='bg-green-600 w-full text-center rounded-lg font-semibold cursor-pointer hover:bg-green-700 text-white text-sm'>Ongoing call....</div>
        }
        </div>
        </div>
      </div>
      <div className='h-[100%]' style={{ gridArea: 'main', overflowY: 'auto' }}>
        {selectedUser.userID ? messages.length > 0 && messages.map((message, index) => {
          return <div className={`${message.from === user._id ? 'bg-slate-400 dark:bg-zinc-900' : 'bg-slate-500 dark:bg-black'} dark:text-white`} style={{
            float: message.from === user._id ? 'right' : 'left',
            clear: 'both', // Ensure proper stacking
            padding: '8px 12px',
            borderRadius: '12px',
            maxWidth: '70%',
            wordWrap: 'break-word',
            margin: '4px 10px',
            whiteSpace: 'pre-wrap'
          }} key={index + 1}>{`${message.content}`}</div>
        }) : <div>please open a chat</div>}
      </div>
      {selectedUser.userID && <div style={{ gridArea: 'foot', position: 'sticky', bottom: '0', backdropFilter: 'blur(100px)' }} className='flex items-center w-full border-t'>
        <div className="flex gap-2 w-full items-center">

          {/* <Input   onKeyPress={handleEnterPress}   onKeyDown={(e)=>handleEnterPress(e)} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." /> */}
          <Textarea className='resize-none min-h-[50px] h-[40px] max-h-[60px] rounded-[40px]' onKeyPress={handleEnterPress} onKeyDown={(e) => handleEnterPress(e)} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
          <Button className=" h-[50px] border rounded-[50%]" variant="outline" onClick={e => { e.preventDefault(); onMessage() }}><SendHorizonal /></Button>
        </div>
      </div>}
      <div>

      </div>
      <DialogPrimitive.Root open={incomingCall} onOpenChange={setIncomingCall}>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center">
          {<div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <DialogPrimitive.Title className="text-lg font-bold">Incoming Call</DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2">
              You have an incoming call from {selectedUser?.name}.
            </DialogPrimitive.Description>
            <div className="flex gap-1 mt-4">
              <Button onClick={AnswerCall} >
                Answer
              </Button>
              <Button onClick={hangUpCall} className='bg-red-800' >
                Hang up
              </Button>
            </div>
          </div>}

        </DialogPrimitive.Content>
      </DialogPrimitive.Root>
      <DialogPrimitive.Root open={callingToPeer} onOpenChange={setCallingToPeer}>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <DialogPrimitive.Title className="text-lg font-bold">Calling</DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2">
              Calling to {selectedUser?.name}.
            </DialogPrimitive.Description>
            <div className="mt-4">
              {/* { <AudioCall userID={user?._id} stream={remoteStreamRef.current} />} */}

              <button onClick={hangUpCall} className="px-4 py-2 bg-blue-500 text-white rounded">
                Hang Up
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Root>

      {streamingCall &&
        <div className={`absolute ${isRndSelected ? 'fixed inset-0 h-full w-full flex justify-center items-center' : 'hidden'} min-w-[200px] min-h-[200px]  `}
        // Rnd
        //   default={{
        //     x: 100,
        //     y: 100,


        //   }}
        //   size={{ width: windowSize.width, height:windowSize.height}}

        //   position={windowPostion}
        //   disableDragging={true}

        //   bounds="body" 
        //   enableResizing={false}

        //   className={`rounded-lg ${!isRndSelected && ' cursor-pointer '}`}
        //   onClick={handleRndClick}

        >
          <div ref={windowRef} onClick={handleRndClick} className={`  min-w-[200px] min-h-[200px] ${!isRndSelected && ' cursor-pointer '}`}>


            {<AudioCall isRndSelected={isRndSelected} userID={user?._id} hangUp={hangUpCall} clientPeer={clientPeer} stream={remoteStreamRef.current} />}
            {/* <div>
              <h3>Select Audio Input Device</h3>
              <select onChange={(e) => setSelectedDeviceId(e.target.value)} className='w-full' value={selectedDeviceId}>
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId}`}
                  </option>
                ))}
              </select>
            </div> */}

          </div>
        </div>}
    </div>
  )
}

export default MainChat
