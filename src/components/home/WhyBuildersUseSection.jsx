import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Clock, UserCheck, Shield, Smartphone, DollarSign, Brain, Camera, Mail } from 'lucide-react';

const WhyBuildersUseSection = () => {
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
            Why Builders Use EstiMate Pro
          </h2>
          <p className="text-lg text-gray-600 italic">
            "It saves me time and helps me quote faster without wasting hours on site visits or doing admin."
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Key Benefits</h3>
            <div className="space-y-6">
              {[
                // { icon: <Filter className="h-6 w-6" />, text: "Screen out low-budget jobs" },
                { icon: <Clock className="h-6 w-6" />, text: "Save time quoting" },
                { icon: <UserCheck className="h-6 w-6" />, text: "Talk to serious leads" },
                { icon: <Shield className="h-6 w-6" />, text: "Keep full control" },
                { icon: <Smartphone className="h-6 w-6" />, text: "Works on your phone" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-orange-500">
                    {benefit.icon}
                  </div>
                  <span className="text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">What You'll Get</h3>
            <div className="space-y-6">
              {[
                { icon: <DollarSign className="h-6 w-6" />, text: "Customisable pricing input" },
                { icon: <Brain className="h-6 w-6" />, text: "Smart estimate engine (private)" },
                { icon: <Camera className="h-6 w-6" />, text: "Client photo upload" },
                // { icon: <Mail className="h-6 w-6" />, text: "Quote summary via email" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-orange-500">
                    {feature.icon}
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default WhyBuildersUseSection;