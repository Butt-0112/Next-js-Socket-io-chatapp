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
import { useContext, useEffect, useState } from "react"
import { Input } from "./ui/input"
import { Contact, Loader2, PlusCircleIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import SidebarSkeleton from "./SidebarSkeleton"
const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL

export default function AppSidebar() { 
    const { users, setSelectedUser } = useContext(context)
    const [query, setQuery] = useState('')
    const [queryUsers, setQueryUsers] = useState({ users: [], totalUsers: 0 })
    const [loadMore, setLoadMore] = useState({ start: 0, end: 10 })
    const [filteredUsers, setFilteredUsers] = useState([]); // Stores locally filtered results
    const [user,setUser ] = useState({})
    const {toggleSidebar,isMobile,open} = useSidebar()
    const [isPageLoading,setIsPageLoading] = useState(true)
    const [showLoader,setShowLoader] = useState({id:'',val:false})
    const fetchUser= async()=>{
        const response = await fetch(`${API_BASE_URL}/api/users/getuser`,{
            method:"GET",
            headers:{
                'Content-Type':'application/json',
                'auth-token':localStorage.getItem('token')
            },
            
        })
        if (response.ok){
            const json = await response.json()
            setUser(json)

        }
        
    }
    useEffect(()=>{
       const fetchdata = async()=>await fetchUser()
       fetchdata()
    },[])
    const fetchMoreUsers = async (start, end) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/fetchMoreUsers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ start, end }),
            });

            if (response.ok) {
                const users = await response.json();
                return users;
            } else {
                console.error('Failed to fetch users');
                return { users: [], totalUsers: 0 };
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return { users: [], totalUsers: 0 };
        }
    };
    useEffect(()=>{
        console.log(open)
    },[open])
    // Effect to filter users when the query changes
    useEffect(() => {
        if (query.trim() === '') {
            setFilteredUsers([]);
            return;
        }

        // Filter existing users
        const filtered = queryUsers.users?.filter((user) =>
            user.name.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length > 0) {
            // If matches are found, update filteredUsers
            setFilteredUsers(filtered);
        } else if (loadMore.start < queryUsers.totalUsers) {
            // If no matches and more data is available, fetch more users
            setLoadMore((prev) => ({
                start: prev.start + 10,
                end: prev.end + 10,
            }));
        } else {
            // If no matches and no more data available, clear results
            setFilteredUsers([]);
        }
    }, [query]);

    // Effect to fetch more users when loadMore changes
    useEffect(() => {
        const fetchUsers = async () => {
            const users = await fetchMoreUsers(loadMore.start, loadMore.end);
            console.log(users)
            if (users.users.length) {
                setQueryUsers((prev) => ({
                    users: [...prev.users, ...users.users], // Append new users
                    totalUsers: users.totalUsers,
                }));
            }
            setIsPageLoading(false)
        };

        if (loadMore.start <= queryUsers.totalUsers) {
            fetchUsers();
        }
    }, [loadMore]);
    const handleAddContact = async(user)=>{
        setShowLoader({id:user._id,val:true})
        // const response = await fetch('http://localhost:5500/api/users/add-contact',{
        const response = await fetch(`${API_BASE_URL}/api/users/add-contact`,{
            method:"POST",
            headers:{
                'Content-Type':'application/json',
                'auth-token':localStorage.getItem('token')
            },
            body:JSON.stringify({
                contactID:user._id
            })
        })
        if(response.ok){
          
            const json = await response.json()
            const contact = json.contact
         
            setUser(contact)
            setShowLoader({id:user._id,val:false})
            
        }
    }
    useEffect(()=>{
        console.log(showLoader)
    },[showLoader])
    
    return (
        <>
       {  isPageLoading?<SidebarSkeleton />: <Sidebar>
          <SidebarHeader >
                <h3 className="font-bold pl-6">Chats</h3>
                <SidebarMenu>
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username" />
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              {query.trim()!==''&& <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredUsers.length > 0?  filteredUsers.map((fil_user, index) => {
                                return <SidebarMenuItem key={index}>
                                    <SidebarMenuButton>
                                        <div className="flex justify-between w-full">

                                        {fil_user.name}
                                        {user.contacts?.filter(contact_user=>fil_user._id===contact_user.userID).length>0?
                                        
                                        

                                        <X />:showLoader.id===fil_user._id&&showLoader.val?<Loader2 className="animate-spin"  />:
                                        <PlusCircleIcon  onClick={async(e)=> {e.preventDefault();await handleAddContact(fil_user)}} className="text-zinc-500 dark:hover:text-white hover:text-zinc-400" />
                                        }
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            }):<p>No results found!</p>}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> }
                <SidebarGroup>
                   <h3 className="font-semibold text-sm">Contacts</h3>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {user?.contacts&&user.contacts.length>0?user.contacts.map((user,index)=>{
                                return <SidebarMenuItem key={index}>
                                    <SidebarMenuButton onClick={()=>{setSelectedUser(user);isMobile&& toggleSidebar()}}>
                                        {user.name}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            }):<p>No contacts found</p>}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {user?.name}
            </SidebarFooter>
        </Sidebar>}
        </>
    )
}
