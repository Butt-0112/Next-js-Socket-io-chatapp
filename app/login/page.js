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
import React, { useContext, useEffect,useState } from 'react'
import { useRouter } from "next/navigation"
import {context} from "@/context/context"

const formSchema = z.object({
    email:  z.string().email({
      message:"Please provide a valid email."
    }),
    password: z.string().min(8,{
      message:"Password must be at least 8 characters."
    })
  })
  const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
   
const Login = () => {
    
  const {setUserChanged } = useContext(context)
    const router  = useRouter()
    const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password:""
    },
  })
  async function onSubmit(values) {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:values.email,
            password:values.password
        })
    })
    if(response.ok){
        const json = await response.json()
        localStorage.setItem('token',json.authToken)
        setUserChanged(true)
        router.push('/')
    }
    
  }
  return (
    <div className="w-full">

    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
     
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

export default Login
