import React from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import DashboardPreviewSection from '@/components/home/DashboardPreviewSection';
import WhyBuildersUseSection from '@/components/home/WhyBuildersUseSection';
import TryEstimateProSection from '@/components/home/TryEstimateProSection';
import CtaSection from '@/components/home/CtaSection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>EstiMate Pro - Spend Less Time Quoting</title>
        <meta
          name="description"
          content="EstiMate Pro is your automated estimating and quoting assistant for bathroom renovators—collect client details, measurements, and preferences, then generate accurate estimates and itemised quotes in seconds."
        />
      </Helmet>
      
      <HeroSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <WhyBuildersUseSection />
      <TryEstimateProSection />
      <CtaSection />
    </>
  );
};

export default HomePage;