import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Jacked from './pages/Jacked';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppContent = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const appContext = useApp();

  const handleLoginClick = () => {
    setAuthModalOpen(true);
  };

  return (
    <>
      <Navbar 
        isLoggedIn={appContext.isLoggedIn}
        onLogin={handleLoginClick}
        onLogout={appContext.logout}
      />
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={appContext.login}
        onSignUp={appContext.signUp}
        isLoading={appContext.isAuthLoading}
      />
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jacked" element={<Jacked />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <footer className="bg-gray-50 text-center py-6 mt-12">
        <p className="text-gray-600">© {new Date().getFullYear()} ASU Leaderboards</p>
      </footer>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
