"use client";
import { context } from "@/context/context";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";
import { Textarea } from "./ui/textarea";
import {

  PhoneCall,
  SendHorizonal,
  Video,

} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import AudioCall from "./AudioCall";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
const fetchUsers = async () => {
  const res = await fetch(`/api/users/user`, {
    method: "GET"
  })

  return await res.json()
}

const MainChat = () => {
  const {
    socket,
    userPeer,
    setSelectedUser,
    setUsers,
    users,
    selectedUser,
    user,
    messages,
    setMessages,
    deleteMessage
  } = useContext(context);
  const [message, setMessage] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedMessage,setSelectedMessage] = useState(null)
  // const [messages,setMessages] = useState([])
  const [callingToPeer, setCallingToPeer] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [streamingCall, setStreamingCall] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [vidCalling, setVidCalling] = useState(false)
  const [incomingVidCall, setIncomingVidCall] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [clientPeer, setClientPeer] = useState(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [callType, setCallType] = useState('audio')
  const [isRndSelected, setIsRndSelected] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 280, height: 245 });
  const windowRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false)
  const [deleteFor,setDeleteFor] = useState('forme')
  const onMessage = async () => {
    if (message.length > 0) {
      if (selectedUser) {
        console.log(selectedUser);
        socket.emit("private message", {
          content: message,
          to: selectedUser.clerkId,
        });
        setMessages((prev) => [...prev, { content: message, from: user.id }]);
        setMessage("");
      }
    }
  };
  const handleCloseDialog= ()=>{
    setIsDeletionDialogOpen(false)
    setSelectedMessage(null)
  }
  const handleEnterPress = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      // Check if "Enter" is pressed
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      onMessage();
    }
  };

  const sendCall = (type) => {
    setClientPeer(selectedUser?.clerkId);
    if (socket) {
      socket.emit("call", { from: user?.id, to: selectedUser?.clerkId, type });

      setCallingToPeer(true);
    }
  };
  const sendVidCallInvite = () => {
    if (!clientPeer) {
      setClientPeer(selectedUser?.clerkId)
    }
    if (socket) {
      socket.emit("vid-call", { from: user?.id, to: !clientPeer ? selectedUser?.clerkId : clientPeer })
      setVidCalling(true)
    }
  }
  const AnswerCall = (type) => {
    if (socket) {
      socket.emit("answer", { from: user?.id, to: clientPeer, type });
    }
  };
  const AnswerVidCall = () => {
    if (socket) {
      socket.emit("answer-vid-call", { from: user?.id, to: clientPeer });
    }
  };

  const hangUpCall = () => {
    if (socket) {
      console.log(clientPeer);
      socket.emit("call-ended", { to: clientPeer });
      setIncomingCall(false);
      setCallEnded(true)
      setCallingToPeer(false);
      setIsRndSelected(true);
      setStreamingCall(false);
      remoteStreamRef.current = null
      setStream(null)
      setIsScreenSharing(false)
    }
  };
  const handleMessageDelete = async (messageId) => {
    if (!messageId) return
    // setIsDeletionDialogOpen(true)
    if(deleteFor==='foreveryone'){

      await deleteMessage(messageId)
      const updatedMessages = messages.filter(msg => msg._id !== messageId)
      setMessages(updatedMessages)
      if (socket) {
        console.log('attempting to delete', messageId)
        socket.emit('message-deleted', { messageId, to: selectedUser.clerkId })
      }
    }else{
      const response = await fetch(`${API_BASE_URL}/api/messaging/deleteForMe`,{
      method:'POST',
      headers:{
      'Content-Type':'application/json'
      },
      body:JSON.stringify({messageId,userId:user?.id})
      })
      if(response.ok){
        const updatedMessages = messages.filter(msg => msg._id !== messageId)
      setMessages(updatedMessages)
      }
    }
  }
  useEffect(() => {
    const fetchDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setAudioDevices(audioInputDevices);
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket) {

        socket.emit('user-disconnected', { id: user?.id });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, user]);
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/fetchMessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          from: user.id,
          to: selectedUser.clerkId,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        const filteredMessages = json.filter(msg=>msg.deletedBy[0]!==user?.id)

        setMessages(filteredMessages);
      }
    };
    if (selectedUser && selectedUser.clerkId && user && user.id) {
      const fetchdata = async () => {
        await fetchMessages();
        await fetchUsers()
      };
      fetchdata();
    }
  }, [selectedUser, user]);
  useEffect(() => { console.log(messages) }, [messages])
  const screenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((localStream) => {

      const call = userPeer.call(clientPeer, localStream, { metadata: { type: 'sharedisplay' } })
      call.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream
      })

    })
  }
  useEffect(() => {
    if (socket) {
      socket.on("incoming-call", ({ from, to, type }) => {

        setClientPeer(from);
        setIncomingCall(true);
        setCallType(type)

      });
      socket.on("user-disconnected", () => {
        console.log('user disconnected')
        setCallEnded(true);
        setIncomingCall(false);
        setCallingToPeer(false);
        setStreamingCall(false);
        setIsRndSelected(true);
        remoteStreamRef.current = null

      })
      socket.on('message-deleted', ({ messageId }) => {
        console.log(messageId, ' got the messageId in recevier')
        console.log(messages, ' messages')
        const updatedMessages = messages.filter(msg => msg._id !== messageId)
        console.log(updatedMessages)
        setMessages(updatedMessages)
      })
      socket.on("call-ended-from", ({ to }) => {
        setCallEnded(true);
        setIncomingCall(false);
        setCallingToPeer(false);
        setStreamingCall(false);
        setIsRndSelected(true);
        remoteStreamRef.current = null

      });
      socket.on("call-answered", ({ from, type }) => {
        setAnswered(true);
        setCallingToPeer(false);
        try {
          navigator.mediaDevices
            .getUserMedia(type === 'audio' ? { audio: { deviceId: selectedDeviceId } } : { video: true, audio: true })
            .then((localStream) => {
              localStreamRef.current = localStream;

              const call = userPeer.call(from, localStream, { metadata: { type } });

              call.on("stream", (remoteStream) => {
                remoteStreamRef.current = remoteStream;
                console.log("received remote stream", remoteStream.id);
                setStreamingCall(true);
              });
            });
        } catch (e) {
          console.error(e);
        }
      });

      userPeer.on("call", (call) => {
        const callType = call.metadata.type

        try {
          // if(callType==='sharedisplay'){
          //   console.log('in share display')

          //     call.on("stream" , (remoteStream)=>{
          //       console.log('setting display stream ')
          //       remoteStreamRef.current = remoteStream

          //     })

          // }else{
          navigator.mediaDevices
            .getUserMedia(callType === 'audio' ? { audio: { deviceId: selectedDeviceId } } : { video: true, audio: true })
            .then((localStream) => {
              localStreamRef.current = localStream;
              setStreamingCall(true);
              setIncomingCall(false);

              call.answer(localStream);
              call.on("stream", (remoteStream) => {
                remoteStreamRef.current = remoteStream;
                console.log("received remote stream", remoteStream.id);
                if (callType === 'sharedisplay') {
                  setIsScreenSharing(true)

                }
              });
            });
          // }
        } catch (e) {
          console.error(e);
        }

      });
    }
  }, [socket, messages]);

  const handleRndClick = (e) => {
    // e.stopPropagation();
    setIsRndSelected(true);
  };

  const handleClickOutside = (e) => {
    if (windowRef.current && !windowRef.current.contains(e.target)) {
      setIsRndSelected(false);
    }
  };
  useEffect(() => {
    if (streamingCall) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [streamingCall]);
useEffect(()=>{
  console.log(deleteFor)
},[deleteFor])
  return (
    <div
      className=" h-[100vh]"
      style={{
        display: "grid",
        gridTemplateRows: "1fr 9fr 1fr",
        gridTemplateAreas: "'head''main''foot'",
        width: "calc(100vw-14rem)",
      }}
    >
      <div
        className="flex items-center p-[8px] border-b"
        style={{ gridArea: "head" }}
      >
        <div className="flex flex-col h-full justify-center w-full">

          <div className="flex pl-5">
            {selectedUser?.clerkId && (
              <div className="flex justify-between items-center w-full ">
                <h3 className="font-bold">{selectedUser?.username}</h3>
                <div className="flex">

                  <Button onClick={() => sendCall('video')} variant="outline">
                    <Video />
                  </Button>
                  <Button onClick={() => sendCall('audio')} variant="outline">
                    <PhoneCall />
                  </Button>
                </div>

              </div>
            )}
            <ModeToggle />
          </div>
          <div className="h-5 flex items-center justify-center">
            {streamingCall && !isRndSelected && (
              <div
                onClick={handleRndClick}
                className="bg-green-600 w-1/2 h-full text-center rounded-b-full font-semibold cursor-pointer hover:bg-green-700 text-white text-sm"
              >
                Ongoing call
              </div>
            )}


          </div>

        </div>
      </div>
      <div className="h-[100%]" style={{ gridArea: "main", overflowY: "auto" }}>
        {selectedUser.clerkId ? (
          messages.length > 0 &&
          messages.map((message, index) => {
            return (

              <div
                className={`${message.from === user.id
                  ? "bg-slate-400 dark:bg-zinc-900"
                  : "bg-slate-500 dark:bg-black"
                  } dark:text-white`}
                style={{
                  float: message.from === user.id ? "right" : "left",
                  clear: "both", // Ensure proper stacking
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                  margin: "4px 10px",
                  whiteSpace: "pre-wrap",
                }}
                key={index + 1}
              >
                <ContextMenu>
                  <ContextMenuTrigger onClick={()=>setSelectedMessage(message)}>{message.content}</ContextMenuTrigger>
                  <ContextMenuContent>

                    <ContextMenuItem
                      onClick={() => {setIsDeletionDialogOpen(true);setSelectedMessage(message)}}
                    >Delete</ContextMenuItem>

                    <ContextMenuItem>Billing</ContextMenuItem>
                    <ContextMenuItem>Team</ContextMenuItem>
                    <ContextMenuItem>Subscription</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>

                  <DialogTrigger asChild>
                    {/* <Button variant="outline">Edit Profile</Button> */}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Delete Message</DialogTitle>
                      <DialogDescription>
                        This will delete the selected message and cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <RadioGroup defaultValue="forme" onValueChange={setDeleteFor}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem className='fill-red-500' value="forme" id="r1" />
                        <Label htmlFor="r1">Delete for me</Label>
                      </div>
                      
                     {selectedMessage?.from===user.id&& <div className="flex items-center space-x-2">
                        <RadioGroupItem  className='fill-red-500' value="foreveryone" id="r2" />
                        <Label htmlFor="r2">Delete for Everyone</Label>
                      </div>}
                    </RadioGroup>

                    <DialogFooter>
                      <Button type="submit" className='bg-red-600 text-white hover:bg-red-700' onClick={() => { setIsDeletionDialogOpen(false); handleMessageDelete(message._id) }}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>


                </Dialog>
              </div>
            );
          })
        ) : (
          <div className="w-full select-none gap-2 flex justify-center h-full flex-col items-center">
            <img src={'/chat.png'} className="dark:invert opacity-50 w-1/4" />
            <h3 className="font-semibold dar:text-zinc-300">open a chat or add a new contact</h3>
          </div>
        )}
      </div>
      {selectedUser.clerkId && (
        <div
          style={{
            gridArea: "foot",
            position: "sticky",
            bottom: "0",
            backdropFilter: "blur(100px)",
          }}
          className="flex items-center w-full border-t"
        >
          <div className="flex gap-2 w-full items-center">
            {/* <Input   onKeyPress={handleEnterPress}   onKeyDown={(e)=>handleEnterPress(e)} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." /> */}
            <Textarea
              className="resize-none min-h-[50px] h-[40px] max-h-[60px] rounded-[40px]"
              onKeyPress={handleEnterPress}
              onKeyDown={(e) => handleEnterPress(e)}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <Button
              className=" h-[50px] border rounded-[50%]"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onMessage();
              }}
            >
              <SendHorizonal />
            </Button>
          </div>
        </div>
      )}
      <div></div>

      {(streamingCall || incomingCall || callingToPeer) && (
        <div
          className={`absolute ${isRndSelected
            ? "fixed inset-0 h-full w-full flex justify-center items-center"
            : "hidden"
            } min-w-[200px] min-h-[200px]  `}
        >
          <div
            ref={windowRef}
            onClick={handleRndClick}
            className={`  min-w-[200px] min-h-[200px] ${!isRndSelected && " cursor-pointer "
              }`}
          >
            {
              <AudioCall
                answerCall={AnswerCall}
                incomingCall={incomingCall}
                isRndSelected={isRndSelected}
                isCalling={callingToPeer}
                id={user?.id}
                hangUp={hangUpCall}
                clientPeer={clientPeer}
                stream={remoteStreamRef.current}
                sendVidCallInvite={sendVidCallInvite}
                incomingVidCall={incomingVidCall}
                answerVidCall={AnswerVidCall}
                callType={callType}
                localStream={localStreamRef.current}
                screenShare={screenShare}
                isScreenSharing={isScreenSharing}
              />
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default MainChat;
