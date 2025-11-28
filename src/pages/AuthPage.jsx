import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@/components/auth/Auth';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session?.accessToken) {
      navigate('/dashboard');
    }
  }, [session, loading, navigate]);

  if (loading || session?.accessToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Account - EstiMate Pro</title>
        <meta name="description" content="Login or Sign Up for EstiMate Pro." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center py-12 px-4"
      >
        <Auth />
      </motion.div>
    </>
  );
};

export default AuthPage;