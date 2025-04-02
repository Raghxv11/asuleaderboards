import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogin, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-app-gold">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold gradient-text">ASU Leaderboards</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-app-maroon transition-colors">
            Home
          </Link>
          <Link to="/leaderboard" className="font-medium hover:text-app-maroon transition-colors">
            Leaderboard
          </Link>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-app-maroon text-app-maroon hover:bg-app-maroon/10">My Account</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="app-button" onClick={onLogin}>
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-app-maroon hover:bg-app-gold/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-app-gold/30 p-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="font-medium py-2 hover:text-app-maroon transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className="font-medium py-2 hover:text-app-maroon transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="font-medium py-2 hover:text-app-maroon transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="border-app-maroon text-app-maroon hover:bg-app-maroon/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="app-button"
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
