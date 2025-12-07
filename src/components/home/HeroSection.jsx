import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="hero-section py-20 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Spend Less Time{' '}
              <span className="block">Quoting.</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              EstiMate Pro is your automated estimating and quoting assistant—built specifically for bathroom renovators. It collects client details, measurements, and preferences, then instantly generates both an accurate estimate and a ready-to-send itemised quote based on your pricing. No more endless quoting admin. Just fast, consistent quoting—done in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/auth?tab=signup')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              >
                Start Free Trial
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              {/* <Button 
                variant="outline" 
                onClick={() => window.scrollTo({ top: document.querySelector('.how-it-works')?.offsetTop || 0, behavior: 'smooth' })}
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 text-lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                See How It Works
              </Button> */}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto">
              <img 
                src="/WhatsApp Image 2025-11-28 at 1.03.26 AM.jpeg"
                alt="Happy construction worker using EstiMate Pro on mobile phone"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;