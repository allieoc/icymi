import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { createProfile } from "../utils/createProfile";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            setUser(session.user);
            createProfile(session.user); // <- call it here!
          } else {
            setUser(null);
          }
        });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (user) {
      createProfile(user); 
     } 
  }, [user]);

console.log("👤 Auth user in FriendsList:", user);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
