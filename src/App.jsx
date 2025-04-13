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
import FullPlayer from "./components/FullPlayer/FullPlayer";
import { AuthProvider } from "./context/AuthContext";
import SignUp from "./components/SignUp/SignUp";
import LogIn from "./components/LogIn/LogIn";
import SavedPage from "./pages/SavedPage/SavedPage";
import { SavedItemsProvider } from "./context/SavedItemsContext";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage";
import MessagesInbox from "./pages/MessagesInbox/MessagesInbox";
import MessageThread from "./components/MessageThread/MessageThread";
import FriendSearch from "./components/FriendSearch/FriendSearch";


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
        <AuthProvider>
      <PlayerProvider>
      <SavedItemsProvider>

        <Layout>
          <Routes>
            <Route path="/" element={<MoodSelector />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/focused" element={<FocusedPage />} />
            <Route path="/mellow" element={<MellowPage />} />
            <Route path="/ready-to-listen" element={<ListenPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/inbox" element={<MessagesInbox />} />
            <Route path="/messages/:userId" element={<MessageThread />} />
            <Route path="/friend-search" element={<FriendSearch />} />

          </Routes>
        </Layout>

        <NowPlayingBar />
        <FullPlayer />

        </SavedItemsProvider>
        </PlayerProvider>
        </AuthProvider>
      </NewsProvider>
    </BrowserRouter>
  );
}
