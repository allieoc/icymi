console.log("🚀 React is starting...");

import React from "react";
import ReactDOM from "react-dom/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ No root element found!");
} else {
  console.log("✅ Root element found, rendering React...");

  rootElement.innerHTML = "<h1 style='color: red'>🔥 React is Running 🔥</h1>";
}