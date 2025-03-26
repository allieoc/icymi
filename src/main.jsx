import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'; 
import { NewsProvider } from "./context/NewsContext";


const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <NewsProvider>
      <App />
    </NewsProvider>
  );
} else {
  console.error("❌ No root element found!");
}
