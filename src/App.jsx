import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import emailjs from '@emailjs/browser';

// --- MINIMALIST HOOKS ---
function useDarkMode() {
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
      {submitStatus === 'success' && <div className="p-3 text-sm bg-green-50 text-green-700 rounded-md">Message sent!</div>}
      {submitStatus === 'error' && <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md">Failed to send message.</div>}

      <div className="flex gap-4">
        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
      </div>
      <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm" />
      <textarea name="message" placeholder="Your Message" rows="4" value={formData.message} onChange={handleChange} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm resize-none"></textarea>

      <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors">
        {isLoading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

// --- PROJECT CARD WITH SLIDER ---
const ProjectCard = ({ proj }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!proj.images || proj.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % proj.images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [proj.images]);

  return (
    <div className="group rounded-none bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col h-full overflow-hidden">

      {/* Image Slider */}
      {proj.images && proj.images.length > 0 && (
        <div className="w-full h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          {proj.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${proj.title} screenshot ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
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

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-sky-500 transition-colors">{proj.title}</h3>
        <p className="text-sm text-black dark:text-slate-100 flex-grow">{proj.desc}</p>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <a href={proj.demo} target="_blank" rel="noreferrer" className="hover:text-sky-500 flex items-center gap-1"><i className="fas fa-external-link-alt text-xs"></i> Demo</a>
          <a href={proj.source} target="_blank" rel="noreferrer" className="hover:text-sky-500 flex items-center gap-1"><i className="fab fa-github text-xs"></i> Code</a>
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
    '/gallery1.jpg',
    '/gallery2.jpg',
    '/gallery3.jpg',
    '/gallery4.jpg',
    '/gallery5.jpg',
    '/gallery6.jpg',
    '/gallery8.jpg',
    '/gallery9.jpg',
    '/gallery10.jpg',
    '/gallery11.jpg',
    '/gallery12.jpg',
    '/gallery13.jpg',
    '/gallery14.jpg',
    '/gallery15.jpg'

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
    <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none mt-6">
      <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
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
              className="h-48 md:h-56 w-auto object-cover snap-start border border-slate-200 dark:border-slate-800 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-16 bg-[#222222] flex items-center justify-center text-white/80 hover:text-white hover:bg-[#333333] transition-colors rounded-none"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Bottom: Instructions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-[#222222] px-5 py-2.5 rounded-none font-medium tracking-wide">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
// --- MAIN APP ---
export default function App() {
  const { theme, toggle } = useDarkMode();

  const projects = [
    {
      title: 'Registrar System [Capstone 2]',
      desc: 'A Record Management System designed to digitize and streamline school operations.',
      demo: 'https://benedictocollege-rms.onrender.com',
      source: 'https://github.com/yurshtinkai/REGISTRAR-RMS-FRONTEND',
      images: [
        '/registrarPic1.png',
        '/registrarPic2.png',
        '/registrarPic3.png',
        '/registrarPic4.png',
        '/registrarPic5.png',
        '/registrarPic6.png'
      ]
    },
    {
      title: 'Inventory System',
      desc: 'A web-based inventory and monitoring system tailored for computer laboratories.',
      demo: '#',
      source: 'https://github.com/yurshtinkai/Laravel-Inventory_system',
      images: [
        '/inventoryPic1.png',
        '/inventoryPic2.png',
        '/inventoryPic3.png',
        '/inventoryPic4.png',
        '/inventoryPic5.png'
      ]
    },
    {
      title: 'Modern Notepad',
      desc: 'A web-based note-taking app that lets users create, edit, and organize notes with ease.',
      demo: 'https://modern-notepad.onrender.com',
      source: 'https://github.com/yurshtinkai/MODERN-NOTEPAD-FRONTEND',
      images: [
        '/notepad1.png',
        '/notepad2.png',
        '/notepad3.png'
      ]
    },
    {
      title: 'Job Request Ticketing System',
      desc: 'A robust ticketing platform designed to manage, track, and resolve job requests efficiently.',
      demo: '#',
      source: '#',
      images: [
        '/jobrequestPic1.png',
        '/jobrequestPic2.png',
        '/jobrequestPic3.png',
        '/jobrequestPic4.png',
        '/jobrequestPic5.png',
        '/jobrequestPic6.png'
      ]
    },
    {
      title: 'Asset Management System',
      desc: 'A comprehensive management tool for tracking organizational assets and resources.',
      demo: '#',
      source: '#',
      images: [
        '/AMSpic0.png',
        '/AMSpic1.png',
        '/AMSpic2.png',
        '/AMSpic3.png',
        '/AMSpic4.png',
        '/AMSpic5.png',
        '/AMSpic6.png',
        '/AMSpic7.png',
        '/AMSpic8.png'
      ]
    },
    {
      title: 'Bagkuning E commerce',
      desc: 'A modern e-commerce storefront offering a seamless online shopping experience.',
      demo: 'https://bagkuning.com',
      source: 'https://github.com/bagkuning88/Bag-Kuning',
      images: [
        '/bagkuning1.png',
        '/bagkuning2.png',
        '/bagkuning3.png',
        '/bagkuning4.png',
        '/bagkuning5.png',
        '/bagkuning6.png',
        '/bagkuning7.png',
        '/bagkuning8.png',
        '/bagkuning9.png'
      ]
    }
  ];

  const tools = ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express.js', 'Laravel', '.NET', 'C#', 'C++', 'MySQL', 'Firebase', 'Git', 'GitHub', 'Postman', 'Azure DevOps'];

  const certificates = [
    { title: "Internship – Management Information Systems Office", desc: "Certificate of Completion • MIS Office, Mandaue City" },
    { title: "Best Poster Presenter – Online Records Management System", desc: "Certificate of Recognition • Benedicto College Research Congress (2025)" }
  ];

  const experiences = [
    { title: "Freelance Web Developer", desc: "Developing web applications for clients", year: "2026 - present" },
    { title: "OJT / Internship – Full-Stack Developer", desc: "Asset Management System at MISO, Mandaue City Hall", year: "2026" },
    { title: "Capstone Project – Back-End Developer", desc: "Record Management System for the registrar at benedicto College", year: "2025" },
    { title: "Full-Stack Mastery & GitHub Journey", desc: "started using GitHub and making full stack development project", year: "2024" },
    { title: "Frontend Specialization", desc: "HTML, CSS, and JavaScript, and explored modern frameworks", year: "2023" },
    { title: "Hello World! 👋🏻", desc: "Wrote my first line of code", year: "2022" }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1115] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">

      {/* Floating Theme Toggle is removed as it is now integrated into the header */}



      {/* Max Width Container */}
      <div className="max-w-[1024px] mx-auto px-6 pt-6 pb-16 md:pt-7 md:pb-24 animate-fade-in-up">

        {/* Profile Header (Horizontal layout matching screenshot) */}
        <header className="mb-4 md:mb-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Avatar (Square, no rounded corners) */}
          <img
            src="/lourd.jpg"
            alt="Lourd Angelou D. Bufete"
            className="w-[180px] h-[180px] md:w-[200px] md:h-[195px] rounded-none object-cover shrink-0"
          />

          {/* Info Block */}
          <div className="flex-1 w-full pt-1">
            {/* Name & Theme Toggle Row */}
            <div className="flex items-center justify-between mb-1.5">
              <h1 className="text-[28px] md:text-[32px] font-extrabold text-black dark:text-white tracking-tight flex items-center gap-2">
                Lourd Angelou D. Bufete
                <svg className="w-[20px] h-[20px] text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.5 12.5c0-1.58-.875-2.93-2.14-3.66.24-1.5-.18-3.08-1.23-4.14-1.06-1.05-2.65-1.47-4.15-1.22-.73-1.26-2.09-2.14-3.67-2.14s-2.94.88-3.67 2.14c-1.5-.25-3.09.17-4.15 1.22-1.05 1.06-1.47 2.65-1.23 4.15-1.26.73-2.14 2.08-2.14 3.66s.88 2.94 2.14 3.67c-.24 1.5.18 3.08 1.23 4.14 1.06 1.05 2.65 1.47 4.15 1.23.73 1.26 2.08 2.14 3.67 2.14s2.94-.88 3.67-2.14c1.5.24 3.09-.18 4.15-1.23 1.05-1.06 1.47-2.65 1.23-4.14 1.26-.73 2.14-2.09 2.14-3.67zm-12.75 3.9l-3.5-3.5 1.41-1.41 2.09 2.08 6.09-6.08 1.41 1.42-7.5 7.5z" />
                </svg>
              </h1>

              {/* Rectangular Theme Toggle */}
              <button onClick={toggle} className={`flex rounded-none h-[26px] w-[46px] cursor-pointer overflow-hidden ${theme === 'light' ? 'border border-gray' : 'border border-slate-600 shadow-sm'}`}>
                {theme === 'light' ? (
                  <>
                    <div className="w-1/2 h-full bg-white flex items-center justify-center text-slate-400">
                      <i className="fas fa-sun text-[10px]"></i>
                    </div>
                    <div className="w-1/2 h-full bg-[#e2e8f0]"></div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 h-full bg-slate-600"></div>
                    <div className="w-1/2 h-full bg-[#0f1115] flex items-center justify-center text-slate-400">
                      <i className="fas fa-moon text-[10px]"></i>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Location & Contact Info */}
            <div className="flex items-center flex-wrap text-black dark:text-white gap-2 mb-4 text-[14px] font-medium">
              <span className="flex items-center gap-1.5">
                <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Cubacub Mandaue City
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-normal">|</span>
              <span className="flex items-center gap-1.5">
                <i className="fas fa-mobile-alt text-[14px]"></i>
                +63 966 - 804 - 4546
              </span>
            </div>

            {/* Roles */}
            <div className="text-black dark:text-white mb-6 text-[15px] font-medium tracking-wide">
              Full Stack Web Developer \ Problem Solver \ Innovator
            </div>

            {/* Actions (Sharp Corners) */}
            <div className="flex flex-wrap gap-2.5">
              <a href="#projects" className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold rounded-none hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                <i className="far fa-calendar-alt"></i> View My Work
              </a>
              <a href="mailto:lourdangeloubufete17@gmail.com" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-black dark:text-white text-[13px] font-bold border border-slate-200 dark:border-slate-800 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <i className="far fa-envelope"></i> Send Email
              </a>
              <a href="/BUFETE-RESUME.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-6 px-4 py-2 bg-white dark:bg-slate-900 text-black dark:text-white text-[13px] font-bold border border-slate-200 dark:border-slate-800 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="flex items-center gap-2"><i className="far fa-file-alt"></i> Resume</span>
                <i className="fas fa-chevron-right text-[10px] text-slate-400"></i>
              </a>
            </div>
          </div>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6">

          {/* Left Column (Main Content) */}
          <div className="md:col-span-8 space-y-16">

            <div className="space-y-3">
              {/* About */}
              <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800  dark:shadow-none">
                <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
                  <i className="far fa-user text-[19px] text-black dark:text-white"></i> About
                </h2>
                <div className="space-y-4 text-black dark:text-slate-100 leading-relaxed text-[15px]">
                  <p>I am a Full Stack Web Developer with a strong interest in leveraging technology to solve real-world problems. I specialize in transforming complex ideas into intuitive, efficient, and user-friendly digital solutions.</p>
                  <p>I continuously develop my expertise in both front-end and back-end technologies, with a focus on building scalable, high-performance applications. My goal is to create systems that are not only functional but also seamless and engaging for users.</p>
                  <p>I am committed to continuous improvement and staying current with emerging technologies. I approach every project as an opportunity to innovate, refine my skills, and deliver meaningful results.</p>
                </div>
              </section>

              {/* Tech Stack */}
              <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white capitalize flex items-center gap-3">
                    <i className="fas fa-cog text-[19px] text-black dark:text-white"></i> Tech Stack
                  </h2>
                  <a href="#" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-400 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</a>
                </div>

                {/* Frontend */}
                <div className="mb-6">
                  <h3 className="text-[11px] font-bold text-slate-900 dark:text-slate-500 tracking-wider uppercase mb-3">Frontend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-html5 text-orange-500 text-sm"></i> HTML5
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-css3-alt text-blue-500 text-sm"></i> CSS3
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-js text-yellow-400 text-sm"></i> JavaScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="text-blue-500 font-bold bg-blue-100 dark:bg-blue-900/50 px-1 rounded-sm text-[9px]">TS</span> TypeScript
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-react text-sky-400 text-sm"></i> React
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-neos text-black dark:text-white text-sm"></i> Next.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-wind text-cyan-400 text-sm"></i> Tailwind CSS
                    </span>
                  </div>
                </div>

                {/* Backend */}
                <div className="mb-6">
                  <h3 className="text-[11px] font-bold text-slate-900 dark:text-slate-500 tracking-wider uppercase mb-3">Backend</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-node-js text-green-500 text-sm"></i> Node.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-server text-slate-500 text-sm"></i> Express.js
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-laravel text-red-500 text-sm"></i> Laravel
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-code text-indigo-500 text-sm"></i> .NET
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-hashtag text-purple-500 text-sm"></i> C#
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-c text-blue-600 text-sm"></i> C++
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-database text-blue-400 text-sm"></i> MySQL
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-fire text-yellow-500 text-sm"></i> Firebase
                    </span>
                  </div>
                </div>

                {/* Tools & DevOps */}
                <div>
                  <h3 className="text-[11px] font-bold text-slate-900 dark:text-slate-500 tracking-wider uppercase mb-3">Tools & DevOps</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-git-alt text-orange-600 text-sm"></i> Git
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-github text-black dark:text-white text-sm"></i> GitHub
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fas fa-space-shuttle text-orange-500 text-sm"></i> Postman
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[12px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <i className="fab fa-microsoft text-blue-500 text-sm"></i> Azure DevOps
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="md:col-span-4 space-y-10 md:space-y-16">

            {/* Experience */}
            {/* Experience */}
            <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none md:-ml-4">
              <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
                <i className="fas fa-briefcase text-[19px] text-black dark:text-white"></i> Experience
              </h2>

              {/* --- TIMELINE STRUCTURE STARTS HERE --- */}
              <div className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-4">
                {experiences.map((exp, i) => (
                  <div key={i} className="mb-8 last:mb-0 relative pl-6 group">

                    {/* Square Indicator (Active for first item, Hollow/Hover for the rest) */}
                    <div className={`absolute w-[10px] h-[10px] -left-[5px] top-1.5 transition-all duration-300 border
                      ${i === 0
                        ? 'bg-black border-black dark:bg-white dark:border-white' // Statically filled for "present"
                        : 'bg-white dark:bg-[#0f1115] border-slate-300 dark:border-slate-500 group-hover:bg-black group-hover:border-black dark:group-hover:bg-white dark:group-hover:border-white' // Hollow until hover for the rest
                      }`}>
                    </div>

                    <h3 className="text-[15px] font-bold text-black dark:text-white leading-tight transition-colors duration-300">{exp.title}</h3>
                    <p className="text-[14px] text-black dark:text-slate-100 mt-1.5 leading-relaxed">
                      {exp.desc} <br />
                      <span className="font-semibold text-black dark:text-slate-100 mt-0.5 inline-block">— {exp.year}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Featured Projects (Full Width) */}
        <div className="mt-1.5">
          <section id="projects" className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white capitalize flex items-center gap-3">
                <i className="fas fa-folder-open text-[19px] text-black dark:text-white"></i> Featured Projects
              </h2>
              <a href="#" className="-mt-4 md:-mt-5 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">View All &gt;</a>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projects.map((proj, i) => (
                <ProjectCard key={i} proj={proj} />
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Section: Connect & Contact */}
        {/* Bottom Section: Connect & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 mt-12 md:mt-2">

          {/* Certificates */}
          <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none h-full">
            <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
              <i className="fas fa-certificate text-[19px] text-black dark:text-white"></i> Certifications
            </h2>
            <div className="space-y-4">
              {certificates.map((cert, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-black border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cert.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none h-full">
            <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
              <i className="fas fa-link text-[19px] text-black dark:text-white"></i> Social Links
            </h2>
            <ul className="space-y-5">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <i className="fab fa-linkedin text-lg w-5 text-center"></i> LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/yurshtinkai" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <i className="fab fa-github text-lg w-5 text-center"></i> GitHub
                </a>
              </li>
              <li>
                <a href="https://facebook.com/angelou.bufete.5" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <i className="fab fa-facebook text-lg w-5 text-center"></i> Facebook
                </a>
              </li>
              <li>
                <a href="mailto:lourdangeloubufete17@gmail.com" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <i className="fas fa-envelope text-lg w-5 text-center"></i> Email Me
                </a>
              </li>
            </ul>
          </section>

          {/* Direct Message */}
          <section className="bg-white dark:bg-[#0f1115] p-6 md:p-8 rounded-none border border-slate-200 dark:border-slate-800 dark:shadow-none h-full">
            <h2 className="-mt-4 md:-mt-5 text-[21px] font-extrabold text-black dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-slate-800 capitalize flex items-center gap-3">
              <i className="far fa-paper-plane text-[19px] text-black dark:text-white"></i> Direct Message
            </h2>
            <ContactForm />
          </section>

        </div>
        <GallerySection />
        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lourd Angelou D. Bufete.</p>
          <p>Built with React & Tailwind.</p>
        </footer>
      </div>
    </main>
  );
}