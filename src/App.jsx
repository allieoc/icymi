import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer'

export default function App() {
  return (
    <h1 style={{ backgroundColor: "red", color: "white", padding: "20px" }}>
      IF YOU SEE THIS, REACT IS WORKING
    </h1>
  );
}

