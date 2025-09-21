import { useState, useEffect, useContext } from 'react';
import { context } from '@/context/context';

export const useContacts = () => {
  const { user, API_BASE_URL } = useContext(context);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/fetchContacts`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        const json = await response.json();
        setContacts(json.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  return { contacts, loading, refetchContacts: fetchContacts };
};