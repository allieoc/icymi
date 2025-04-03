import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'; 
import "./root.css";


const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
      <App />
  );
} else {
  console.error("❌ No root element found!");
}
