import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CaseStudiesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'NAVIGATE' && e.data.path) {
        navigate(e.data.path);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div className="w-full h-screen overflow-hidden">
      <iframe 
        src="/framer/case-studies.html" 
        className="w-full h-full border-none m-0 p-0" 
        title="CaseStudiesPage"
      />
    </div>
  );
}
