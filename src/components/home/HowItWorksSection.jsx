import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Link as LinkIcon, Users, FileText, Phone, DollarSign } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How EstiMate Pro Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and transform your quoting process - quote bathrooms smarter & faster.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-5 gap-8">
          {[
            {
              number: "1",
              icon: <DollarSign className="h-8 w-8" />,
              title: "Builder Sets Pricing",
              description: "Input your material and labor costs into your personalized dashboard."
            },
            {
              number: "2", 
              icon: <LinkIcon className="h-8 w-8" />,
              title: "Sends Custom Link",
              description: "Share a unique, branded link with your potential clients via email or text."
            },
            {
              number: "3",
              icon: <Users className="h-8 w-8" />,
              title: "Client Enters Details", 
              description: "Clients easily provide their renovation details, measurements, and photos."
            },
            {
              number: "4",
              icon: <FileText className="h-8 w-8" />,
              title: "You Receive Estimate & Job Info",
              description: "Get an instant, AI-generated estimate and all client data in your dashboard."
            },
            {
              number: "5",
              icon: <Phone className="h-8 w-8" />,
              title: "Call & Qualify the Lead",
              description: "Use the detailed info to have productive calls and close serious clients."
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <div className="text-orange-500 mb-4 flex justify-center">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;