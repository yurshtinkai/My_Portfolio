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
              className={`absolute inset-0 w-full h-full object-cover md:object-contain transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
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
    <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none h-full flex flex-col">
      <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
        <i className="fas fa-images text-[17px] text-black dark:text-white"></i> Gallery
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
            className="w-[140px] h-[140px] min-[375px]:w-[150px] min-[375px]:h-[150px] min-[400px]:w-[158px] min-[400px]:h-[158px] md:w-[195px] md:h-[195px] rounded-none object-cover shrink-0"
          />

          {/* Info Block */}
          <div className="flex-1 w-full pt-0 md:pt-3 min-w-0">
            {/* Name Row */}
            <div className="relative mb-1 md:mb-1.5 flex justify-between items-start md:items-center gap-1 md:gap-2">
              <h1 className="text-[14.6px] min-[400px]:text-[17px] sm:text-[24px] md:text-[32px] leading-tight font-bold text-black dark:text-white tracking-tight flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="truncate">Lourd Angelou D. Bufete</span>
                <svg className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] md:w-[20px] md:h-[20px] text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.5 12.5c0-1.58-.875-2.93-2.14-3.66.24-1.5-.18-3.08-1.23-4.14-1.06-1.05-2.65-1.47-4.15-1.22-.73-1.26-2.09-2.14-3.67-2.14s-2.94.88-3.67 2.14c-1.5-.25-3.09.17-4.15 1.22-1.05 1.06-1.47 2.65-1.23 4.15-1.26.73-2.14 2.08-2.14 3.66s.88 2.94 2.14 3.67c-.24 1.5.18 3.08 1.23 4.14 1.06 1.05 2.65 1.47 4.15 1.23.73 1.26 2.08 2.14 3.67 2.14s2.94-.88 3.67-2.14c1.5.24 3.09-.18 4.15-1.23 1.05-1.06 1.47-2.65 1.23-4.14 1.26-.73 2.14-2.09 2.14-3.67zm-12.75 3.9l-3.5-3.5 1.41-1.41 2.09 2.08 6.09-6.08 1.41 1.42-7.5 7.5z" />
                </svg>
              </h1>

              {/* Absolutely Positioned Long-Arm Retro Robot (Zero layout impact) */}
              <div className="absolute hidden lg:block right-[60px] md:right-[140px] top-[4px] md:top-[12px] w-20 h-20 md:w-[85px] md:h-[85px] shrink-0 text-slate-800 dark:text-white pointer-events-none">
                <style>{`
                  @keyframes pixel-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                  }
                  @keyframes pixel-antenna {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(15deg); }
                    75% { transform: rotate(-15deg); }
                  }
                  @keyframes pixel-eye-blink {
                    0%, 92%, 100% { transform: scaleY(1); }
                    96% { transform: scaleY(0.1); }
                  }
                  @keyframes shoulder-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                  }
                  @keyframes elbow-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-30deg); }
                  }
                  @keyframes shoulder-right {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-10deg); }
                  }
                  @keyframes elbow-right {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(30deg); }
                    75% { transform: rotate(-30deg); }
                  }
                  @keyframes shoulder-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                  }
                  @keyframes elbow-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-30deg); }
                  }
                  @keyframes shoulder-right {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-10deg); }
                  }
                  @keyframes elbow-right {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(30deg); }
                    75% { transform: rotate(-30deg); }
                  }
                  @keyframes leg-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(10deg); }
                  }
                  @keyframes leg-right {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-10deg); }
                  }
                  .animate-pixel-bounce { animation: pixel-bounce 3s ease-in-out infinite; }
                  .animate-pixel-antenna { animation: pixel-antenna 4s ease-in-out infinite; transform-origin: 70px 25px; }
                  .animate-pixel-eye-blink { animation: pixel-eye-blink 5s ease-in-out infinite; transform-origin: 50px 50px; }
                  .animate-shoulder-left { animation: shoulder-left 3s ease-in-out infinite; transform-origin: 20px 45px; }
                  .animate-elbow-left { animation: elbow-left 3s ease-in-out infinite; transform-origin: -10px 45px; }
                  .animate-shoulder-right { animation: shoulder-right 2.5s ease-in-out infinite; transform-origin: 80px 30px; }
                  .animate-elbow-right { animation: elbow-right 2.5s ease-in-out infinite; transform-origin: 105px 10px; }
                  .animate-leg-left { animation: leg-left 3s ease-in-out infinite; transform-origin: 35px 70px; }
                  .animate-leg-right { animation: leg-right 3s ease-in-out infinite; transform-origin: 65px 70px; }
                  @keyframes turboDashNoVanish {
                    0%, 60%, 100% { transform: translateX(0); }
                    65% { transform: translateX(-5px); }
                    68% { transform: translateX(120px); }
                    70%, 85% { transform: translateX(150px); }
                    90% { transform: translateX(-40px); }
                    95% { transform: translateX(0); }
                  }
                  @keyframes speedLine {
                    0% { opacity: 0; transform: translateX(40px); }
                    20% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(-60px); }
                  }
                  .animate-turbo-dash-no-vanish { animation: turboDashNoVanish 2s cubic-bezier(0.1, 0.8, 0.2, 1) infinite; }
                  .animate-speed-1 { animation: speedLine 0.4s linear infinite; }
                  .animate-speed-2 { animation: speedLine 0.5s linear infinite; animation-delay: 0.2s; }
                  @keyframes birdWingLeft {
                    0%, 100% { transform: rotate(15deg); }
                    50% { transform: rotate(-25deg); }
                  }
                  @keyframes birdWingRight {
                    0%, 100% { transform: rotate(-15deg); }
                    50% { transform: rotate(25deg); }
                  }
                  @keyframes birdFloat {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-6px) translateX(2px); }
                  }
                  .animate-bird-wing-l { animation: birdWingLeft 0.4s ease-in-out infinite; transform-origin: 160px 10px; }
                  .animate-bird-wing-r { animation: birdWingRight 0.4s ease-in-out infinite; transform-origin: 160px 10px; }
                  .animate-bird-float { animation: birdFloat 3s ease-in-out infinite; }
                `}</style>
                <div className="animate-pixel-bounce w-full h-full">
                  <svg viewBox="-30 -20 160 140" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-full drop-shadow-sm overflow-visible">

                    {/* Air/Wind Speed Lines behind Robot */}
                    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="100" y1="20" x2="140" y2="20" className="animate-speed-1" />
                      <line x1="120" y1="50" x2="160" y2="50" className="animate-speed-2" />
                      <line x1="90" y1="80" x2="130" y2="80" className="animate-speed-1" />
                    </g>

                    {/* Animated Bird 1 (Behind Robot) */}
                    <g className="animate-bird-float" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path className="animate-bird-wing-l" d="M 145 5 Q 152 0 160 10" />
                      <path className="animate-bird-wing-r" d="M 160 10 Q 168 0 175 5" />
                    </g>

                    {/* Animated Bird 2 (Below Toggle) */}
                    <g className="animate-bird-float" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '1s' }}>
                      <path className="animate-bird-wing-l" style={{ animationDelay: '0.2s', transformOrigin: '240px 50px' }} d="M 225 45 Q 232 40 240 50" />
                      <path className="animate-bird-wing-r" style={{ animationDelay: '0.2s', transformOrigin: '240px 50px' }} d="M 240 50 Q 248 40 255 45" />
                    </g>

                    {/* Big Floating Cloud & Bird (Left side near hand) */}
                    <g className="animate-bird-float" style={{ animationDelay: '1.2s' }}>
                      {/* Big Geometric Cloud */}
                      <g transform="translate(-65, 35)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M -30 40 C -50 40 -50 20 -30 20 C -20 -10 10 -10 20 20 C 40 20 40 40 20 40 Z" />
                      </g>
                      {/* Bird on top of cloud */}
                      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path className="animate-bird-wing-l" style={{ animationDelay: '0.1s', transformOrigin: '-70px 30px' }} d="M -85 25 Q -78 20 -70 30" />
                        <path className="animate-bird-wing-r" style={{ animationDelay: '0.1s', transformOrigin: '-70px 30px' }} d="M -70 30 Q -62 20 -55 25" />
                      </g>
                    </g>

                    {/* Antenna (Detailed) */}
                    <g className="animate-pixel-antenna">
                      <path d="M 70 25 L 70 5 L 85 5" strokeWidth="4" />
                      <circle cx="85" cy="5" r="3" strokeWidth="2" />
                    </g>
                    
                    {/* Left Arm Assembly (Mechanical) */}
                    <g className="animate-shoulder-left">
                      <circle cx="20" cy="45" r="3" strokeWidth="2" />
                      <line x1="20" y1="43" x2="-10" y2="43" strokeWidth="2" />
                      <line x1="20" y1="47" x2="-10" y2="47" strokeWidth="2" />
                      <g className="animate-elbow-left">
                        <circle cx="-10" cy="45" r="3" strokeWidth="2" />
                        <line x1="-12" y1="45" x2="-12" y2="75" strokeWidth="2" />
                        <line x1="-8" y1="45" x2="-8" y2="75" strokeWidth="2" />
                        <path d="M -16 75 L -4 75" strokeWidth="4" />
                      </g>
                    </g>

                    {/* Right Arm Assembly (Mechanical) */}
                    <g className="animate-shoulder-right">
                      <circle cx="80" cy="30" r="3" strokeWidth="2" />
                      <line x1="78" y1="28" x2="103" y2="8" strokeWidth="2" />
                      <line x1="82" y1="32" x2="107" y2="12" strokeWidth="2" />
                      <g className="animate-elbow-right">
                        <circle cx="105" cy="10" r="3" strokeWidth="2" />
                        <line x1="103" y1="10" x2="103" y2="-15" strokeWidth="2" />
                        <line x1="107" y1="10" x2="107" y2="-15" strokeWidth="2" />
                        <path d="M 97 -15 L 113 -15" strokeWidth="4" />
                      </g>
                    </g>

                    {/* TV Body (Chassis with details) */}
                    <rect x="20" y="25" width="60" height="45" rx="3" strokeWidth="8" />
                    <rect x="26" y="31" width="48" height="33" rx="1" strokeWidth="2" />

                    {/* Buttons on top */}
                    <path d="M 27 15 L 32 15 M 40 15 L 45 15 M 53 15 L 58 15" strokeWidth="6" />
                    <line x1="29.5" y1="15" x2="29.5" y2="21" strokeWidth="2" />
                    <line x1="42.5" y1="15" x2="42.5" y2="21" strokeWidth="2" />
                    <line x1="55.5" y1="15" x2="55.5" y2="21" strokeWidth="2" />

                    {/* Happy Eyes (Mechanical Shutter Style) */}
                    <g className="animate-pixel-eye-blink">
                      <path d="M 32 52 L 40 40 L 48 52" strokeWidth="3" />
                      <path d="M 35 52 L 40 45 L 45 52" strokeWidth="1" />
                      <path d="M 52 52 L 60 40 L 68 52" strokeWidth="3" />
                      <path d="M 55 52 L 60 45 L 65 52" strokeWidth="1" />
                    </g>

                    {/* Legs (Mechanical) */}
                    <g className="animate-leg-left">
                      <circle cx="35" cy="70" r="2" strokeWidth="2" />
                      <line x1="33" y1="70" x2="33" y2="90" strokeWidth="2" />
                      <line x1="37" y1="70" x2="37" y2="90" strokeWidth="2" />
                      <path d="M 39 90 L 22 90" strokeWidth="4" />
                    </g>
                    <g className="animate-leg-right">
                      <circle cx="65" cy="70" r="2" strokeWidth="2" />
                      <line x1="63" y1="70" x2="63" y2="90" strokeWidth="2" />
                      <line x1="67" y1="70" x2="67" y2="90" strokeWidth="2" />
                      <path d="M 61 90 L 78 90" strokeWidth="4" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Absolutely Positioned Car Animation (Zero layout impact) */}
              <div className="absolute hidden lg:block right-[40px] md:right-[100px] top-[95px] md:top-[105px] w-[140px] md:w-[160px] h-[40px] pointer-events-none text-slate-800 dark:text-white">
                <style>{`
                  @keyframes moveRoad {
                    0% { stroke-dashoffset: 40; }
                    100% { stroke-dashoffset: 0; }
                  }
                  @keyframes carRumble {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2.5px); }
                  }
                  @keyframes exhaustIdle {
                    0%, 48% { transform: translateX(0) scale(1); opacity: 0; }
                    50% { transform: translateX(0) scale(1); opacity: 0.8; }
                    65% { transform: translateX(-40px) scale(3); opacity: 0; }
                    100% { opacity: 0; }
                  }
                  @keyframes wheelSpinLaunch {
                    0% { transform: rotate(0deg); }
                    45% { transform: rotate(360deg); }
                    50% { transform: rotate(360deg); }
                    55%, 100% { transform: rotate(1800deg); }
                  }
                  @keyframes massiveSmoke {
                    0%, 52% { opacity: 0; transform: scale(0.1) translateX(0); }
                    55% { opacity: 1; transform: scale(1) translateX(-10px); }
                    80% { opacity: 0; transform: scale(1.5) translateX(-40px); }
                    100% { opacity: 0; }
                  }
                  @keyframes massiveSparks {
                    0%, 52% { opacity: 0; transform: scale(0.1) translateX(0); }
                    55% { opacity: 1; transform: scale(2) translateX(20px); }
                    65% { opacity: 0; transform: scale(0) translateX(-100px); }
                    100% { opacity: 0; }
                  }
                  @keyframes turboDashLaunch {
                    0% { transform: translateX(-80px); opacity: 1; }
                    45% { transform: translateX(0); opacity: 1; }
                    50% { transform: translateX(0); opacity: 1; }
                    52% { transform: translateX(-10px); opacity: 1; }
                    55% { transform: translateX(1200px); opacity: 1; }
                    56%, 85% { transform: translateX(1200px); opacity: 0; }
                    90% { transform: translateX(-80px); opacity: 0; }
                    92% { transform: translateX(-80px); opacity: 1; }
                    93% { transform: translateX(-80px); opacity: 0; }
                    94%, 100% { transform: translateX(-80px); opacity: 1; }
                  }
                  .animate-car-rumble { animation: carRumble 0.08s ease-in-out infinite; }
                  .animate-wheel-spin { animation: wheelSpinLaunch 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                  .animate-exhaust-1 { animation: exhaustIdle 4s linear infinite; }
                  .animate-exhaust-2 { animation: exhaustIdle 4s linear infinite; animation-delay: 0.1s; }
                  .animate-exhaust-3 { animation: exhaustIdle 4s linear infinite; animation-delay: 0.2s; }
                  .animate-massive-smoke { animation: massiveSmoke 4s cubic-bezier(0.1, 0.8, 0.2, 1) infinite; transform-origin: 30px 25px; }
                  .animate-massive-sparks { animation: massiveSparks 4s ease-out infinite; transform-origin: 45px 28px; }
                  .animate-turbo-dash { animation: turboDashLaunch 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                `}</style>
                <svg viewBox="-20 0 180 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="miter" className="w-full h-full drop-shadow-sm overflow-visible">
                  {/* Mountains (Far Background) */}
                  <g stroke="currentColor" strokeLinejoin="round" opacity="0.20" fill="none" strokeWidth="1.2">
                    <path d="M -60 26 L -40 12 L -20 26 L 15 5 L 50 26 L 80 14 L 110 26 L 150 2 L 190 26 L 220 10 L 250 26" />
                    <path d="M -25 26 L -5 18 L 20 26" opacity="0.5" />
                    <path d="M 65 26 L 95 10 L 125 26" opacity="0.5" />
                    <path d="M 175 26 L 205 12 L 235 26" opacity="0.5" />
                  </g>

                  {/* Road Fence (Background) */}
                  <g stroke="currentColor" strokeLinecap="butt" opacity="0.35">
                    {/* Horizontal Rails */}
                    <line x1="-60" y1="26" x2="250" y2="26" strokeWidth="1.5" />
                    <line x1="-60" y1="32" x2="250" y2="32" strokeWidth="1.5" />
                    {/* Vertical Posts (drawn horizontally with thick dashed stroke) */}
                    <line x1="-60" y1="29" x2="250" y2="29" strokeWidth="9" strokeDasharray="2.5 37.5" />
                  </g>

                  {/* Road */}
                  <line x1="-60" y1="38" x2="250" y2="38" strokeWidth="4" strokeDasharray="25 15" />
                  
                  {/* Highly Realistic Black and White Smoke Burst */}
                  <g className="animate-massive-smoke">
                    {/* Inner dense core */}
                    <g fill="currentColor" opacity="0.6">
                      <circle cx="40" cy="28" r="10" />
                      <circle cx="20" cy="20" r="15" />
                      <circle cx="25" cy="35" r="12" />
                      <circle cx="5" cy="25" r="18" />
                      <circle cx="-10" cy="15" r="14" />
                      <circle cx="-15" cy="35" r="16" />
                    </g>
                    {/* Translucent detailed smoke layer */}
                    <g fill="currentColor" opacity="0.2">
                      <circle cx="35" cy="18" r="12" />
                      <circle cx="10" cy="10" r="20" />
                      <circle cx="-5" cy="40" r="15" />
                      <circle cx="-25" cy="25" r="22" />
                    </g>
                    {/* Realistic swirling cloud outlines */}
                    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 40 18 C 30 5, 10 5, 0 15 C -15 10, -35 20, -30 35 C -35 50, -5 50, 5 45 C 15 55, 35 55, 45 40 C 55 35, 50 20, 40 18 Z" />
                      <path d="M 30 20 C 20 10, 5 15, 0 25 C -10 20, -15 30, -10 40 C -5 50, 10 45, 15 35 C 25 45, 40 40, 40 30 C 45 20, 35 15, 30 20 Z" />
                      {/* Inner swirls */}
                      <path d="M 10 20 Q 20 15 25 25" />
                      <path d="M -5 30 Q -10 20 0 15" />
                      <path d="M -15 35 Q -5 45 10 40" />
                    </g>
                  </g>
                  
                  {/* Realistic Black and White Turbo Flame/Thrust */}
                  <g className="animate-massive-sparks">
                    {/* Thrust core (starts at exhaust x=45, y=28) */}
                    <path d="M 45 28 L 25 20 L 32 28 L 15 30 L 35 34 L 20 40 L 45 30 Z" fill="currentColor" opacity="0.8" />
                    {/* Thrust outer lines / jagged flame */}
                    <path d="M 45 28 L 15 16 L 25 24 L 0 28 L 20 32 L 5 45 L 45 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M 40 28 L 30 26 L 35 28 L 25 30 L 35 31 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  </g>

                  {/* Turbo Dash Wrapper (Only the car vanishes here) */}
                  <g className="animate-turbo-dash">
                    {/* Car Rumble Wrapper */}
                    <g className="animate-car-rumble">

                      {/* Idling Exhaust Smoke */}
                      <g fill="currentColor" stroke="none">
                        <circle cx="45" cy="30" r="3" className="animate-exhaust-1" />
                        <circle cx="40" cy="28" r="4" className="animate-exhaust-2" />
                        <circle cx="35" cy="32" r="5" className="animate-exhaust-3" />
                      </g>

                      {/* Solid Silhouette Background to make the car opaque */}
                      <path d="M 45 28 L 45 18 L 58 18 C 65 12, 75 10, 85 10 L 95 10 C 105 10, 115 16, 120 18 L 135 20 L 138 22 L 138 28 L 125 30 L 45 30 Z" className="fill-white dark:fill-black" stroke="none" />

                      {/* Realistic BMW Body (Muscular stance, distinct trunk and hood) */}
                      <path d="M 45 28 L 45 18 L 58 18 C 65 12, 75 10, 85 10 L 95 10 C 105 10, 115 16, 120 18 L 135 20 L 138 22 L 138 28 L 125 30 M 105 30 L 75 30 M 60 30 L 45 30 L 45 28" strokeWidth="2" strokeLinejoin="round" fill="none" />
                      
                      {/* BMW Signature Kidney Grille */}
                      <rect x="134" y="22" width="1.5" height="4" rx="0.5" strokeWidth="1" fill="none" />
                      <rect x="136.5" y="22" width="1.5" height="4" rx="0.5" strokeWidth="1" fill="none" />
                      
                      {/* BMW Window with Hofmeister Kink */}
                      <path d="M 82 12 L 95 12 L 110 18 L 85 18 L 68 18 L 76 14 Z" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                      
                      {/* Pillar separating front and rear windows */}
                      <line x1="90" y1="12" x2="85" y2="18" strokeWidth="1.5" />

                      {/* BMW Angel Eye Headlights */}
                      <circle cx="127" cy="23.5" r="1.5" strokeWidth="1" fill="none" />
                      <circle cx="131" cy="23.5" r="1.5" strokeWidth="1" fill="none" />
                      
                      {/* Iconic BMW side character line */}
                      <line x1="50" y1="20" x2="120" y2="20" strokeWidth="1" />
                      
                      {/* Dual Exhaust pipes */}
                      <line x1="45" y1="26.5" x2="40" y2="26.5" strokeWidth="1.5" />
                      <line x1="45" y1="29" x2="40" y2="29" strokeWidth="1.5" />

                      {/* Back Racing Wheel */}
                      <g style={{ transformOrigin: '70px 30px' }} className="animate-wheel-spin">
                        <circle cx="70" cy="30" r="7" strokeWidth="2.5" className="fill-white dark:fill-black" />
                        <circle cx="70" cy="30" r="3" strokeWidth="1" fill="none" />
                        <line x1="70" y1="23" x2="70" y2="37" strokeWidth="1" />
                        <line x1="63" y1="30" x2="77" y2="30" strokeWidth="1" />
                        <line x1="65" y1="25" x2="75" y2="35" strokeWidth="1" />
                        <line x1="65" y1="35" x2="75" y2="25" strokeWidth="1" />
                      </g>
                      
                      {/* Front Racing Wheel */}
                      <g style={{ transformOrigin: '115px 30px' }} className="animate-wheel-spin">
                        <circle cx="115" cy="30" r="7" strokeWidth="2.5" className="fill-white dark:fill-black" />
                        <circle cx="115" cy="30" r="3" strokeWidth="1" fill="none" />
                        <line x1="115" y1="23" x2="115" y2="37" strokeWidth="1" />
                        <line x1="108" y1="30" x2="122" y2="30" strokeWidth="1" />
                        <line x1="110" y1="25" x2="120" y2="35" strokeWidth="1" />
                        <line x1="110" y1="35" x2="120" y2="25" strokeWidth="1" />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              {/* Desktop Theme Toggle */}
              <button onClick={toggle} className={`hidden sm:flex shrink-0 rounded-none h-[22px] w-[40px] md:h-[26px] md:w-[46px] cursor-pointer overflow-hidden ${theme === 'light' ? 'border border-gray' : 'border border-[#333] shadow-sm'}`}>
                  {theme === 'light' ? (
                    <>
                      <div className="w-1/2 h-full bg-white flex items-center justify-center text-slate-500"><i className="fas fa-sun text-[11px]"></i></div>
                      <div className="w-1/2 h-full bg-[#e2e8f0]"></div>
                    </>
                  ) : (
                    <>
                      <div className="w-1/2 h-full bg-[#333]"></div>
                      <div className="w-1/2 h-full bg-black flex items-center justify-center text-white"><i className="fas fa-moon text-[11px]"></i></div>
                    </>
                  )}
                </button>
            </div>

            {/* Location & Contact Info & Mobile Theme Toggle Row */}
            <div className="flex items-start md:items-center justify-between gap-2 mb-1.5 md:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center text-black dark:text-white gap-x-2 gap-y-0.5 text-[10.5px] min-[375px]:text-[12px] sm:text-[13px] md:text-[14px] font-medium leading-tight">
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <svg className="w-[9px] h-[9px] min-[375px]:w-[11px] min-[375px]:h-[11px] md:w-[16px] md:h-[16px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Cubacub Mandaue City
                </span>
                <span className="font-normal hidden sm:inline px-1">|</span>
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <i className="fas fa-mobile-alt text-[10px] min-[375px]:text-[12px] md:text-[14px] shrink-0"></i>
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
            <div className="relative text-black dark:text-white mb-2 md:mb-6 text-[11.5px] min-[375px]:text-[13px] sm:text-[13px] md:text-[16px] font-medium tracking-wide leading-tight">
              Full Stack Web Developer <span className="hidden sm:inline"> | Freelancer | Innovator</span>
            </div>

            {/* Actions (Sharp Corners) */}
            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
              <Link to="/projects" className="flex-1 sm:flex-none justify-center items-center gap-1 md:gap-2 px-1 py-1.5 md:px-4 md:py-2 bg-black dark:bg-white text-white dark:text-black text-[9.5px] min-[400px]:text-[11px] md:text-[13px] font-bold rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex whitespace-nowrap">
                <i className="far fa-calendar-alt text-[9.5px] min-[400px]:text-[11px] md:text-[13px]"></i> View Projects
              </Link>
              <a href="mailto:lourdangeloubufete17@gmail.com" className="flex-1 sm:flex-none justify-center items-center gap-1 md:gap-2 px-1 py-1.5 md:px-4 md:py-2 bg-white dark:bg-black text-black dark:text-white text-[9.5px] min-[400px]:text-[11px] md:text-[13px] font-bold border border-slate-200 dark:border-[#333] rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex whitespace-nowrap">
                <i className="far fa-envelope text-[9.5px] min-[400px]:text-[11px] md:text-[13px]"></i> Send Email
              </a>
              <a href="/BUFETE-RESUME.pdf" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto mt-0.5 sm:mt-0 flex items-center justify-between gap-2 md:gap-6 px-2 min-[400px]:px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-black text-black dark:text-white text-[10px] min-[400px]:text-[12px] md:text-[13px] font-bold border border-slate-200 dark:border-[#333] rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap">
                <span className="flex items-center gap-1.5 md:gap-2"><i className="far fa-file-alt text-[10px] min-[400px]:text-[11px] md:text-[13px]"></i> Resume</span>
                <i className="fas fa-chevron-right text-[8px] md:text-[10px] text-black dark:text-white"></i>
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
              <section className="order-1 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors  dark:shadow-none">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="far fa-user text-[17px] text-black dark:text-white"></i> About
                </h2>
                <div className="space-y-4 text-black dark:text-slate-100 leading-relaxed text-[14.5px]">
                  <p>I am a Full Stack Web Developer with a strong interest in leveraging technology to solve real-world problems. I specialize in transforming complex ideas into intuitive, efficient, and user-friendly digital solutions.</p>
                  <p>I continuously develop my expertise in both front-end and back-end technologies, with a focus on building scalable, high-performance applications. My goal is to create systems that are not only functional but also seamless and engaging for users.</p>
                  <p>I am committed to continuous improvement and staying current with emerging technologies. I approach every project as an opportunity to innovate, refine my skills, and deliver meaningful results.</p>
                </div>
              </section>

              {/* Tech Stack */}
              <section className="order-4 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-cog text-[17px] text-black dark:text-white"></i> Tech Stack
                  </h2>
                  <Link to="/tech-stack" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</Link>
                </div>

                {/* Frontend */}
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Frontend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-html5 text-orange-500 text-sm"></i> HTML5
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-css3-alt text-blue-500 text-sm"></i> CSS3
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-js text-yellow-400 text-sm"></i> JavaScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <span className="text-blue-500 font-bold bg-blue-100 dark:bg-blue-900/50 px-1 rounded-sm text-[9px]">TS</span> TypeScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-react text-sky-400 text-sm"></i> React
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-neos text-black dark:text-white text-sm"></i> Next.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-wind text-cyan-400 text-sm"></i> Tailwind CSS
                    </span>
                  </div>
                </div>

                {/* Backend */}
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Backend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-node-js text-green-500 text-sm"></i> Node.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-server text-slate-500 text-sm"></i> Express.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-laravel text-red-500 text-sm"></i> Laravel
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-code text-indigo-500 text-sm"></i> .NET
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-hashtag text-purple-500 text-sm"></i> C#
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-database text-blue-400 text-sm"></i> MySQL
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-fire text-yellow-500 text-sm"></i> Firebase
                    </span>
                  </div>
                </div>

                {/* Tools & DevOps */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-3">Tools & DevOps</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-git-alt text-orange-600 text-sm"></i> Git
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-github text-black dark:text-white text-sm"></i> GitHub
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fas fa-space-shuttle text-orange-500 text-sm"></i> Postman
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-black text-[12px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                      <i className="fab fa-microsoft text-blue-500 text-sm"></i> Azure DevOps
                    </span>
                  </div>
                </div>
              </section>
              {/* Featured Projects */}
              <section id="projects" className="order-5 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-folder-open text-[17px] text-black dark:text-white"></i> Featured Projects
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
              <section className="order-3 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-briefcase text-[17px] text-black dark:text-white"></i> Experience
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
              <section className="order-2 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-graduation-cap text-[17px] text-black dark:text-white"></i> Education
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
              <section className="order-6 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none md:-ml-4">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-[#333]">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-certificate text-[17px] text-black dark:text-white"></i> Certifications
                  </h2>
                  <Link to="/certification" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</Link>
                </div>
                <div className="space-y-4">
                  {certificates.map((cert, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-black border border-slate-100 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors flex flex-col justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cert.title}</h3>
                        <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">{cert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Social Links */}
              <section className="order-7 md:order-none bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none md:-ml-4">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="fas fa-link text-[17px] text-black dark:text-white"></i> Social Links
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
          <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">

              {/* Left Side: Let's work together */}
              <div className="space-y-6">
                <h2 className="-mt-2 md:-mt-3 text-[32px] md:text-[25px] font-bold text-black dark:text-white tracking-tight">
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
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
                  <i className="far fa-paper-plane text-[17px] text-black dark:text-white"></i> Direct Message
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
            <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] transition-colors dark:shadow-none flex-1 flex flex-col">
              <h2 className="-mt-4 md:-mt-5 text-[21px] font-bold text-black dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-[#333] capitalize flex items-center gap-3">
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
          <p>&copy; {new Date().getFullYear()} Lourd Angelou D. Bufete. All Rights Reserved.</p>
          <p>Built with React & Tailwind CSS.</p>
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