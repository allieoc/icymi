import React from 'react'

function Footer() {
  return (
    <footer className="bg-indigo-950 text-neutral-800 py-10 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        
        <div className="md:w-1/2">
          <h3 className="text-xl font-bold text-white mb-2">moodscroll</h3>
          <p className="text-sm text-neutral-300 mb-4">
            A calmer way to catch up on the news, based on your mood.
          </p>

          <a
            href="https://moodscroll.beehiiv.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-indigo-300 hover:text-indigo-900 transition"
          >
            → Get our weekly newsletter
          </a>
        </div>

        <div className="md:text-right md:w-1/2 text-sm text-neutral-300">
          <p className="mb-2">Powered by NPR, BBC, Reddit, and more.</p>
          <p>&copy; {new Date().getFullYear()} AO Creative</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
