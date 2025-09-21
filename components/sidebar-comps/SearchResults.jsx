import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { SearchItem } from "./ContactItem";


export const SearchResults = ({ users, contacts, onDelete, onAdd }) => {
  if (!users.length) return null;

  return users.map((user) => (
    <SidebarMenuItem key={user.id} className="flex gap-3 items-center">
      <SidebarMenuButton className='size-full' >
        <SearchItem 
          user={user} 
          isContact={contacts.some(e => e.clerkId === user.id)}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
};