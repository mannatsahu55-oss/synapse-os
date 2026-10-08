import React, { useEffect } from 'react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function TermsAndConditionsPage() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <TopNav />
      <main className="pt-32 pb-24 container mx-auto px-6 min-h-[60vh] max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-12">Terms & Conditions</h1>
        <div className="prose prose-lg text-text-secondary">
          <p>These are the terms and conditions for Synapse OS.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
