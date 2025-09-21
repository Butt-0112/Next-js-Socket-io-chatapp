import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal,  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';


const AccountFooter = ({user}) => {
    const {setTheme }  = useTheme()
  return (
            <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className='h-full'>
                    <Avatar>
                      <AvatarImage src={user?.imageUrl} alt={user?.username} />
                      <AvatarFallback >{user?.username}</AvatarFallback>
                    </Avatar>
                    {user?.username || user?.email}

                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Toggle Theme</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>

                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem asChild>
                    <Link href={'/dashboard'} >
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem >
                    <SignOutButton className='w-full text-start' />

                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

  )
}

export default AccountFooter
