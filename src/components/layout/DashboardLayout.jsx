import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, DollarSign, Settings, LifeBuoy, Bell, LogOut, Menu, Search, ClipboardList 
} from 'lucide-react';

const SidebarLink = ({ href, icon, children, currentPath, onClick }) => {
  const isActive = currentPath.startsWith(href) && (href !== '/dashboard' || currentPath === '/dashboard');
  const { toast } = useToast();

  const handleClick = (e) => {
    if (href === '#') {
      e.preventDefault();
      toast({
        title: "🚧 Feature not implemented yet!",
        description: "This feature is coming soon. Stay tuned!",
      });
    } else if (onClick) {
      onClick(e, href);
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </a>
  );
};

const SidebarContent = ({ onLinkClick, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick();
    navigate(path);
  };

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <a href="/" className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">

            <img
    src="/WhatsApp Image 2025-11-30 at 12.32.55 AM.jpeg"
    alt="Logo"
    className="w-8 h-8 rounded-lg object-cover"
  />
            </span>
            </div>
            <span className="text-xl font-bold text-gray-900">EstiMate Pro</span>
        </a>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        <SidebarLink href="/dashboard" currentPath={currentPath} icon={<LayoutGrid className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Dashboard</SidebarLink>
        <SidebarLink href="/dashboard/leads" currentPath={currentPath} icon={<ClipboardList className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Leads</SidebarLink>
        <SidebarLink href="/dashboard/pricing-setup" currentPath={currentPath} icon={<DollarSign className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Pricing Setup</SidebarLink>
        <SidebarLink href="/dashboard/client-survey" currentPath={currentPath} icon={<ClipboardList className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Client Survey</SidebarLink>
        <SidebarLink href="/dashboard/account-settings" currentPath={currentPath} icon={<Settings className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Account Settings</SidebarLink>
        {isAdmin && (
          <SidebarLink href="/dashboard/admin" currentPath={currentPath} icon={<LayoutGrid className="mr-3 h-5 w-5" />} onClick={handleNavClick}>Admin Dashboard</SidebarLink>
        )}
      </nav>
      <div className="px-4 py-4 mt-auto border-t border-gray-200">
        <SidebarLink href="mailto:support@estimatepro.com" currentPath={currentPath} icon={<LifeBuoy className="mr-3 h-5 w-5" />}>Support</SidebarLink>
      </div>
    </>
  );
};

const DashboardLayout = () => {
  const { builder, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const builderName =
    builder?.contactName || builder?.businessName || builder?.email || "Builder";
  const isAdmin = builder?.role === "admin";
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };
  

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 left-0 w-64 h-full bg-white flex flex-col z-50 lg:hidden">
              <SidebarContent onLinkClick={() => setSidebarOpen(false)} isAdmin={isAdmin} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden mr-2 -ml-2" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></Button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/leads")}><Search className="h-5 w-5 text-gray-600" /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/leads")}><Bell className="h-5 w-5 text-gray-600" /></Button>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard/account-settings')}>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {builderName?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block"><span className="text-sm font-medium text-gray-700 truncate">{builderName}</span></div>
            </div>
             <Button variant="ghost" size="icon" onClick={handleSignOut}><LogOut className="h-5 w-5 text-gray-600" /></Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;