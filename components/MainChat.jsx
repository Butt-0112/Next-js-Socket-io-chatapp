"use client";
import { context } from "@/context/context";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";
import { Textarea } from "./ui/textarea";
import {

  Check,
  CheckCheck,
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
import { Avatar, AvatarImage } from "./ui/avatar";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import MobileAudioCall from "./MobileCall";

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
    selectedUser,
    setSelectedUser,
    user,
    messages,
    setMessages,
    deleteMessage,
    fetchUserById,
    sendNotification,
    sendMessage,
    getToken,
    messageStatuses,
    handleContactClick,
    deleteContact,
    decryptMessagesArray,
    userStatus
  } = useContext(context);
  const [message, setMessage] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [muted, setMuted] = useState(false)
  const [videoDisabled, setVideoDisabled] = useState(false)
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
  const windowRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false)
  const [deleteFor, setDeleteFor] = useState('forme')
  const messageContainerRef = useRef(null)
  const mainaudioRef = useRef(null)
  const mainlocalVidRef = useRef(null)
  const localVidRef = useRef(null)
  const audioRef = useRef(null)
  const [lastMessage, setLastMessage] = useState({})
  const { isMobile } = useSidebar()
  const inputRef = useRef(null);
  const mainContainerRef = useRef(null)

  const CleanupStates = () => {
    setIncomingCall(false);
    setMuted(false)
    setVideoDisabled(false)
    setCallEnded(true)
    setCallingToPeer(false);
    setIsRndSelected(true);
    setStreamingCall(false);
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    if (localStreamRef.current) {

      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null
    }
    window.MediaStream = null
    setIsScreenSharing(false)
  }
  const onMessage = async () => {
    if (message.trim() !== '' && message.length > 0) {
      // const encryptedMessage = encryptMessage(message)
      if (selectedUser) {
        // socket.emit("private message", {
        //   content: message,
        //   to: selectedUser.clerkId,
        //   timestamp:Date.now()
        // });
        // setMessages((prev) => [...prev, { content: message, from: user.id }]);
        setMessage("");
        setSelectedMessage(null)
        try {

          //   const token = await getToken(selectedUser.clerkId)
          //   sendNotification(token, user.username, message, 'https://next-js-socket-io-chatapp.vercel.app/')
          await sendMessage(message, selectedUser.clerkId)
          setLastMessage(message)
        } catch (error) {
          console.log('an error occured', error)
          throw new Error(error)
        }

      }
    }
  };
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
    if (selectedUser?.clerkId) {
      handleContactClick(selectedUser.clerkId)
    }
  }, [messages]);
  const handleMute = () => {
    // setMuted(true)
    if (socket) {
      socket.emit('muted', { to: clientPeer, muted: true })
    }
  }
  const handleUnmute = () => {

    if (socket) {
      socket.emit('muted', { to: clientPeer, muted: false })
    }
  }
  const handleDisableVid = () => {
    // setVideoDisabled(!videoDisabled)
    if (socket) [
      socket.emit('video-status', { status: true, to: clientPeer })
    ]
  }
  const handleEnableVid = () => {
    // setVideoDisabled(!videoDisabled)
    if (socket) [
      socket.emit('video-status', { status: false, to: clientPeer })
    ]
  }
  const handleCloseDialog = () => {
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

  const sendCall = (type, to_user) => {
    setClientPeer(selectedUser?.clerkId);
    if (socket) {
      if (to_user) {

        socket.emit("call", { from: user?.id, to: to_user?.id, type });
      } else {

        socket.emit("call", { from: user?.id, to: selectedUser?.clerkId, type });
      }

      setCallingToPeer(true);
    }
  };
  const sendVidCallInvite = (to_user) => {
    hangUpCall()
    sendCall('video', to_user)

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
      socket.emit("call-ended", { to: clientPeer });
      CleanupStates()
    }
  };
  const handleMessageDelete = async (messageId) => {
    if (!messageId) {
      return
    }

    if (deleteFor === 'foreveryone') {

      await deleteMessage(messageId)
      const updatedMessages = messages.filter(msg => msg._id !== messageId)
      setMessages(updatedMessages)
      if (socket) {
        socket.emit('message-deleted', { messageId, to: selectedUser.clerkId })
      }
    } else {
      const response = await fetch(`${API_BASE_URL}/api/messaging/deleteForMe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, userId: user?.id })
      })
      if (response.ok) {
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
        const filteredMessages = json.filter(msg => msg.deletedBy[0] !== user?.id)
        const recipientPrivateKeyBase64 = localStorage.getItem('privateKey');
        const recipientPublicKeyBase64 = localStorage.getItem('publicKey');

        // Suppose `messages` is your array of encrypted message documents
        const decryptedMessages = await decryptMessagesArray(filteredMessages, user.id, recipientPrivateKeyBase64, recipientPublicKeyBase64);


        setMessages(decryptedMessages);
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

  const screenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((localStream) => {

      const call = userPeer.call(clientPeer, localStream, { metadata: { type: 'sharedisplay' } })
      call.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream
      })

    })
  }
  const showNotificationIncomingCall = (title) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification(title, {

          actions: [{ action: 'decline', title: 'Decline' }, { action: 'answer', title: 'Answer' }],

        });
      });
    }
  };
  useEffect(() => {
    if (socket) {
      socket.on("incoming-call", async ({ from, to, type }) => {
        const _from = await fetchUserById(from)

        // showNotificationIncomingCall(`Incoming call from ${_from.username}`)
        setClientPeer(from);
        setIncomingCall(true);
        setCallType(type)

      });
      socket.on("user-disconnected", () => {

        CleanupStates()
      })
      socket.on('muted', ({ muted }) => {
        setMuted(muted)
      })
      socket.on('video-status', ({ status }) => {
        setVideoDisabled(status)
      })
      socket.on('message-deleted', ({ messageId }) => {

        const updatedMessages = messages.filter(msg => msg._id !== messageId)

        setMessages(updatedMessages)
      })
      socket.on("call-ended-from", ({ to }) => {

        CleanupStates()

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

          navigator.mediaDevices
            .getUserMedia(callType === 'audio' ? { audio: { deviceId: selectedDeviceId } } : { video: true, audio: true })
            .then((localStream) => {
              localStreamRef.current = localStream;
              setStreamingCall(true);
              setIncomingCall(false);

              call.answer(localStream);
              call.on("stream", (remoteStream) => {
                remoteStreamRef.current = remoteStream;
                if (callType === 'sharedisplay') {
                  setIsScreenSharing(true)

                }
              });
            });
        } catch (e) {
          console.error(e);
        }

      });
    }
  }, [socket, messages]);

  const handleRndClick = (e) => {
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
  const handleEditMessage = async (message) => {
    setMessage(message.content)

  }
 
useEffect(() => {
  const mainContainer = mainContainerRef.current;

  const updateHeight = () => {
    if (!mainContainer || !window.visualViewport) return;

    const vh = window.visualViewport.height;
    const fullVh = window.innerHeight; // initial height when no keyboard
    // Decide threshold: if height < 90% of full then keyboard open
    if (vh < fullVh * 0.9) {
      // Keyboard probably open
      mainContainer.style.height = '50dvh';
    } else {
      // Keyboard probably closed
      mainContainer.style.height = '100dvh';
    }
  };

  // run initially
  updateHeight();

  // attach listeners
  window.visualViewport?.addEventListener('resize', updateHeight);
  window.visualViewport?.addEventListener('scroll', updateHeight);

  // cleanup
  return () => {
    window.visualViewport?.removeEventListener('resize', updateHeight);
    window.visualViewport?.removeEventListener('scroll', updateHeight);
  };
}, []);


  return (
    <div
      className="flex flex-col w-full h-[100dvh] overflow-hidden"
      ref={mainContainerRef}
      id="chat-root"
      
  
    >
      <div
        className="flex flex-shrink-0 items-center p-[8px] border-b"
        style={{ gridArea: "head" }}
      >
        <SidebarTrigger className='mr-2' />
        <div className="flex flex-col h-full justify-center w-full">

          <div className="flex items-center">
            {selectedUser?.clerkId && (
              <div className="flex justify-between items-center w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger>

                    <div className="flex items-center gap-3 ">
                      <Avatar>
                        <AvatarImage src={selectedUser?.imageUrl} alt={selectedUser?.username} />
                      </Avatar>
                      <h3 className="font-bold text-ellipsis ">{selectedUser?.username}</h3>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-full'>

                    <Card className='w-[320px]'>
                      <CardHeader>
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className='size-24'>
                            <AvatarImage src={selectedUser?.imageUrl} alt={selectedUser?.username} />
                          </Avatar>
                          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            {selectedUser?.username}</h3>
                        </div>

                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className=" flex  gap-1 justify-center">
                          <Button onClick={() => sendCall('video')} className='flex w-full h-fit flex-col gap-1' variant='secondary'>
                            <Video />
                            Video
                          </Button>
                          <Button onClick={() => sendCall('audio')} variant='secondary' className='w-full flex h-fit flex-col gap-1'>
                            <PhoneCall />
                            Voice
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className='text-muted-foreground'>Last Seen</Label>
                          <p className="leading-7 [&:not(:first-child)]:mt-6">
                            {userStatus[selectedUser?.clerkId]?.status === 'online' ? (
                              <span className="text-green-500">Online</span>
                            ) : (
                              <span>
                                Last seen {new Date(userStatus[selectedUser?.clerkId]?.lastSeen).toLocaleString()}
                              </span>
                            )}

                          </p>

                        </div>
                        <div className="space-y-1">
                          <Label className='text-muted-foreground'>Email</Label>
                          <p className="leading-7 [&:not(:first-child)]:mt-6">
                            {selectedUser?.email}
                          </p>

                        </div>

                      </CardContent>
                      <CardFooter>
                        <DropdownMenuItem className="focus:bg-transparent">

                          <Button onClick={async () => { await deleteContact(selectedUser.clerkId); setSelectedUser({}) }} variant='destructive'>Delete Contact</Button>
                        </DropdownMenuItem>
                      </CardFooter>
                    </Card>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            {/* {!selectedUser?.clerkId ? <div className="flex w-full justify-end">

              <ModeToggle />
            </div> :
              <ModeToggle />} */}
          </div>
          <div className=" flex items-center justify-center">
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
      <div className="flex-1 overflow-y-auto min-h-0" ref={messageContainerRef} >
        {selectedUser.clerkId ? (
          messages.length > 0 &&
          messages.map((message, index) => {
            const decryptedMessage = message.content
            const messageStatus = messageStatuses[message._id] || {
              sent: message.status.sent,
              delivered: message.status.delivered,
              read: message.status.read
            };
            console.log(messageStatus)
            return (

              <div
                className={`${message.from === user.id
                  ? "bg-slate-400 text-white dark:bg-zinc-900"
                  : "bg-slate-500 text-white dark:bg-black"
                  } dark:text-white min-w-[150px]`}
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
                  <ContextMenuTrigger onClick={() => setSelectedMessage(message)}>
                    <div className="flex justify-between gap-3">
                      <div className="">
                        {decryptedMessage}
                      </div>
                      <div className="flex leading-tight justify-end items-end gap-1 text-[0.65rem] opacity-70">
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        {message.from === user.id && (
                          <span>
                            {messageStatus.delivered && messageStatus.read ? (
                              <CheckCheck className="h-3 w-3 inline text-sky-600" />
                            ) : messageStatus.delivered ? (
                              <CheckCheck className="h-3 w-3 inline" />
                            ) : (
                              <Check className="h-3 w-3 inline" />

                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>

                    <ContextMenuItem
                      onClick={() => { setIsDeletionDialogOpen(true); setSelectedMessage(message) }}
                    >Delete</ContextMenuItem>

                  </ContextMenuContent>
                </ContextMenu>
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
          className="flex flex-shrink-0 items-center w-full border-t"
        >
          <div className="flex gap- px-4 w-full items-center">
            <Textarea
              className="resize-none min-h-[50px] h-[40px] max-h-[60px] border-none focus-visible:ring-0 rounded-[40px]"
              onKeyPress={handleEnterPress}
              onKeyDown={(e) => handleEnterPress(e)}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              ref={inputRef}
            />
            <Button
              className="border-none rounded-md"
              variant="outline"
              size="icon"
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
      <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>


        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              This will delete the selected message and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup defaultValue="forme" onValueChange={setDeleteFor}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem className='fill-red-500' value="forme" id="r1" />
              <Label htmlFor="r1">Delete for me</Label>
            </div>

            {selectedMessage?.from === user?.id && <div className="flex items-center space-x-2">
              <RadioGroupItem className='fill-red-500' value="foreveryone" id="r2" />
              <Label htmlFor="r2">Delete for Everyone</Label>
            </div>}
          </RadioGroup>

          <DialogFooter>
            <Button type="submit" className='bg-red-600 text-white hover:bg-red-700' onClick={() => { setIsDeletionDialogOpen(false); handleMessageDelete(selectedMessage._id) }}>Delete</Button>
          </DialogFooter>
        </DialogContent>


      </Dialog>
      {(streamingCall || incomingCall || callingToPeer) && (
        <div
          className={`absolute size-full  ${isRndSelected
            ? "inset-0  flex justify-center items-center"
            : "hidden"
            }   `}
        >
          <div
            ref={windowRef}
            onClick={handleRndClick}
            className={`  min-w-[320px] min-h-[320px] ${!isRndSelected && " cursor-pointer "
              } ${isMobile && 'w-full'}`}
          >
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
              callType={callType}
              localStream={localStreamRef.current}
              screenShare={screenShare}
              isScreenSharing={isScreenSharing}
              handleMute={handleMute}
              handleUnmute={handleUnmute}
              muted={muted}
              DisableVid={handleDisableVid}
              EnableVid={handleEnableVid}
              videoDisabled={videoDisabled}
              mainlocalVidRef={mainlocalVidRef}
              mainaudioRef={mainaudioRef}
              audioRef={audioRef}
              localVidRef={localVidRef}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default MainChat;
