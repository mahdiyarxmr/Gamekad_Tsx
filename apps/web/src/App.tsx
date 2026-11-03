import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Auth from './pages/Auth';
import Games from './pages/Games';
import Guide from './pages/Guide';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import Leaderboard from './pages/Leaderboard';
import Learn from './pages/Learn';
import Account from './pages/Account';
import WalletPage from './pages/Wallet';
import GodGame from './pages/GodGame';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/electronic" element={<Games electronic />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/guide/scenarios/:slug" element={<Guide />} />
        <Route path="/guide/roles" element={<Guide roles />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/leaderboard/:categorySlug" element={<Leaderboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:username" element={<PlayerProfile />} />
        <Route path="/player/:username" element={<PlayerProfile />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<Learn />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/profile" element={<Account />} />
        <Route path="/account/reservations" element={<Account />} />
        <Route path="/account/wallet" element={<WalletPage />} />
        <Route path="/wallet" element={<Navigate to="/account/wallet" replace />} />
        <Route path="/me" element={<Navigate to="/account" replace />} />
        <Route path="/u/:username" element={<PlayerProfile />} />
        <Route path="/host/god-game" element={<GodGame />} />
        <Route path="/god-game" element={<Navigate to="/host/god-game" replace />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
