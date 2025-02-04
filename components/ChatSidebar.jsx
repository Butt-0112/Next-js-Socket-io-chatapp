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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { context } from "@/context/context"
import { useContext, useEffect, useState, useCallback } from "react"
import { Input } from "./ui/input"
import { Contact, Loader2, PlusCircleIcon, Trash2, X } from "lucide-react"
import { Button } from "./ui/button"
import SidebarSkeleton from "./SidebarSkeleton"
import Link from "next/link"
import RealtimeUserSearch from "./RealtimeUserSearch"
const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import debounce from "lodash.debounce";
import { useUser } from "@clerk/nextjs"

export default function AppSidebar() {
  const { selectedUser, user, setSelectedUser } = useContext(context)
  const { isLoaded, isSignedIn } = useUser()
  const [queryUsers, setQueryUsers] = useState({ users: [], totalUsers: 0 })
  const [loadMore, setLoadMore] = useState({ start: 0, end: 10 })
  const [filteredUsers, setFilteredUsers] = useState([]); // Stores locally filtered results
  // const [user,setUser ] = useState({})

  const { toggleSidebar, isMobile, open } = useSidebar()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [showLoader, setShowLoader] = useState({ id: '', val: false })
  const [contacts,setContacts] = useState([])

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

      if (user) {
        setUsers(data.users.filter(n_user => n_user.id !== user.id))
      }
      //  else {
      //   console.error(data.error);
      // }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), [user]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchUsers(value);
  };
  const fetchContacts = async()=>{
    const response = await fetch(`${API_BASE_URL}/api/users/fetchContacts`,{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        userId: user.id
      })
    })
    if(response.ok){

      const json = await response.json()
      return json.contacts
    }

  }
  useEffect(()=>{
    if(user){
        const fetchContactsData = async()=>{
        
        const contacts = await fetchContacts() 
        setContacts(contacts)
      }
      fetchContactsData()

    }
  },[user])


  const handleAddContact = async (contact) => {
    setShowLoader({ id: user.id, val: true })
    // const response = await fetch('http://localhost:5500/api/users/add-contact',{
    console.log(user.id)
    console.log(contact.id)
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
      const contacts = json.contacts
      setContacts(contacts)

      // setUser(contact)
      setShowLoader({ id: user.id, val: false })

    }
  }
  const deleteContact = async(contact)=>{
    const response = await fetch(`${API_BASE_URL}/api/users/deleteContact`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        contactID: contact.clerkId,
        userId: user.id
      })
    })
    if (response.ok) {

      const json = await response.json()
      const contacts = json.contacts
      setContacts(contacts)

      
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
 
                {query.trim().length < 3 ?
                  <p>please enter at least 3 characters to start searching</p>
                  :
                  <ul>
                    {users.length > 0 && users.map((user) => (
                      <SidebarMenuItem key={user.id} className="flex gap-3 items-center ">
                        <div className='h-full w-full flex justify-between'>
                          <div className="w-full flex items-center gap-2">

                            <Avatar>
                              <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                              <AvatarFallback>{user.username || user.firstName} </AvatarFallback>
                            </Avatar>
                            <span>{user.username || user.email}</span>
                          </div>
                          <TooltipProvider>
                          {contacts&&contacts.length>7&&contacts.some(e=>e.clerkId===user.id)   ? 
                            <Tooltip>
                              <TooltipTrigger>

                               <Trash2 onClick={async (e) => { e.preventDefault(); await deleteContact(user) }} className="text-red-500   hover:text-red-400   " />
                                </TooltipTrigger>
                              <TooltipContent>
                                <p>remove from contacts</p>
                              </TooltipContent>
                            </Tooltip>
                            :   <Tooltip>
                            <TooltipTrigger>

                               <PlusCircleIcon onClick={async (e) => { e.preventDefault(); await handleAddContact(user) }} className="text-zinc-500 dark:hover:text-white hover:text-zinc-400" />
                          </TooltipTrigger>
                            <TooltipContent>
                              <p>Add to contacts</p>
                            </TooltipContent>
                          </Tooltip>
                            }  
                          </TooltipProvider>
                        </div>
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
              <SidebarMenu >
                {contacts && contacts.length > 0 ?contacts.map((user, index) => {
                  return <SidebarMenuItem onClick={()=>setSelectedUser(user)}  key={user.clerkId} className="flex hover:bg-zinc-700 px-2 py-2 rounded-lg cursor-pointer gap-3 items-center ">
                  <div id="user-item" className='h-full w-full flex justify-between'>
                    <div className="w-full flex items-center gap-2">

                      <Avatar>
                        <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                        <AvatarFallback>{user.username || user.firstName} </AvatarFallback>
                      </Avatar>
                      <span>{user.username || user.email}</span>
                    </div>
                    <TooltipProvider> 
                      <Tooltip>
                        <TooltipTrigger>

                         <Trash2 id="del-icon" onClick={async (e) => { e.preventDefault(); await deleteContact(user) }} className="text-red-500   hover:text-red-400   " />
                          </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">

                           delete contact 
                          </p>
                        </TooltipContent>
                      </Tooltip>
                     </TooltipProvider>
                  </div>
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
