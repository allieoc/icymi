import React from 'react'
import './Header.css'

function Header() {

    return (
      <header className="site-header">
        <h1 className="site-logo">moodscroll</h1>
        <nav className="site-nav">
          <a href="#">Home</a>
          <a href="#">Latest</a>
          <a href="#">Politics</a>
          <a href="#">Health</a>
          <a href="#">Travel</a>
          <button className="sign-in-btn">Sign In</button>
        </nav>
      </header>
    )
  }
  
  export default Header