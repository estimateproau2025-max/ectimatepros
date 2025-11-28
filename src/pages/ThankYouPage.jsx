import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ThankYouPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.7
  };

  return (
    <>
      <Helmet>
        <title>Thank You! - EstiMate Pro</title>
        <meta name="description" content="Thank you for your submission. We will be in touch shortly." />
      </Helmet>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-18rem)] text-center relative">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-orange-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 filter blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-100 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 filter blur-xl"></div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 rounded-full border-4 border-green-400 flex items-center justify-center bg-white shadow-lg">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute top-0 -right-4 w-6 h-6 bg-orange-300 rounded-full opacity-70"></div>
            <div className="absolute bottom-0 -left-4 w-4 h-4 bg-orange-300 rounded-full opacity-70"></div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            Thank You For Your
            <br />
            <span className="text-orange-500">Submission!</span>
          </h1>
          <div className="w-28 h-1.5 bg-orange-400 mx-auto mt-4 rounded-full"></div>

          <div className="mt-8 p-8 bg-white rounded-xl shadow-md max-w-lg text-center border border-gray-100 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
              <Phone className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-gray-600 text-lg">
              Your builder will review this information and give you a call to discuss next steps and provide you with a tailored quote.
            </p>
          </div>

          <Link to="/" className="mt-12">
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </>
  );
};

export default ThankYouPage;