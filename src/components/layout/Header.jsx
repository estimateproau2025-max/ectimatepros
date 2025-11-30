import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const isSurveyPage = location.pathname.startsWith('/survey/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
  <img 
    src="/WhatsApp Image 2025-11-30 at 12.32.55 AM.jpeg"
    alt="Logo"
    className="w-10 h-10 rounded-lg object-cover mr-2"
  />
  <span className="text-2xl font-bold text-gray-900">EstiMate Pro</span>
</Link>

        </div>
      
        {/* filler div keeps spacing responsive */}
        <div className="flex-1"></div>

        {!isSurveyPage && (
          <div className="flex items-center justify-end space-x-2">
            {/* <Link to="/">
              <Button variant="ghost" size="lg">Home</Button>
            </Link> */}
            <Link to="/auth">
              <Button variant="ghost" size="lg">Login</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="bg-orange-500 hover:bg-orange-600" size="lg">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
