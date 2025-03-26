import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import { NewsProvider } from "./context/NewsContext";
import Homepage from "./pages/homepage/Homepage";



export default function App() {
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
    <BrowserRouter>
    <NewsProvider>
      <Header />
      <main>
      <div>
        <Routes>
          <Route
            path="/"
            element={<Homepage apiKey={apiKey} baseUrl={baseUrl} />}
          />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />

        </Routes>
        </div>
      </main>
      <Footer />
      </NewsProvider>
    </BrowserRouter>
  );
}
