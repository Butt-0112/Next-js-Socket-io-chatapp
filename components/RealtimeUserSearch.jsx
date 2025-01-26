import React, { useState, useCallback, useContext, useEffect } from "react";
import debounce from "lodash.debounce";
import { context } from "@/context/context";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const RealtimeUserSearch = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const {API_BASE_URL} =  useContext(context)

  const fetchUsers = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?query=${searchQuery}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
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
useEffect(()=>{
    console.log(users)
},[users])
  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search users..."
      />
      <ul>
        {users.length>0&&users.map((user) => (
          <li key={user.id} className="flex gap-3 items-center ">
             <Avatar> 
      <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
            <span>{user.username || user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealtimeUserSearch;