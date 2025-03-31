import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import { categories } from "../../data/categories";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { useSavedItems } from "../../context/SavedItemsContext"; // new context

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();
  const location = useLocation();
  const hiddenPaths = ["/mellow", "/ready-to-listen", "/saved"];
  const hideEverythingButLogo = hiddenPaths.includes(location.pathname);
  const { user } = useAuth();
  const name = user?.user_metadata?.name;
  const { savedCount } = useSavedItems();

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
    <header className="site-header bg-indigo-900 text-white p-4">
  <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
  
    {/* Logo + Hamburger */}
    <div className="w-full flex items-center justify-between mb-2 md:mb-0">
        <Link to="/" className="text-xl font-bold">
            moodscroll
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center space-y-1"
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
    </div>

    {/* Greeting + Auth */}
    <div className="w-full flex flex-col md::flex-row md:items-center space-y-4 md:space-y-0 md:gap-4 text-sm text-white text-center md:text-left">
    {user && (
        <>

          <div className="flex justify-center md:justify-start gap-10">
          <span className="text-base">Hi, {name || user.email}!</span>
            <button onClick={handleLogout} className="underline">
              Log Out
            </button>
            <Link
              to="/saved"
              className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full hover:bg-indigo-600 transition"
            >
              Saved ({savedCount})
            </Link>
          </div>
        </>
      )}

      {!user && (
        <div className="flex gap-2 justify-center md:justify-start">
          <Link to="/login" className="underline">
            Log In
          </Link>
          <Link to="/signup" className="underline">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  </div>

  {/* Nav menu */}
  {!hideEverythingButLogo && (
    <nav
      ref={navRef}
      className={`mt-4 ${menuOpen ? "block" : "hidden"} md:block`}
    >
      <div className="flex flex-col md:flex-row md:space-x-4">
        {Object.values(categories).map(({ slug, title }) => (
          <Link
            key={slug}
            to={`/category/${slug}`}
            onClick={() => setMenuOpen(false)}
            className="nav-link"
          >
            {title}
          </Link>
        ))}
      </div>
    </nav>
  )}
</header>


  );
}
