"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { io } from "socket.io-client"
import React, { useContext, useEffect,useState } from 'react'
import { useRouter } from "next/navigation"
import {context} from "@/context/context"
const formSchema = z.object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    email:  z.string().email({
      message:"Please provide a valid email."
    }),
    password: z.string().min(8,{
      message:"Password must be at least 8 characters."
    })
  })
   

const Signup = () => {
  const API_BASE_URL = "http://no-knives.gl.at.ply.gg:21223"

  const {socket} = useContext(context)
    const router  = useRouter()
    const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password:""
    },
  })
  async function onSubmit(values) {

    
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    
    // socket.auth = values
    // socket.connect()
    // router.push('/')
    console.log(values)
    // console.log(values)
    const response = await fetch(`${API_BASE_URL}/api/auth/createuser`,{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        name:values.username,
        email:values.email,
        password:values.password
      })

    })
    if(response.ok){
      const json = await response.json()
      const token = json.authToken
      localStorage.setItem('token',token)
      router.push('/')
    }
  
  }
 
  return (
    <div className="w-full">

    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} method="POST" className="space-y-8">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="Name" {...field} />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input placeholder="Password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
  </div>

  )
}

export default Signup
