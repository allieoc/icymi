import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../data/categories";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { useSavedItems } from "../../context/SavedItemsContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();
  const location = useLocation();
  const isFocusedPage = location.pathname === "/focused";
  const navigate = useNavigate();

  const { user } = useAuth();
  const name = user?.user_metadata?.name;
  const { savedCount } = useSavedItems();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
    <header className="bg-indigo-950 text-white p-4">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left section: logo + mood buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="text-xl font-bold">moodscroll</Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center space-y-1"
            >
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </button>
          </div>

          {/* Mood Buttons (desktop only) */}
          <div className="hidden md:flex gap-3 mt-3 md:mt-0">
            <Link to="/focused" className="bg-stone-400 ml-20 text-white text-xs px-3 py-1 rounded-full hover:bg-stone-600 transition">Focused</Link>
            <Link to="/mellow" className="bg-blue-400 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition">Mellow</Link>
            <Link to="/ready-to-listen" className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full hover:bg-purple-600 transition">Ready to Listen</Link>
          </div>
        </div>

        {/* Right section: user info */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 md:justify-end md:flex-nowrap md:gap-6 text-sm text-white mt-2 md:mt-0">
          {user ? (
            <>
              <Link to="/profile" className="font-medium hover:underline">
                Hi, {name || user.email}!
              </Link>
              <button onClick={handleLogout} className="underline">
                Log Out
              </button>
              <Link
                to="/saved"
                className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full hover:bg-indigo-600 transition"
              >
                Saved ({savedCount})
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="underline">Log In</Link>
              <Link to="/signup" className="underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Hamburger menu nav (works on all pages) */}
      <nav
        ref={navRef}
        className={`mt-4 ${menuOpen ? "block" : "hidden"} md:block`}
      >
        {/* Mood Links (always show in hamburger) */}
        <div className="md:hidden mb-4 space-y-1">
          <Link to="/focused" onClick={() => setMenuOpen(false)} className="block text-sm text-white hover:text-stone-300">📰 Focused</Link>
          <Link to="/mellow" onClick={() => setMenuOpen(false)} className="block text-sm text-white hover:text-blue-200">🌈 Mellow</Link>
          <Link to="/ready-to-listen" onClick={() => setMenuOpen(false)} className="block text-sm text-white hover:text-purple-300">🎧 Ready to Listen</Link>
        </div>

        {/* Category Links - only on Focused */}
        {isFocusedPage && (
          <div className="flex flex-wrap justify-center gap-4">
            {Object.values(categories).map(({ slug, title }) => (
              <Link
                key={slug}
                to={`/category/${slug}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-white hover:text-stone-300"
              >
                {title}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
