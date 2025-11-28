import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">EstiMate Pro</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => `text-base transition-colors hover:text-orange-600 ${isActive ? "text-orange-600 font-semibold" : "text-foreground/80 font-medium"}`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/terms-of-service" 
            className={({ isActive }) => `text-base transition-colors hover:text-orange-600 ${isActive ? "text-orange-600 font-semibold" : "text-foreground/80 font-medium"}`}
          >
            Terms of Service
          </NavLink>
          <NavLink 
            to="/privacy-policy" 
            className={({ isActive }) => `text-base transition-colors hover:text-orange-600 ${isActive ? "text-orange-600 font-semibold" : "text-foreground/80 font-medium"}`}
          >
            Privacy Policy
          </NavLink>
        </nav>

        <div className="flex items-center justify-end space-x-2">
          <Link to="/auth">
            <Button variant="ghost" size="lg">Login</Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-orange-500 hover:bg-orange-600" size="lg">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;