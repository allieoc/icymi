import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Homepage from "./pages/homepage/homepage";

export default function App() {
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: "1rem" }}>
      <div className="max-w-screen-xl mx-auto px-4">
        <Routes>
          <Route
            path="/"
            element={<Homepage apiKey={apiKey} baseUrl={baseUrl} />}
          />
        </Routes>
        </div>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
