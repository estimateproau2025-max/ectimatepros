import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Phone, Info } from 'lucide-react';

const TermsOfServicePage = () => {
  const { toast } = useToast();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleFeatureClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <>
      <Helmet>
        <title>Terms of Service - EstiMate Pro</title>
        <meta name="description" content="Read the Terms of Service for EstiMate Pro." />
      </Helmet>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-white py-12 sm:py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-orange-600 bg-orange-100 rounded-full mb-3">
              <FileText className="w-4 h-4 mr-2" />
              Legal Documentation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              TERMS OF SERVICE – ESTIMATE PRO
            </h1>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: {currentDate}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
              <p>
                Welcome to EstiMate Pro! These Terms of Service ("Terms") govern your use of our web-based estimation platform designed for contractors and construction professionals. By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">2. Who We Support</h2>
              <p>
                EstiMate Pro is specifically designed for contractors, construction professionals, and related service providers who need accurate project estimation tools. Our platform is intended for business use and may not be suitable for personal or non-commercial projects.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">3. Account Responsibility</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with this security obligation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">4. Builder-Provided Information</h2>
              <p>
                When using our platform, you may provide various types of information including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Project specifications and requirements</li>
                <li>Material costs and supplier information</li>
                <li>Labor rates and time estimates</li>
                <li>Client contact information and project details</li>
                <li>Historical project data and templates</li>
              </ul>
              <p>
                You warrant that all information provided is accurate, current, and complete. You retain ownership of your data, but grant us the right to use this information to provide our services and improve our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">5. Estimates Are Not Quotes</h2>
              <p>
                <strong>Important Notice:</strong> All estimates generated through our platform are preliminary calculations based on the information you provide. These estimates are for guidance purposes only and actual project costs may vary significantly due to factors including but not limited to material price fluctuations, labor availability, site conditions, permit requirements, and unforeseen complications. You are solely responsible for verifying all estimates and converting them into formal quotes or contracts with your clients.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">6. Subscriptions & Payments</h2>
              <p>
                Our service operates on a subscription basis with various pricing tiers. Subscription fees are billed in advance on a monthly or annual basis depending on your chosen plan. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice to existing subscribers. Your continued use of the service after price changes constitutes acceptance of the new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, EstiMate Pro and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service. Our total liability to you for all claims arising from or relating to the service shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800">8. Availability and Updates</h2>
              <p>
                We strive to maintain high availability of our service but cannot guarantee uninterrupted access. We may perform scheduled maintenance or emergency repairs that may temporarily suspend service. We will endeavor to provide reasonable notice of planned maintenance when possible. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800">9. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Insert Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the service shall be resolved through binding arbitration in accordance with the rules of [Insert Arbitration Organization]. You agree to waive any right to a jury trial or to participate in a class action lawsuit.
              </p>
            </section>
          </div>

          <div className="mt-16 p-6 bg-orange-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Questions About These Terms?</h3>
            <p className="mt-2 text-sm text-gray-600">
              If you have any questions about these Terms of Service, please don't hesitate to contact us.
            </p>
            {/* <div className="mt-4 flex space-x-3">
              <Button 
                onClick={handleFeatureClick} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button 
                onClick={handleFeatureClick} 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-100"
              >
                <Info className="w-4 h-4 mr-2" />
                Help Center
              </Button>
            </div> */}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TermsOfServicePage;