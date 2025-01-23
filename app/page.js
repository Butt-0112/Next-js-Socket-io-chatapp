'use client'
import MainChat from "@/components/MainChat"; 
import { context } from "@/context/context";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
 
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
