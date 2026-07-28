import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import BottomNav from '@/components/BottomNav/BottomNav';
import Home from '@/pages/Home/Home';
import Library from '@/pages/Library/Library';
import Kavis from '@/pages/Kavis/Kavis';
import Publishers from '@/pages/Publishers/Publishers';
import Prasangas from '@/pages/Prasangas/Prasangas';
import PrasangaKosha from '@/pages/PrasangaKosha/PrasangaKosha';
import PrasangaKoshaCopies from '@/pages/PrasangaKoshaCopies/PrasangaKoshaCopies';
import Contact from '@/pages/Contact/Contact';
import EntryDetail from '@/pages/EntryDetail/EntryDetail';
import Search from '@/pages/Search/Search';
import WpPost from '@/pages/WpPost/WpPost';

// The Yakshavahini public site opens this app via
// prasangapratisangraha://<host> (see AndroidManifest.xml's intent-filter).
// `host` names which screen to land on — only "kosha" is special-cased
// today, matching that site's Prasanga Kosha link; anything else (including
// the plain prasangapratisangraha://open used for the default link) goes
// Home.
const ROUTE_FOR_HOST: Record<string, string> = {
  kosha: '/kosha',
};

const DeepLinkRouter: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const listenerPromise = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const host = new URL(url).host;
      navigate(ROUTE_FOR_HOST[host] || '/');
    });
    return () => { listenerPromise.then((listener) => listener.remove()); };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
    <SidebarProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--ps-bg)' }}>
          <DeepLinkRouter />
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 min-w-0 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/kavis" element={<Kavis />} />
                <Route path="/publishers" element={<Publishers />} />
                <Route path="/prasangas" element={<Prasangas />} />
                <Route path="/kosha" element={<PrasangaKosha />} />
                <Route path="/kosha/copies" element={<PrasangaKoshaCopies />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/entry/:id" element={<EntryDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/blog/:id" element={<WpPost />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
    </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
