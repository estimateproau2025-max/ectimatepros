import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';

const DashboardPreviewSection = () => {
  const navigate = useNavigate();
  
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Builder Dashboard Preview
          </h2>
          <p className="text-lg text-gray-600">
            Manage your leads and estimates all in one place with our intuitive dashboard.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Leads</h3>
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">DATE</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">CLIENT NAME</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">PHONE</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">ESTIMATE RANGE</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SUMMARY</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">LINK</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "15/06/2025",
                    name: "Joe Smith",
                    phone: "04 4565 8974",
                    range: "$24,858 - $26,758",
                    summary: "Bathroom, 10sqm, standard tiling, nil layout changes"
                  },
                  {
                    date: "13/06/2025", 
                    name: "Robert Brown",
                    phone: "04 4565 8974",
                    range: "$27,887 - $33,342",
                    summary: "Bathroom, 12sqm, floor to ceiling tiling, with layout..."
                  },
                  {
                    date: "05/06/2025",
                    name: "Mary White", 
                    phone: "04 4565 8974",
                    range: "$18,545 - $20,653",
                    summary: "Bathroom, 10sqm, wet area only tiling, nil layout ch..."
                  }
                ].map((lead, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900">{lead.date}</td>
                    <td className="py-4 px-4 text-gray-900">{lead.name}</td>
                    <td className="py-4 px-4 text-gray-900">{lead.phone}</td>
                    <td className="py-4 px-4 text-orange-500 font-medium">{lead.range}</td>
                    <td className="py-4 px-4 text-gray-600">{lead.summary}</td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => navigate('/auth')}
                        className="text-orange-500 hover:text-orange-600 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Access Full Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default DashboardPreviewSection;