import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthState } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import BottomNav from '@/components/BottomNav/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import Home from '@/pages/Home/Home';
import Library from '@/pages/Library/Library';
import EntryDetail from '@/pages/EntryDetail/EntryDetail';
import Search from '@/pages/Search/Search';
import AddEntry from '@/pages/AddEntry/AddEntry';
import EditEntry from '@/pages/EditEntry/EditEntry';
import MySubmissions from '@/pages/MySubmissions/MySubmissions';
import Profile from '@/pages/Profile/Profile';
import AdminUsers from '@/pages/Admin/Users/AdminUsers';
import AdminExport from '@/pages/Admin/Export/AdminExport';
import WpPost from '@/pages/WpPost/WpPost';
import AdminLogin from '@/pages/AdminLogin/AdminLogin';

const App: React.FC = () => {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f8f7f5]">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 min-w-0 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/entry/:id" element={<EntryDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/add" element={
                  <ProtectedRoute role="volunteer"><AddEntry /></ProtectedRoute>
                } />
                <Route path="/edit/:id" element={
                  <ProtectedRoute role="volunteer"><EditEntry /></ProtectedRoute>
                } />
                <Route path="/my-submissions" element={
                  <ProtectedRoute role="volunteer"><MySubmissions /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/export" element={
                  <ProtectedRoute role="editor"><AdminExport /></ProtectedRoute>
                } />
                <Route path="/blog/:id" element={<WpPost />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
