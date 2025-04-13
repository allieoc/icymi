// src/context/NewsContext.js
import { createContext, useState } from "react";

export const NewsContext = createContext();

export function NewsProvider({ children }) {
  const [newsState, setNewsState] = useState({});
  const [loading, setLoading] = useState(true);

  return (
    <NewsContext.Provider value={{ newsState, setNewsState, loading, setLoading }}>
      {children}
    </NewsContext.Provider>
  );
}
