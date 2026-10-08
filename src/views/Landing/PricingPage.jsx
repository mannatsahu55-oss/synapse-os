import React, { useEffect } from 'react';
import TopNav from './components/TopNav';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';

export default function PricingPage() {
  // Ensure we start at the top of the page when this mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary selection:bg-primary/20 selection:text-primary flex flex-col">
      <TopNav />
      <main className="flex-1 pt-24">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
