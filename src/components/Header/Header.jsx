import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import { categories } from "../../data/categories";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();
  const location = useLocation();
  const hideEverythingButLogo = location.pathname === "/mellow" || "/ready-to-listen";

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


      {!hideEverythingButLogo && (
        <div>
            <nav ref={navRef} className={menuOpen ? "open" : ""}>
              {Object.values(categories).map(({ slug, title }) => (
                <Link key={slug} to={`/category/${slug}`} onClick={() => setMenuOpen(false)} className="nav-link">
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
