import React, { useEffect } from 'react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function ContactPage() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <TopNav />
      <main className="pt-32 pb-24 container mx-auto px-6 text-center min-h-[60vh] flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-display font-medium mb-6">Contact Us</h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto mb-8">
          Get in touch with our team.
        </p>
        <a href="mailto:contact@synapseos.com" className="text-primary font-medium hover:underline">contact@synapseos.com</a>
      </main>
      <Footer />
    </div>
  );
}
