'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { context } from "@/context/context"
import { useContext, useEffect, useState, useCallback } from "react"
import { Input } from "./ui/input"
import { Loader2 } from "lucide-react"
import debounce from "lodash.debounce";
import { useUser } from "@clerk/nextjs"
import { ContactItem, SearchItem } from "./sidebar-comps/ContactItem"
import { SearchResults } from "./sidebar-comps/SearchResults"
import AccountFooter from "./sidebar-comps/AccountFooter"

export default function AppSidebar() {
  const { selectedUser, user, setSelectedUser, handleContactClick, deleteContact, contacts, setContacts, API_BASE_URL } = useContext(context)
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false)
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const { isLoaded } = useUser()

  const handleClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false)
    }
  }
  const fetchUsers = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?query=${searchQuery}`);
      const data = await response.json();
      console.log(data.users, 'searched users')
      if (user) {
        setUsers(data.users.filter(n_user => n_user.id !== user.id))
      }
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
  const fetchContacts = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/fetchContacts`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id
      })
    })
    if (response.ok) {

      const json = await response.json()
      return json.contacts
    }

  }
  useEffect(() => {
    if (user) {
      const fetchContactsData = async () => {
        setLoadingContacts(true)

        const contacts = await fetchContacts()
        setContacts(contacts)
        setLoadingContacts(false)
      }
      fetchContactsData()

    }
  }, [user])


  const handleAddContact = async (contact) => {

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
    }
  }
  const handleDeleteContact = async (contact) => {
    await deleteContact(contact)
    if (selectedUser.clerkId === contact) {
      setSelectedUser({})
    }

  }

  return (

    <Sidebar collapsible="offcanvas">
      <SidebarHeader >
        <h3 className="font-bold pt-2 ">Chats</h3>
        <SidebarMenu>
          <Input value={query} onChange={handleInputChange} placeholder="Search by username" />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {query.trim() !== '' && <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>

              {query.trim().length < 3 ?
                <p>please enter at least 3 characters to start searching</p>
                :
                <SearchResults users={users} contacts={contacts} onDelete={handleDeleteContact} onAdd={handleAddContact} />

              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>}
        <SidebarGroup>
          <h3 className="font-semibold text-sm">Contacts</h3>
          <SidebarGroupContent>
            <SidebarMenu >
              {contacts && contacts.length > 0 ? contacts.map((user, index) => {
                return <SidebarMenuItem key={index}
                >
                  <SidebarMenuButton id='user-item' className='size-full' onClick={() => { setSelectedUser(user); handleClick(); handleContactClick(user.clerkId) }} key={user.clerkId}
                  >
                    <ContactItem user={user} onDelete={handleDeleteContact} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              }) : !isLoaded || loadingContacts ? <div className="flex justify-center py-4">
                <Loader2 className="animate-spin" />
              </div>
                : <p>No contacts found</p>}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AccountFooter user={user} />
    </Sidebar>

  )
}
