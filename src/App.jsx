import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Homepage from "./pages/homepage/Homepage";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import MoodSelector from "./pages/MoodSelector/MoodSelector";
import { NewsProvider } from "./context/NewsContext";

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <>
      {!isLanding && <Header />}
      <main>{children}</main>
      {!isLanding && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NewsProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<MoodSelector />} />
            <Route path="/news" element={<Homepage />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
          </Routes>
        </Layout>
      </NewsProvider>
    </BrowserRouter>
  );
}
