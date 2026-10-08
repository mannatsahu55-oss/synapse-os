import React, { useEffect } from 'react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function AcceptableUsePage() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <TopNav />
      <main className="pt-32 pb-24 container mx-auto px-6 min-h-[60vh] max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-12">Acceptable Use Policy</h1>
        <div className="prose prose-lg text-text-secondary">
          <p>Please review our acceptable use policy.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
