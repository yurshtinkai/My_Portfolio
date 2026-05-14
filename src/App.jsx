import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import emailjs from '@emailjs/browser';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TechStackPage from './TechStackPage';
import CertificationPage from './CertificationPage';
import ProjectsPage from './ProjectsPage';
import Chatbot from './components/Chatbot';
import { projects } from './data/projects';

// --- MINIMALIST HOOKS ---
export function useDarkMode() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) };
}

// --- VALIDATION LOGIC ---
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function validateEmailDomain(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
      'aol.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com'
    ];
    if (commonDomains.includes(domain.toLowerCase())) return true;
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (domainPattern.test(domain)) {
      const parts = domain.split('.');
      if (parts.length >= 2 && parts[parts.length - 1].length >= 2) return true;
    }
    return validateEmail(email);
  } catch (error) {
    return validateEmail(email);
  }
}

// --- MINIMAL CONTACT FORM ---
function ContactForm() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY";
    if (publicKey && publicKey !== "YOUR_EMAILJS_PUBLIC_KEY") emailjs.init(publicKey);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitStatus) setSubmitStatus(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.message.trim()) newErrors.message = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY";

      if (serviceId === "YOUR_SERVICE_ID") throw new Error("EmailJS not configured.");

      await emailjs.send(serviceId, templateId, {
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        subject: formData.subject || 'Portfolio Contact',
        message: formData.message,
        to_email: 'lourdangeloubufete17@gmail.com',
      }, publicKey);

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus === 'success' && <div className="p-3 text-sm bg-green-50 text-green-700">Message sent!</div>}
      {submitStatus === 'error' && <div className="p-3 text-sm bg-red-50 text-red-700">Failed to send message.</div>}

      <div className="flex gap-4">
        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-black border border-slate-200 dark:border-[#333] focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-black border border-slate-200 dark:border-[#333] focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
      </div>
      <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-black border border-slate-200 dark:border-[#333] focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
      <textarea name="message" placeholder="Your Message" rows="4" value={formData.message} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-black border border-slate-200 dark:border-[#333] focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm resize-none"></textarea>

      <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors">
        {isLoading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

// --- PROJECT CARD WITH SLIDER ---
export const ProjectCard = ({ proj }) => {
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
        <div className="w-full h-32 md:h-28 overflow-hidden relative bg-slate-white dark:bg-black border-b border-slate-100 dark:border-[#333]">
          {proj.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${proj.title} screenshot ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            />
          ))}
          {/* Slider Indicators */}
          {proj.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
              {proj.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60 shadow-sm'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1.5 transition-colors">{proj.title}</h3>
        <p className="text-[13px] text-black dark:text-slate-100 flex-grow leading-relaxed">{proj.desc}</p>

        <div className="flex items-center gap-3.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300 mt-4 pt-3 border-t border-slate-100 dark:border-[#333]">
          {proj.demo === '#' ? (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 cursor-default">
              <i className="fas fa-external-link-alt text-xs"></i> Visit Live Site
            </span>
          ) : (
            <a href={proj.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
              <i className="fas fa-external-link-alt text-xs"></i> Visit Live Site
            </a>
          )}

          {proj.source === '#' ? (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 cursor-default">
              <i className="fab fa-github text-xs"></i> Code
            </span>
          ) : (
            <a href={proj.source} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
              <i className="fab fa-github text-xs"></i> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// --- GALLERY CAROUSEL ---
const GallerySection = () => {
  const scrollRef = useRef(null);

  // Replace these with your actual image paths
  const galleryImages = [
    '/gallery3.4.jpg',
    '/gallery3.jpg',
    '/gallery3.1.jpg',
    '/gallery3.2.jpg',
    '/gallery3.3.jpg',
    '/gallery3.5.jpg',
    '/lourd.jpg',
    '/gallery1.jpg',
    '/gallery4.jpg',
    '/gallery5.jpg',
    '/gallery6.jpg',
    '/gallery8.jpg',
    '/gallery9.jpg',
    '/gallery10.jpg',
    '/gallery11.jpg',
    '/gallery12.jpg',
    '/gallery13.jpg',
  ];

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scrolls by roughly two image widths
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex, galleryImages.length]);

  return (
    <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none h-full flex flex-col">
      <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
        <i className="fas fa-images text-[19px] text-black dark:text-white"></i> Gallery
      </h2>

      <div className="relative group">
        {/* Prev Button - Always Visible */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md w-10 h-10 flex items-center justify-center hover:text-sky-500 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Previous images"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {galleryImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Gallery image ${i + 1}`}
              onClick={() => setLightboxIndex(i)}
              className="h-48 md:h-56 w-auto object-cover snap-start border border-slate-200 dark:border-[#333] flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 relative hover:z-10"
            />
          ))}
        </div>

        {/* Next Button - Always Visible */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md w-10 h-10 flex items-center justify-center hover:text-sky-500 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Next images"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Top Left: Counter */}
          <div className="absolute top-4 left-4 text-white bg-[#222222] px-4 py-2 text-sm font-bold rounded-none">
            {lightboxIndex + 1} / {galleryImages.length}
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
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
            }}
            className="absolute z-10 left-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {/* Main Image */}
          <img
            src={galleryImages[lightboxIndex]}
            alt={`Gallery enlarged ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Right: Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
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
    </section>
  );
};
// --- MAIN APP ---
function Home() {
  const { theme, toggle } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add this function inside your App component
  const handleScrollToProjects = (e) => {
    e.preventDefault(); // This stops the URL from changing
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tools = ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express.js', 'Laravel', '.NET', 'C#', 'MySQL', 'Firebase', 'Git', 'GitHub', 'Postman', 'Azure DevOps'];

  const certificates = [
    { title: "Internship – Management Information Systems Office", desc: "Certificate of Completion • MIS Office, Mandaue City" },
    { title: "Best Poster Presenter – Online Record Management System", desc: "Certificate of Recognition • Benedicto College Research Congress (2025)" },
    { title: "Director's Lister", desc: "Certificate of Recognition • Benedicto College (2025)" }
  ];

  const experiences = [
    { title: "Freelance Web Developer", desc: "Building custom web applications and system solutions for clients.", year: "2026 - present" },
    { title: "Full Stack Developer Intern", desc: "Asset Management System for the MIS Office at Mandaue City Hall.", year: "2026" },
    { title: "Capstone Project – Back-End Developer", desc: "Online Record Management System for the registrar at benedicto College", year: "2025" },
    { title: "Full Stack Mastery & GitHub Journey", desc: "Started using GitHub and making full stack development project", year: "2024" },
    { title: "Frontend Specialization", desc: "HTML, CSS, and JavaScript, and explored modern frameworks", year: "2023" },
    { title: "Hello World! 👋🏻", desc: "Wrote my first line of code", year: "2022" }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">

      {/* Floating Theme Toggle is removed as it is now integrated into the header */}



      {/* Max Width Container */}
      <div className="max-w-[1024px] mx-auto px-3 sm:px-6 pt-6 pb-16 md:pt-7 md:pb-24 animate-fade-in-up">

        {/* Profile Header (Horizontal layout matching screenshot) */}
        <header className="mb-4 md:mb-6 flex flex-row gap-2.5 min-[400px]:gap-4 md:gap-8 items-start">
          {/* Avatar (Square, no rounded corners) */}
          <img
            src="/ProfilePic.jpg"
            alt="Lourd Angelou D. Bufete"
            className="w-[150px] h-[150px] min-[400px]:w-[158px] min-[400px]:h-[158px] md:w-[195px] md:h-[195px] rounded-none object-cover shrink-0"
          />

          {/* Info Block */}
          <div className="flex-1 w-full pt-0 md:pt-3 min-w-0 overflow-hidden">
            {/* Name Row */}
            <div className="mb-1 md:mb-1.5 flex justify-between items-start md:items-center gap-1 md:gap-2">
              <h1 className="text-[14.6px] min-[400px]:text-[17px] sm:text-[24px] md:text-[32px] leading-tight font-bold text-black dark:text-white tracking-tight flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="truncate">Lourd Angelou D. Bufete</span>
                <svg className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] md:w-[20px] md:h-[20px] text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.5 12.5c0-1.58-.875-2.93-2.14-3.66.24-1.5-.18-3.08-1.23-4.14-1.06-1.05-2.65-1.47-4.15-1.22-.73-1.26-2.09-2.14-3.67-2.14s-2.94.88-3.67 2.14c-1.5-.25-3.09.17-4.15 1.22-1.05 1.06-1.47 2.65-1.23 4.15-1.26.73-2.14 2.08-2.14 3.66s.88 2.94 2.14 3.67c-.24 1.5.18 3.08 1.23 4.14 1.06 1.05 2.65 1.47 4.15 1.23.73 1.26 2.08 2.14 3.67 2.14s2.94-.88 3.67-2.14c1.5.24 3.09-.18 4.15-1.23 1.05-1.06 1.47-2.65 1.23-4.14 1.26-.73 2.14-2.09 2.14-3.67zm-12.75 3.9l-3.5-3.5 1.41-1.41 2.09 2.08 6.09-6.08 1.41 1.42-7.5 7.5z" />
                </svg>
              </h1>

              {/* Desktop Theme Toggle (hidden on mobile) */}
              <button onClick={toggle} className={`hidden sm:flex shrink-0 rounded-none h-[22px] w-[40px] md:h-[26px] md:w-[46px] cursor-pointer overflow-hidden ${theme === 'light' ? 'border border-gray' : 'border border-[#333] shadow-sm'}`}>
                {theme === 'light' ? (
                  <>
                    <div className="w-1/2 h-full bg-white flex items-center justify-center text-slate-500">
                      <i className="fas fa-sun text-[11px]"></i>
                    </div>
                    <div className="w-1/2 h-full bg-[#e2e8f0]"></div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 h-full bg-[#333]"></div>
                    <div className="w-1/2 h-full bg-black flex items-center justify-center text-white">
                      <i className="fas fa-moon text-[11px]"></i>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Location & Contact Info & Mobile Theme Toggle Row */}
            <div className="flex items-start md:items-center justify-between gap-2 mb-1.5 md:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center text-black dark:text-white gap-x-2 gap-y-0.5 text-[12px] sm:text-[13px] md:text-[14px] font-medium leading-tight">
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <svg className="w-[11px] h-[11px] md:w-[16px] md:h-[16px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Cubacub Mandaue City
                </span>
                <span className="font-normal hidden sm:inline px-1">|</span>
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <i className="fas fa-mobile-alt text-[12px] md:text-[14px] shrink-0"></i>
                  +63 966 - 804 - 4546
                </span>
              </div>

              {/* Mobile Theme Toggle (hidden on desktop) */}
              <button onClick={toggle} className={`flex sm:hidden shrink-0 rounded-none h-[22px] w-[40px] md:h-[26px] md:w-[46px] cursor-pointer overflow-hidden ${theme === 'light' ? 'border border-gray' : 'border border-[#333] shadow-sm'}`}>
                {theme === 'light' ? (
                  <>
                    <div className="w-1/2 h-full bg-white flex items-center justify-center text-slate-500">
                      <i className="fas fa-sun text-[11px]"></i>
                    </div>
                    <div className="w-1/2 h-full bg-[#e2e8f0]"></div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 h-full bg-[#333]"></div>
                    <div className="w-1/2 h-full bg-black flex items-center justify-center text-white">
                      <i className="fas fa-moon text-[11px]"></i>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Roles */}
            <div className="text-black dark:text-white mb-2 md:mb-6 text-[13px] sm:text-[13px] md:text-[16px] font-medium tracking-wide leading-tight">
              Full Stack Web Developer <span className="hidden sm:inline"> | Freelancer | Innovator</span>
            </div>

            {/* Actions (Sharp Corners) */}
            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
              <a href="#projects" onClick={handleScrollToProjects} className="flex-1 sm:flex-none justify-center items-center gap-1 md:gap-2 px-1 py-1.5 md:px-4 md:py-2 bg-black dark:bg-white text-white dark:text-black text-[9.5px] min-[400px]:text-[11px] md:text-[13px] font-bold rounded-none hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer flex whitespace-nowrap">
                <i className="far fa-calendar-alt text-[9.5px] min-[400px]:text-[11px] md:text-[13px]"></i> View Projects
              </a>
              <a href="mailto:lourdangeloubufete17@gmail.com" className="flex-1 sm:flex-none justify-center items-center gap-1 md:gap-2 px-1 py-1.5 md:px-4 md:py-2 bg-white dark:bg-black text-black dark:text-white text-[9.5px] min-[400px]:text-[11px] md:text-[13px] font-bold border border-slate-200 dark:border-[#333] rounded-none hover:bg-slate-50 dark:hover:bg-[#111] transition-colors flex whitespace-nowrap">
                <i className="far fa-envelope text-[9.5px] min-[400px]:text-[11px] md:text-[13px]"></i> Send Email
              </a>
              <a href="/BUFETE-RESUME.pdf" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto mt-0.5 sm:mt-0 flex items-center justify-between gap-2 md:gap-6 px-2 min-[400px]:px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-black text-black dark:text-white text-[10px] min-[400px]:text-[12px] md:text-[13px] font-bold border border-slate-200 dark:border-[#333] rounded-none hover:bg-slate-50 dark:hover:bg-[#111] transition-colors whitespace-nowrap">
                <span className="flex items-center gap-1.5 md:gap-2"><i className="far fa-file-alt text-[10px] min-[400px]:text-[11px] md:text-[13px]"></i> Resume</span>
                <i className="fas fa-chevron-right text-[8px] md:text-[10px] text-slate-400"></i>
              </a>
            </div>
          </div>
        </header>

        {/* Grid Layout (Adjust 1.8fr and 1fr below to easily fine-tune widths!) */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[1.6fr_1fr] md:gap-6">

          {/* Left Column (Main Content) */}
          <div className="contents md:block min-w-0 md:space-y-16">
            <div className="contents md:block min-w-0 md:space-y-3">
              {/* About */}
              <section className="order-1 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333]  dark:shadow-none">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="far fa-user text-[19px] text-black dark:text-white"></i> About
                </h2>
                <div className="space-y-4 text-black dark:text-slate-100 leading-relaxed text-[15px]">
                  <p>I am a Full Stack Web Developer with a strong interest in leveraging technology to solve real-world problems. I specialize in transforming complex ideas into intuitive, efficient, and user-friendly digital solutions.</p>
                  <p>I continuously develop my expertise in both front-end and back-end technologies, with a focus on building scalable, high-performance applications. My goal is to create systems that are not only functional but also seamless and engaging for users.</p>
                  <p>I am committed to continuous improvement and staying current with emerging technologies. I approach every project as an opportunity to innovate, refine my skills, and deliver meaningful results.</p>
                </div>
              </section>

              {/* Tech Stack */}
              <section className="order-4 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-cog text-[19px] text-black dark:text-white"></i> Tech Stack
                  </h2>
                  <Link to="/tech-stack" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</Link>
                </div>

                {/* Frontend */}
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Frontend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-html5 text-orange-500 text-sm"></i> HTML5
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-css3-alt text-blue-500 text-sm"></i> CSS3
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-js text-yellow-400 text-sm"></i> JavaScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <span className="text-blue-500 font-bold bg-blue-100 dark:bg-blue-900/50 px-1 rounded-sm text-[9px]">TS</span> TypeScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-react text-sky-400 text-sm"></i> React
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-neos text-black dark:text-white text-sm"></i> Next.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-wind text-cyan-400 text-sm"></i> Tailwind CSS
                    </span>
                  </div>
                </div>

                {/* Backend */}
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Backend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-node-js text-green-500 text-sm"></i> Node.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-server text-slate-500 text-sm"></i> Express.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-laravel text-red-500 text-sm"></i> Laravel
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-code text-indigo-500 text-sm"></i> .NET
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-hashtag text-purple-500 text-sm"></i> C#
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-database text-blue-400 text-sm"></i> MySQL
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-fire text-yellow-500 text-sm"></i> Firebase
                    </span>
                  </div>
                </div>

                {/* Tools & DevOps */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Tools & DevOps</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-git-alt text-orange-600 text-sm"></i> Git
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-github text-black dark:text-white text-sm"></i> GitHub
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fas fa-space-shuttle text-orange-500 text-sm"></i> Postman
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.4 hover:shadow-md transition-all duration-300 cursor-default">
                      <i className="fab fa-microsoft text-blue-500 text-sm"></i> Azure DevOps
                    </span>
                  </div>
                </div>
              </section>
              {/* Featured Projects */}
              <section id="projects" className="order-5 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-folder-open text-[19px] text-black dark:text-white"></i> Featured Projects
                  </h2>
                  <Link to="/projects" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {projects.filter(p => ['Registrar System [Capstone]', 'Modern Notepad', 'Bagkuning E-Commerce', 'Inventory System'].includes(p.title)).map((proj, i) => (
                    <ProjectCard key={i} proj={proj} />
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="contents md:block min-w-0 md:space-y-16">
            <div className="contents md:block min-w-0 md:space-y-3.5">
              {/* Experience */}
              <section className="order-3 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-briefcase text-[19px] text-black dark:text-white"></i> Experience
                </h2>

                {/* --- TIMELINE STRUCTURE STARTS HERE --- */}
                <div className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-4">
                  {experiences.map((exp, i) => (
                    <div key={i} className="mb-4 last:mb-0 relative pl-6 group">

                      {/* Square Indicator (Active for first item, Hollow/Hover for the rest) */}
                      <div className={`absolute w-[10px] h-[10px] -left-[5px] top-1.5 transition-all duration-300 border
                      ${i === 0
                          ? 'bg-black border-black dark:bg-white dark:border-white' // Statically filled for "present"
                          : 'bg-white dark:bg-black border-slate-300 dark:border-slate-500 group-hover:bg-black group-hover:border-black dark:group-hover:bg-white dark:group-hover:border-white' // Hollow until hover for the rest
                        }`}>
                      </div>

                      <h3 className="text-[15px] font-bold text-black dark:text-white leading-tight transition-colors duration-300">{exp.title}</h3>
                      <p className="mt-1.5 text-[14px] text-black dark:text-slate-100 leading-relaxed clearfix">
                        {exp.desc}
                        <span className="font-semibold text-black dark:text-slate-100 float-right ml-4 whitespace-nowrap">
                          {exp.year}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="order-2 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-graduation-cap text-[19px] text-black dark:text-white"></i> Education
                </h2>
                <div className="space-y-0.1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[16px] font-bold text-black dark:text-white leading-tight">Benedicto College</h3>
                    <span className="font-bold text-black dark:text-white text-[15px]">2022-2026</span>
                  </div>
                  <p className="text-[14px] text-black dark:text-slate-100">Bachelor of Science in Information Technology</p>
                  <p className="text-[14px] text-black dark:text-slate-100">A.S Fortuna St. Barangay Bakilid Mandaue City</p>
                </div>
              </section>

              {/* Certificates */}
              <section className="order-6 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none md:-ml-4">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-certificate text-[19px] text-black dark:text-white"></i> Certifications
                  </h2>
                  <Link to="/certification" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</Link>
                </div>
                <div className="space-y-4">
                  {certificates.map((cert, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-black border border-slate-100 dark:border-[#333] flex flex-col justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cert.title}</h3>
                        <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">{cert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Social Links */}
              <section className="order-7 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-link text-[19px] text-black dark:text-white"></i> Social Links
                </h2>

                <p className="text-[13px] font-medium text-black dark:text-slate-100 mb-3">Follow me on</p>

                <div className="space-y-3">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3 bg-white dark:bg-black border border-slate-200 dark:border-[#333] text-sm font-bold text-slate-800 dark:text-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 rounded-none w-full">
                    <div className="flex items-center gap-4">
                      <i className="fab fa-linkedin text-xl w-6 text-center text-black dark:text-white"></i> LinkedIn
                    </div>
                    <span className="text-lg text-slate-500 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">&gt;</span>
                  </a>

                  <a href="https://github.com/yurshtinkai" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3 bg-white dark:bg-black border border-slate-200 dark:border-[#333] text-sm font-bold text-slate-800 dark:text-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 rounded-none w-full">
                    <div className="flex items-center gap-4">
                      <i className="fab fa-github text-xl w-6 text-center text-black dark:text-white"></i> GitHub
                    </div>
                    <span className="text-lg text-slate-500 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">&gt;</span>
                  </a>

                  <a href="https://facebook.com/angelou.bufete.5" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3 bg-white dark:bg-black border border-slate-200 dark:border-[#333] text-sm font-bold text-slate-800 dark:text-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 rounded-none w-full">
                    <div className="flex items-center gap-4">
                      <i className="fab fa-facebook text-xl w-6 text-center text-black dark:text-white"></i> Facebook
                    </div>
                    <span className="text-lg text-slate-500 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">&gt;</span>
                  </a>
                </div>
              </section>


            </div>
          </div>
        </div>

        {/* Bottom Section: Connect & Contact */}
        <div className="mt-4">
          {/* Direct Message */}
          <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">

              {/* Left Side: Let's work together */}
              <div className="space-y-6">
                <h2 className="-mt-2 md:-mt-3 text-[32px] md:text-[25px] font-extrabold text-black dark:text-white tracking-tight">
                  Let's work <span className="text-slate-400 dark:text-slate-500">together.</span>
                </h2>
                <p className="text-[14px] text-black dark:text-slate-100 leading-relaxed">
                  Available for freelance web development, full-stack development, and custom system projects. Passionate about building responsive, user-friendly, and scalable web applications that help businesses and organizations improve their digital presence and workflow efficiency. Open to collaborating on innovative ideas, system development, and modern web solutions using the latest technologies.
                </p>
                <div className="pt-2">
                  <a href="mailto:lourdangeloubufete17@gmail.com" className="inline-flex flex-col group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="far fa-envelope text-[18px] text-slate-800 dark:text-slate-200"></i>
                      <span className="text-[15px] text-slate-800 dark:text-slate-200">Email</span>
                    </div>
                    <span className="text-[16px] text-black dark:text-white">
                      lourdangeloubufete17@gmail.com
                    </span>
                  </a>
                </div>
              </div>

              {/* Right Side: Direct Message */}
              <div>
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="far fa-paper-plane text-[19px] text-black dark:text-white"></i> Direct Message
                </h2>
                <ContactForm />
              </div>

            </div>
          </section>
        </div>

        {/* Bottom Section 2: Beyond the Screen & Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 mt-4 md:mt-4">
          {/* Left: Beyond the Screen */}
          <div className="min-w-0 h-full flex flex-col">
            <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] dark:shadow-none flex-1 flex flex-col">
              <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                Beyond the Screen
              </h2>
              <div className="flex flex-col flex-1 justify-between">
                <p className="text-[14px] text-black dark:text-slate-100 mb-3">
                  When I step away from the tech world, I spend quality time with family and friends, creating meaningful connections and maintaining a healthy work-life balance. These moments help me return to my projects with renewed energy, creativity, and perspective.
                </p>
                <style>{`
                  @keyframes slide-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-slide-left {
                    animation: slide-left 35s linear infinite;
                  }
                `}</style>
                <div className="relative w-full mt-auto">
                  {/* Invisible spacer to force the exact original height */}
                  <div className="flex gap-3 justify-between opacity-0 pointer-events-none select-none">
                    <div className="w-[31%] aspect-[4/5]"></div>
                  </div>
                  {/* Scrolling Slider */}
                  <div className="absolute inset-0 overflow-hidden -mx-1 px-1">
                    <div className="flex h-full w-max animate-slide-left hover:[animation-play-state:paused]">
                      {[1, 2].map((set) => (
                        <div key={set} className="flex h-full gap-3 pr-3 shrink-0">
                          {['/image1.jpg', '/image2.jpeg', '/image3.jpeg', '/image4.jpg', '/image5.jpg', '/image6.jpeg', '/image8.jpg'].map((src, i) => (
                            <div key={i} className="h-full aspect-[4/5] overflow-hidden border border-slate-200 dark:border-[#333] relative shadow-sm shrink-0">
                              <img src={src} className="absolute inset-0 w-full h-full object-cover" alt={`Beyond the Screen ${i + 1}`} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Gallery */}
          <div className="min-w-0 h-full flex flex-col">
            <GallerySection />
          </div>
        </div>
        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-slate-200 dark:border-[#333] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-black dark:text-slate-100">
          <p>&copy; {new Date().getFullYear()} Lourd Angelou D. Bufete.</p>
          <p>Built with React & Tailwind.</p>
        </footer>
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
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tech-stack" element={<TechStackPage />} />
        <Route path="/certification" element={<CertificationPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}