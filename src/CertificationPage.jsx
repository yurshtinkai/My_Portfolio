import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useDarkMode } from './App';

export default function CertificationPage() {
  // Call useDarkMode to ensure the html element's dark class is synced if they refresh on this page
  useDarkMode();

  const certificates = [
    {
      title: "Internship – Management Information Systems Office",
      desc: "Certificate of Completion • MIS Office, Mandaue City",
      image: "/cert1.jpg" // Replace with actual image path
    },
    {
      title: "Best Poster Presenter – Online Record Management System",
      desc: "Certificate of Recognition • Benedicto College Research Congress (2025)",
      image: "/cert2.jpg" // Replace with actual image path
    },
    {
      title: "Director's Lister",
      desc: "Certificate of Recognition • Benedicto College (2025)",
      image: "/cert3.jpg" // Replace with actual image path
    },
    {
      title: "Dean's Lister",
      desc: "Certificate of Recognition • Benedicto College (2024)",
      image: "/cert4.jpg" // Replace with actual image path
    }
  ];

  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : certificates.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev < certificates.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex, certificates.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 md:p-12 font-sans transition-colors duration-300 relative pb-24">
      <div className="max-w-5xl mx-auto pt-2 md:pt-1">
        <div className="relative flex flex-col md:flex-row md:items-center justify-center mb-10 pb-5 border-b border-slate-200 dark:border-[#333]">

          <Link to="/" className="md:absolute left-0 mb-4 md:mb-0 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Certifications</h1>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificates.map((cert, idx) => (
            <div key={idx} className="bg-white dark:bg-black border border-slate-200 dark:border-[#333] rounded-none overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col">

              {/* Image Container */}
              <div className="w-full h-64 md:h-72 bg-slate-100 dark:bg-[#1a1d24] border-b border-slate-200 dark:border-[#333] flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 dark:group-hover:bg-[#232730] transition-colors">

                {/* Fallback icon when no image exists */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                  <i className="fas fa-certificate text-4xl mb-3 opacity-50"></i>
                  <span>Image Not Found</span>
                </div>

                {/* Actual Image */}
                <img
                  src={cert.image}
                  alt={cert.title}
                  onClick={() => setLightboxIndex(idx)}
                  className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300 cursor-pointer"
                  onLoad={(e) => e.target.classList.remove('opacity-0')}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Text Container */}
              <div className="p-6 md:p-8 flex-grow flex flex-col">
                <h2 className="text-[17px] md:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{cert.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{cert.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Top Left: Counter */}
          <div className="absolute top-4 left-4 text-white bg-[#222222] px-4 py-2 text-sm font-bold rounded-none">
            {lightboxIndex + 1} / {certificates.length}
          </div>

          {/* Top Right: Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Left: Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : certificates.length - 1));
            }}
            className="absolute z-10 left-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {/* Main Image */}
          <img
            src={certificates[lightboxIndex].image}
            alt={certificates[lightboxIndex].title}
            className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Right: Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev < certificates.length - 1 ? prev + 1 : 0));
            }}
            className="absolute z-10 right-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Bottom: Instructions */}
          <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-[#222222] px-5 py-2.5 rounded-none font-medium tracking-wide z-10">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
