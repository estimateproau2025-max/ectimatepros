import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const TryEstimateProSection = () => {
  const navigate = useNavigate();
  
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Try EstiMate Pro
          </h2>
          <div className="mb-8">
            <span className="text-2xl font-bold text-orange-500">Free for 3 Months</span>
            <p className="text-lg text-gray-600 mt-2">
              After that, just <span className="font-semibold">$10/month</span>. No lock-in. Cancel anytime.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
          >
            Start Free Trial
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TryEstimateProSection;