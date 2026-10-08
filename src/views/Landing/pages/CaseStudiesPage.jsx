import React, { useEffect } from 'react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function CaseStudiesPage() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <TopNav />
      <main className="pt-32 pb-24 container mx-auto px-6 text-center min-h-[60vh] flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-display font-medium mb-6">Case Studies</h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto">
          See how Synapse OS transforms organizations.
        </p>
      </main>
      <Footer />
    </div>
  );
}
