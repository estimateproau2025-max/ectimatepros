import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, Database, Users, FileText, Edit3, Cookie, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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

  const Section = ({ icon, title, children, number }) => (
    <motion.section 
      className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
    >
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{number}. {title}</h2>
      </div>
      <div className="prose prose-md max-w-none text-gray-700 space-y-4">
        {children}
      </div>
    </motion.section>
  );

  return (
    <>
      <Helmet>
        <title>Privacy Policy - EstiMate Pro</title>
        <meta name="description" content="Read the Privacy Policy for EstiMate Pro." />
      </Helmet>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-gray-50 py-12 sm:py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-orange-600 bg-orange-100 rounded-full mb-3">
              <Shield className="w-4 h-4 mr-2" />
              Your Privacy Matters
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              PRIVACY POLICY – ESTIMATE PRO
            </h1>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: {currentDate}
            </p>
          </div>

          <Section icon={<FileText size={20} />} title="Overview" number={1}>
            <p>
              We respect your privacy and are committed to protecting your personal information in accordance with the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs).
            </p>
          </Section>

          <Section icon={<Users size={20} />} title="What Information We Collect" number={2}>
            <p>We collect the following types of information:</p>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                <h3 className="font-semibold text-gray-700 mb-2">Builders</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Name</li>
                  <li>Contact details</li>
                  <li>Pricing data</li>
                  <li>Business details</li>
                  <li>Payment information</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                <h3 className="font-semibold text-gray-700 mb-2">Clients</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Name (if entered)</li>
                  <li>Contact details</li>
                  <li>Renovation preferences</li>
                  <li>Uploaded photos</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                <h3 className="font-semibold text-gray-700 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>IP addresses</li>
                  <li>Browser type</li>
                  <li>Usage patterns</li>
                  <li>Service improvements</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section icon={<Database size={20} />} title="How We Use Your Information" number={3}>
            <p>We use personal information to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide the EstiMate Pro service</li>
              <li>Deliver estimates to builders</li>
              <li>Allow builders to follow-up with clients</li>
              <li>Improve our platform's functionality and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section icon={<Shield size={20} />} title="Disclosure of Information" number={4}>
            <p><strong>We do not sell your personal information.</strong> We may disclose it:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>To our trusted third-party service providers (e.g. Stripe, Firebase)</li>
              <li>If required by law or in the case of suspected fraud or misuse</li>
            </ul>
          </Section>

          <Section icon={<Database size={20} />} title="Storage and Security" number={5}>
            <p>
              All data is stored securely using industry-standard encryption and security practices. We host data on secure servers (e.g. Firebase, Hostinger) located in Australia or regions that comply with Australian data protection laws.
            </p>
          </Section>

          <Section icon={<Edit3 size={20} />} title="Access and Correction" number={6}>
            <p>
              You may request access to or correction of your personal data by contacting us at:
            </p>
            <div className="my-3 p-3 bg-orange-50 border border-orange-200 rounded-md text-center">
              <span className="text-orange-700 font-medium">[Insert your contact email]</span>
            </div>
          </Section>

          <Section icon={<Cookie size={20} />} title="Cookies" number={7}>
            <p>
              Our platform may use cookies to remember login details and enhance your experience. You can disable cookies in your browser settings, but this may affect some functionalities of EstiMate Pro.
            </p>
          </Section>
          
          <div className="mt-12 text-center">
             <a href="mailto:[Insert your contact email]" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600">
                <Mail className="w-5 h-5 mr-2" /> Contact Us About Privacy
            </a>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default PrivacyPolicyPage;