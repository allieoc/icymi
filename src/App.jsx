import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Homepage from "./pages/Homepage/Homepage";

export default function App() {
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route
            path="/"
            element={<Homepage apiKey={apiKey} baseUrl={baseUrl} />}
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
