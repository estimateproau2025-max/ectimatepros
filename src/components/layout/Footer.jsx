import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';


const Footer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFeatureClick = (featureName, path) => {
     if (path) {
      navigate(path);
    } else if (featureName === 'Privacy Policy') {
      navigate('/privacy-policy');
    } else if (featureName === 'Terms of Service') {
      navigate('/terms-of-service');
    } else {
      // For other links, just show info message
      toast({
        title: `${featureName}`,
        description: "This page is coming soon. Contact support for more information.",
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
          <Link to="/" className="flex items-center space-x-2 mb-4">
  <img
    src="/WhatsApp Image 2025-11-30 at 12.32.55 AM.jpeg"
    alt="Logo"
    className="w-8 h-8 rounded-lg object-cover"
  />
  <span className="text-xl font-bold">EstiMate Pro</span>
</Link>

            <p className="text-gray-400 text-sm">
            EstiMate Pro helps save time and win more work by streamlining the quoting process            </p>
       
          </div>
          
       

          <div className="text-right md:text-left">
            <p className="font-semibold mb-4 text-gray-200">Contact Us</p>
            <div className="space-y-2 text-gray-400">
            support@estimatepro.com.au             
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
            © 2025 EstiMate Pro. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;