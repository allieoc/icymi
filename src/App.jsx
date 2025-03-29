import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import MoodSelector from "./pages/MoodSelector/MoodSelector";
import { NewsProvider } from "./context/NewsContext";
import FocusedPage from "./pages/FocusedPage/FocusedPage";
import MellowPage from "./pages/MellowPage/MellowPage";
import ListenPage from "./pages/ListenPage/ListenPage";
import { PlayerProvider } from './context/PlayerContext';
import NowPlayingBar from "./components/NowPlayingBar/NowPlayingBar";

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
      <PlayerProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<MoodSelector />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/focused" element={<FocusedPage />} />
            <Route path="/mellow" element={<MellowPage />} />
            <Route path="/ready-to-listen" element={<ListenPage />} />
          </Routes>
          <NowPlayingBar />
        </Layout>
        </PlayerProvider>
      </NewsProvider>
    </BrowserRouter>
  );
}
