import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
  <div className="footer-content">
    <div className="footer-brand">
      <h3>moodscroll</h3>
      <p>A calmer way to catch up on the news, based on your mood.</p>
    </div>

    <div className="footer-links">
      <a href="/">Home</a>
      <a href="/latest">Latest</a>
      <a href="/politics">Politics</a>
      <a href="/health">Health</a>
      <a href="/travel">Travel</a>
    </div>

    <div className="footer-meta">
      <p>Powered by NPR, BBC, Reddit, and more.</p>
      <p>&copy; {new Date().getFullYear()} Moodscroll</p>
    </div>
  </div>
</footer>

  )
}

export default Footer