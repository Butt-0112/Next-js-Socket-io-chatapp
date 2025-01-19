'use client'
import MainChat from "@/components/MainChat";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { context } from "@/context/context";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const router = useRouter()
  const {socket,users} =useContext(context)
  useEffect(()=>{
    if(!localStorage.getItem('token')){
      router.push('/signup')
    }
  },[users])
  return (
    <div className="w-full">
      <MainChat />
      
    </div>
  );
}
