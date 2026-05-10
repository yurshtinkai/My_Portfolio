import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
          <p className="text-xs font-bold text-sky-500 dark:text-sky-400 mb-2 tracking-wide uppercase">{proj.subtitle}</p>
        )}
        <p className={`text-sm text-slate-500 dark:text-slate-400 ${proj.techStack ? 'mb-4' : 'mb-4'}`}>{proj.detailedDesc || proj.desc}</p>

        {proj.techStack && (
          <div className="mt-auto mb-4 flex flex-wrap gap-1.5">
            {proj.techStack.map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-50 dark:bg-[#111] text-slate-600 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-[#333]">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className={proj.techStack ? "flex items-center gap-4 text-sm font-semibold" : "mt-auto flex items-center gap-4 text-sm font-semibold"}>
          {proj.title === 'JoyMove Mobile app' ? (
            <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 cursor-default">
              <i className="fas fa-external-link-alt text-[13px]"></i> In Development
            </span>
          ) : proj.demo === '#' ? (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-default">
              <i className="fas fa-external-link-alt text-[13px]"></i> Visit Live Site
            </span>
          ) : (
            <a href={proj.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">
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
  // Call useDarkMode to ensure the html element's dark class is synced
  useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 md:p-12 font-sans transition-colors duration-300 relative pb-24">
      <div className="max-w-5xl mx-auto pt-2 md:pt-1">

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-center mb-10 pb-5 border-b border-slate-200 dark:border-[#333]">
          <Link to="/" className="md:absolute left-0 mb-4 md:mb-0 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">All Projects</h1>
        </div>

        {/* 2-Column Grid Layout for Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj, i) => (
            <LocalProjectCard key={i} proj={proj} />
          ))}
        </div>

      </div>
    </div>
  );
}
