import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import { categories } from "../../data/categories";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();
  const location = useLocation();
  const hiddenPaths = ["/mellow", "/ready-to-listen"];
  const hideEverythingButLogo = hiddenPaths.includes(location.pathname);  
  const { user } = useAuth();
  const name = user?.user_metadata?.name;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Link to="/" className="logo">moodscroll</Link>

    <div className="flex gap-4 items-center">
          {user ? (
                  <>
                    <span className="text-lg text-white">
                      Hi, {name || user.email}!
                    </span>
                    <button onClick={handleLogout} className="text-sm underline">
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm underline">
                      Log In
                    </Link>
                    <Link to="/signup" className="text-sm underline">
                      Sign Up
                    </Link>
                  </>
                )}
    </div>

      {!hideEverythingButLogo && (
        <div>
            <nav ref={navRef} className={menuOpen ? "open" : ""}>
              {Object.values(categories).map(({ slug, title }) => (
                <Link 
                  key={slug} 
                  to={`/category/${slug}`} 
                  onClick={() => setMenuOpen(false)} 
                  className="nav-link">
                  {title}
                </Link>
              ))}

            
            </nav>

            <div className="hamburger">
              <span />
              <span />
              <span />
            </div>
        </div>
        
      )}

    </header>
  );
}
