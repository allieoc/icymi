import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
   <BrowserRouter>
   <Header />
    <Routes>
    <Route path="/"
          element={<Homepage apiKey={apiKey} baseUrl={baseUrl} />}
          />
    </Routes>
   <Footer />
   </BrowserRouter>
  )
}

export default App
