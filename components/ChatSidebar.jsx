'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { context } from "@/context/context"
import { useContext, useEffect, useState, useCallback } from "react"
import { Input } from "./ui/input"
import { Contact, Loader2, PlusCircleIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import SidebarSkeleton from "./SidebarSkeleton"
import Link from "next/link"
import RealtimeUserSearch from "./RealtimeUserSearch"
const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import debounce from "lodash.debounce";
import { useUser } from "@clerk/nextjs"

export default function AppSidebar() {
  const {selectedUser, setSelectedUser } = useContext(context)

  const [queryUsers, setQueryUsers] = useState({ users: [], totalUsers: 0 })
  const [loadMore, setLoadMore] = useState({ start: 0, end: 10 })
  const [filteredUsers, setFilteredUsers] = useState([]); // Stores locally filtered results
  // const [user,setUser ] = useState({})
  const { user } = useUser()
  console.log(user)
  const { toggleSidebar, isMobile, open } = useSidebar()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [showLoader, setShowLoader] = useState({ id: '', val: false })


  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const { API_BASE_URL } = useContext(context)

  const fetchUsers = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?query=${searchQuery}`);
      const data = await response.json();

      if (response.ok) {
        console.log(data.users)
        const filteredUsers= data.users.filter(s_user=>s_user.id!==user.id)
        setUsers(filteredUsers);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchUsers(value);
  };



  const handleAddContact = async (contact) => {
    setShowLoader({ id: user.id, val: true })
    // const response = await fetch('http://localhost:5500/api/users/add-contact',{
    const response = await fetch(`${API_BASE_URL}/api/users/add-contact`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
         
      },
      body: JSON.stringify({
        contactID: contact.id,
        userId: user.id
      })
    })
    if (response.ok) {

      const json = await response.json()
      const contact = json.contact

      // setUser(contact)
      setShowLoader({ id: user.id, val: false })

    }
  }
  useEffect(() => {
    console.log(selectedUser)
  }, [selectedUser])
  return (
    <>
      {isPageLoading ? <SidebarSkeleton /> : <Sidebar>
        <SidebarHeader >
          <h3 className="font-bold pt-2 pl-6">Chats</h3>
          <SidebarMenu>
            <Input value={query} onChange={handleInputChange} placeholder="Search by username" />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* <RealtimeUserSearch /> */}
          {query.trim() !== '' && <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* {users.length > 0?  users.map((fil_user) => (
                                 <SidebarMenuItem key={user.id}>
                                  
                                    <SidebarMenuButton className='h-full'>
                                        <div className="flex items-center gap-3 w-full">
                                              
                                        <Avatar> 
                                             <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                                             <AvatarFallback>CN</AvatarFallback>
                                           </Avatar> 
                                        {fil_user.username || fil_user.email}
                                     
                                        {user.contacts?.filter(contact_user=>fil_user._id===contact_user.userID).length>0?
                                        
                                        

                                        <X />:showLoader.id===fil_user._id&&showLoader.val?<Loader2 className="animate-spin"  />:
                                        <PlusCircleIcon  onClick={async(e)=> {e.preventDefault();await handleAddContact(fil_user)}} className="text-zinc-500 dark:hover:text-white hover:text-zinc-400" />
                                        }
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )):<p>No results found!</p>} */}
                {query.trim().length < 3 ?
                  <p>please enter at least 3 characters to start searching</p>
                  :
                  <ul>
                    {users.length > 0 && users.map((user) => (
                      <SidebarMenuItem key={user.id} className="flex gap-3 items-center ">
                        <SidebarMenuButton className='h-full'>
                          <Avatar>
                            <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>{user.username || user.email}</span>

                        </SidebarMenuButton>
                        <PlusCircleIcon  onClick={async(e)=> {e.preventDefault();await handleAddContact(user)}} className="text-zinc-500 dark:hover:text-white hover:text-zinc-400" />
                      </SidebarMenuItem>
                    ))}
                  </ul>
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>}
          <SidebarGroup>
            <h3 className="font-semibold text-sm">Contacts</h3>
            <SidebarGroupContent>
              <SidebarMenu>
                {user?.publicMetadata.contacts && user.publicMetadata.contacts.length > 0 ? user.publicMetadata.contacts.map((user, index) => {
                  return <SidebarMenuItem key={index}>
                    <SidebarMenuButton className='h-full' onClick={(e) => {e.preventDefault(); setSelectedUser(user); isMobile && toggleSidebar() }}>
                    <Avatar>
                            <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>

                      {user.username || user.email}
                          </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                }) : <p>No contacts found</p>}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Link href={'/dashboard'} >
            {user?.username || user?.email}
          </Link>
        </SidebarFooter>
      </Sidebar>}
    </>
  )
}
