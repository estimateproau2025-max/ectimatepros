import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

const CtaSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    if (!session?.accessToken) {
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/billing/checkout');
      if (response?.url) {
        window.location.href = response.url;
      } else {
        toast({
          variant: 'destructive',
          title: 'Unable to start checkout',
          description: 'Please try again shortly.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Unable to start checkout',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="orange-gradient py-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Quoting Process?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Join hundreds of builders who are already saving time and winning more jobs with EstiMate.
          </p>
          <Button 
            onClick={handleStartTrial}
            className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Start Your Free Trial
                <ExternalLink className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CtaSection;