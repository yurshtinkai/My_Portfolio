import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from './App';
import { projects } from './data/projects';

const LocalProjectCard = ({ proj }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!proj.images || proj.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % proj.images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [proj.images]);

  return (
    <div className="group rounded-none bg-white dark:bg-black border border-slate-100 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors flex flex-col h-full overflow-hidden">
      {/* Image Slider */}
      {proj.images && proj.images.length > 0 && (
        <div
          className="w-full overflow-hidden relative bg-slate-100 dark:bg-black border-b border-slate-100 dark:border-[#333]"
          style={{ aspectRatio: proj.aspect || '16/9' }}
        >
          {proj.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${proj.title} screenshot ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            />
          ))}
          {/* Slider Indicators */}
          {proj.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
              {proj.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60 shadow-sm'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${proj.subtitle ? 'mb-1' : 'mb-2'}`}>{proj.title}</h3>
        {proj.subtitle && (
          <p className="text-xs font-bold text-black dark:text-white mb-2 tracking-wide uppercase">{proj.subtitle}</p>
        )}
        <p className={`text-sm text-black dark:text-slate-200 ${proj.techStack ? 'mb-4' : 'mb-4'}`}>{proj.detailedDesc || proj.desc}</p>

        {proj.techStack && (
          <div className="mt-auto mb-4 flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {proj.techStack.map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-white dark:bg-black text-black dark:text-slate-100 text-[11px] font-semibold border border-slate-200 dark:border-[#333] shrink-0 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className={proj.techStack ? "flex items-center gap-4 text-sm font-semibold" : "mt-auto flex items-center gap-4 text-sm font-semibold"}>
          {proj.title === 'JoyMove App' ? (
            <a href={proj.demo !== '#' ? proj.demo : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">
              <i className="fas fa-external-link-alt text-[13px]"></i> Admin Live Site
            </a>
          ) : proj.demo === '#' ? (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-default">
              <i className="fas fa-external-link-alt text-[13px]"></i> Visit Live Site
            </span>
          ) : (
            <a href={proj.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">
              <i className="fas fa-external-link-alt text-[13px]"></i> Visit Live Site
            </a>
          )}

          {proj.source === '#' ? (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-default">
              <i className="fab fa-github text-[14px]"></i> Code
            </span>
          ) : (
            <a href={proj.source} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">
              <i className="fab fa-github text-[14px]"></i> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const location = useLocation();
  const backTo = location.state?.fromTop ? "/" : "/#projects";
  // Call useDarkMode to ensure the html element's dark class is synced
  useDarkMode();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 md:px-12 md:pb-12 md:pt-6 font-sans transition-colors duration-300 relative pb-24">
      <div className="max-w-5xl mx-auto pt-2 md:pt-0">

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-center mb-10 pb-5 border-b border-slate-200 dark:border-[#333]">
          <Link to={backTo} className="md:absolute left-0 mb-4 md:mb-0 text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
          <h1 className="text-[20px] md:text-[26px] font-bold tracking-tight text-center">All Projects</h1>
        </div>

        {/* 2-Column Grid Layout for Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj, i) => (
            <LocalProjectCard key={i} proj={proj} />
          ))}
        </div>

      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-[88px] right-6 w-[47px] h-[45px] bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 z-40 cursor-pointer"
          aria-label="Scroll to top"
        >
          <i className="fas fa-chevron-up text-lg"></i>
        </button>
      )}
    </div>
  );
}
