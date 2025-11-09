import React, { useEffect, useMemo, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

function AutoSlideImage({ images, alt, className, intervalMs = 3500 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const timerId = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timerId);
  }, [images, intervalMs]);
  return (
    <img src={images[index]} alt={alt} className={className} />
  );
}

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

function Header({ onToggleTheme, theme }) {
  return (
    <header 
      id="header" 
      // These classes are now applied permanently, not just on scroll:
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md"
    >
      {/* Changed px-14 to px-6 for better responsive padding */}
      <nav className="container mx-auto px-10 py-3 flex justify-between items-center">
        <a href="#home" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">Lourd</span>
        </a>
        
        {/* Updated Nav Links: Matches screenshot style */}
        <div id="desktop-nav" className="hidden md:flex space-x-8 items-center font-medium text-gray-700 dark:text-gray-300">
          <a href="#home" className="nav-link hover:text-sky-500 transition-colors duration-300">Home</a>
          <a href="#about" className="nav-link hover:text-sky-500 transition-colors duration-300">About</a>
          <a href="#skills" className="nav-link hover:text-sky-500 transition-colors duration-300">Skills</a>
          <a href="#projects" className="nav-link hover:text-sky-500 transition-colors duration-300">Projects</a>
          <a href="#contact" className="nav-link text-sky-500 px-5 py-2 border-2 accent-border rounded-full hover:accent-bg transition-all duration-300">Contact</a>
          
          <button onClick={onToggleTheme} type="button" aria-label="Toggle theme" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
        </div>
        
        <MobileMenu onToggleTheme={onToggleTheme} theme={theme} />
      </nav>
    </header>
  );
}

function MobileMenu({ onToggleTheme, theme }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* Menu buttons row */}
      <div className="flex items-center md:hidden">
        <button onClick={onToggleTheme} aria-label="Toggle theme" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 mr-2">
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>

        <button className="z-50" onClick={() => setOpen(o => !o)}>
          <i className={`fas ${open ? 'fa-times' : 'fa-bars'} text-2xl dark:text-white`}></i>
        </button>
      </div>

      {/* Overlay for dimming background */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar menu panel */}
      <div 
        id="mobile-menu" 
        className={`fixed top-0 right-0 bottom-0 z-50 w-2/3 max-w-xs h-full p-8 pt-20 flex flex-col items-start space-y-8 text-2xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out${open ? ' translate-x-0' : ' translate-x-full'}`}
      >
        {/* X close button, top right */}
        <button type="button" aria-label="Close sidebar" onClick={() => setOpen(false)}
          className="absolute top-5 right-5 text-gray-600 dark:text-gray-300 text-3xl focus:outline-none hover:text-blue-500 z-50 bg-transparent p-2">
          &#x2715;
        </button>
        {['home', 'about', 'skills', 'projects', 'contact'].map(id => (
          <a key={id} href={`#${id}`} className="nav-link mobile-link font-medium text-gray-700 dark:text-gray-300" onClick={() => setOpen(false)}>
            {id[0].toUpperCase() + id.slice(1)}
          </a>
        ))}
      </div>
    </>
  );
}

// === TYPEWRITER FUNCTION RESTORED ===
function Typewriter() {
  const words = useMemo(() => ['learning.', 'creating.', 'innovating.'], []);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const currentWord = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) setCharIndex(c => c + 1);
      else if (isDeleting && charIndex > 0) setCharIndex(c => c - 1);
      else {
        setIsDeleting(v => !v);
        if (isDeleting) setWordIndex(i => (i + 1) % words.length);
      }
    }, isDeleting ? 80 : 120);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words]);
  useEffect(() => {
    if (!isDeleting && charIndex === 0) setTimeout(() => {}, 1200);
  }, [isDeleting, charIndex]);
  return <span className="typewriter">{words[wordIndex].substring(0, charIndex)}</span>;
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target);} });
    }, { threshold: 0.1 });
    elements.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useActiveNav() {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const desktopLinks = document.querySelectorAll('#desktop-nav a.nav-link');
    const mobileLinks = document.querySelectorAll('#mobile-menu a.nav-link');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          [...desktopLinks, ...mobileLinks].forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
    return () => sectionObserver.disconnect();
  }, []);
}

// Email validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if email domain exists (simplified validation)
async function validateEmailDomain(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Check common email providers (these are known valid domains)
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 
      'aol.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
      'gmx.com', 'live.com', 'msn.com', 'ymail.com', 'rocketmail.com',
      'me.com', 'mac.com', 'inbox.com', 'fastmail.com', 'tutanota.com'
    ];
    
    if (commonDomains.includes(domain.toLowerCase())) {
      return true;
    }
    
    // For other domains, validate format and check domain structure
    // Check if domain has valid structure (contains dot, reasonable length)
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (domainPattern.test(domain)) {
      // Additional check: domain should have at least one dot and end with valid TLD
      const parts = domain.split('.');
      if (parts.length >= 2 && parts[parts.length - 1].length >= 2) {
        // For custom domains, we assume they're valid if format is correct
        // In a production environment, you could add DNS lookup here
        return true;
      }
    }
    
    // Optional: Use Abstract API for advanced validation (requires API key)
    // Uncomment and add your API key if you want to use this feature
    /*
    try {
      const apiKey = process.env.REACT_APP_ABSTRACT_API_KEY || 'YOUR_API_KEY';
      if (apiKey && apiKey !== 'YOUR_API_KEY') {
        const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          return data.deliverability === 'DELIVERABLE' || data.is_valid_format?.value === true;
        }
      }
    } catch (apiError) {
      console.log('Email validation API not configured, using format validation only');
    }
    */
    
    // Fallback: validate format only
    return validateEmail(email);
  } catch (error) {
    console.error('Email validation error:', error);
    return validateEmail(email); // Fallback to basic regex validation
  }
}

function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailValidationStatus, setEmailValidationStatus] = useState(null); // 'valid', 'invalid', 'checking', or null

  // Initialize EmailJS (configure in EMAILJS_SETUP.md)
  useEffect(() => {
    // EmailJS public key - Replace with your actual public key
    // You can also use environment variables: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY";
    if (publicKey && publicKey !== "YOUR_EMAILJS_PUBLIC_KEY") {
      emailjs.init(publicKey);
      console.log('EmailJS initialized with public key:', publicKey.slice(0, 4) + '***');
    } else {
      console.warn('EmailJS public key not configured. Check your .env file.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  // Handler to prevent numbers in name fields and auto-capitalize first letter
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    // Remove any numbers from the input
    let filteredValue = value.replace(/[0-9]/g, '');
    
    // Capitalize the first letter of each word
    if (filteredValue.length > 0) {
      filteredValue = filteredValue
        .split(' ')
        .map(word => {
          if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          return word;
        })
        .join(' ');
    }
    
    setFormData(prev => ({ ...prev, [name]: filteredValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  // Handler to prevent number keypress in name fields
  const handleNameKeyPress = (e) => {
    // Block numbers (0-9) from being entered
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email) {
      setEmailValidationStatus(null);
      return;
    }

    // Basic format validation
    if (!validateEmail(formData.email)) {
      setEmailValidationStatus('invalid');
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    // Advanced validation
    setEmailValidating(true);
    setEmailValidationStatus('checking');
    setErrors(prev => ({ ...prev, email: '' }));

    try {
      const isValid = await validateEmailDomain(formData.email);
      if (isValid) {
        setEmailValidationStatus('valid');
        setErrors(prev => ({ ...prev, email: '' }));
      } else {
        setEmailValidationStatus('invalid');
        setErrors(prev => ({ ...prev, email: 'This email address may not be valid or active. Please check and try again.' }));
      }
    } catch (error) {
      console.error('Email validation error:', error);
      // If validation fails, allow submission but show warning
      setEmailValidationStatus('valid');
      setErrors(prev => ({ ...prev, email: '' }));
    } finally {
      setEmailValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      // EmailJS service parameters
      // Replace these with your actual EmailJS service ID, template ID, and public key
      // You can also use environment variables (recommended for production)
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY";

      // Debug: Log configuration (without exposing full keys)
      console.log('EmailJS Configuration:', {
        serviceId: serviceId !== "YOUR_SERVICE_ID" ? serviceId : "NOT SET",
        templateId: templateId !== "YOUR_TEMPLATE_ID" ? templateId : "NOT SET",
        publicKey: publicKey !== "YOUR_EMAILJS_PUBLIC_KEY" ? publicKey.slice(0, 4) + "***" : "NOT SET"
      });

      // Check if EmailJS is configured
      if (serviceId === "YOUR_SERVICE_ID" || templateId === "YOUR_TEMPLATE_ID" || publicKey === "YOUR_EMAILJS_PUBLIC_KEY") {
        throw new Error("EmailJS is not configured. Please check your .env file and restart the development server.");
      }

      // Template parameters - must match your EmailJS template variables
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'lourdangeloubufete17@gmail.com', // Your email
      };

      console.log('Sending email with params:', { ...templateParams, message: templateParams.message.substring(0, 50) + '...' });

      // Send email using EmailJS
      // Pass publicKey to ensure it works (even though we initialized in useEffect)
      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      console.log('Email sent successfully:', response);

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
      setEmailValidationStatus(null);
      
      // Reset status message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Email sending error:', error);
      console.error('Error details:', {
        serviceId,
        templateId,
        publicKey: publicKey ? '***' + publicKey.slice(-4) : 'NOT SET',
        errorMessage: error.text || error.message || 'Unknown error',
        status: error.status,
        response: error.response
      });
      
      // Show more specific error message
      let errorMessage = 'Failed to send message. Please check all fields and try again.';
      if (error.text) {
        errorMessage = `EmailJS Error: ${error.text}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      } else if (serviceId === "YOUR_SERVICE_ID" || templateId === "YOUR_TEMPLATE_ID" || publicKey === "YOUR_EMAILJS_PUBLIC_KEY") {
        errorMessage = 'EmailJS is not configured. Please check your .env file and restart the server.';
      }
      
      setSubmitStatus('error');
      // Store error message for display (we'll update the UI to show it)
      setErrors(prev => ({ ...prev, _submit: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span>Thank you! Your message has been sent successfully. I'll get back to you soon.</span>
          </div>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors._submit || 'Failed to send message. Please check all fields and try again.'}</span>
          </div>
          <p className="text-sm mt-2 opacity-75">Check the browser console (F12) for more details.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyPress}
            pattern="[A-Za-z\s'-]+"
            title="Only letters, spaces, hyphens, and apostrophes are allowed"
            className={`w-full p-3 bg-white/80 dark:bg-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
              errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div className="w-full">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyPress}
            pattern="[A-Za-z\s'-]+"
            title="Only letters, spaces, hyphens, and apostrophes are allowed"
            className={`w-full p-3 bg-white/80 dark:bg-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
              errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            className={`w-full p-3 bg-white/80 dark:bg-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
              errors.email ? 'border-red-500' : 
              emailValidationStatus === 'valid' ? 'border-green-500' :
              'border-gray-300 dark:border-gray-600'
            } text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 pr-10`}
          />
          {emailValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <i className="fas fa-spinner fa-spin text-sky-500"></i>
            </div>
          )}
          {!emailValidating && emailValidationStatus === 'valid' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <i className="fas fa-check-circle text-green-500"></i>
            </div>
          )}
          {!emailValidating && emailValidationStatus === 'invalid' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <i className="fas fa-times-circle text-red-500"></i>
            </div>
          )}
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
        {emailValidationStatus === 'valid' && !errors.email && (
          <p className="mt-1 text-sm text-green-500">Email address is valid</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full p-3 bg-white/80 dark:bg-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
            errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400`}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
        )}
      </div>

      <div>
        <textarea
          name="message"
          placeholder="Your Message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          className={`w-full p-3 bg-white/80 dark:bg-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
            errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400`}
        ></textarea>
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-sky-500 text-white font-bold rounded-full shadow-lg transform transition-transform duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Sending...
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane"></i>
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

export default function App() {
  const { theme, toggle } = useDarkMode();
  useReveal();
  useActiveNav();

  return (
    <main>
      <Header onToggleTheme={toggle} theme={theme} />
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center relative"
        style={{ 
          backgroundImage: `url('/hero-bg.jpg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-0"></div>
        <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-center gap-4 lg:gap-32 relative z-10 pt-32 pb-12 md:pt-0 md:pb-0">
          
          {/* Left Column (Text Content) */}
          <div className="text-center md:text-left max-w-2xl">
            <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              👋 Welcome to my portfolio
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
              Hi! I'm <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Lourd Angelou D. Bufete</span>
            </h1>
            
            <h2 className="text-2xl md:text-2xl text-sky-500 font-bold mb-6">
              BSIT Student & Aspiring Web Developer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto md:mx-0">
              A passionate IT student, currently exploring the world of web development 
              and creating engaging digital experiences.
              Always <Typewriter />
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-8">
              <a 
                href="#projects" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform transition-all duration-300"
              >
                <i className="fas fa-briefcase mr-2"></i>
                View My Work
              </a>
              <a 
                href="#contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Get In Touch
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-4">
              {[
                { href: 'https://github.com/yurshtinkai', label: 'GitHub', icon: 'fab fa-github' },
                { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'fab fa-linkedin-in' },
                { href: 'https://facebook.com/angelou.bufete.5', label: 'Facebook', icon: 'fab fa-facebook-f' },
              ].map(s => (
                <a 
                  key={s.label} 
                  href={s.href} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label={s.label}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <i className={`${s.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div className="relative mb-12 md:mb-0 flex-shrink-0">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl relative z-10">
              <img 
                src="/lourd.jpg"
                alt="Lourd Angelou D. Bufete Portrait" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute inset-0 rounded-full border-[12px] border-white dark:border-white" style={{ transform: 'scale(1.03)' }}></div>
            
            {/* </> Icon */}
            <div className="absolute top-3 -right-7 w-10 h-10 md:w-14 md:h-14 md:top-3 md:-right-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-20">
              <i className="fas fa-code text-lg md:text-2xl text-white"></i>
            </div>
          
            {/* Brain Icon */}
            <div className="absolute bottom-3 -left-7 w-10 h-10 md:w-14 md:h-14 md:bottom-3 md:-left-7 bg-purple-600 rounded-full flex items-center justify-center shadow-lg z-20">
              <i className="fas fa-brain text-lg md:text-2xl text-white"></i>
            </div>
          </div>

        </div>
        <div className="scroll-down-container">
          <div className="scroll-down-mouse">
            <span className="scroll-down-wheel"></span>
          </div>
        </div>
      </section>

      {/* All other sections go inside a container now */}
      <div className="container mx-auto px-6">
        {/* About */}
        <section id="about" className="py-20 reveal">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">About Me</h2>
          <div className="w-24 h-1 accent-bg mx-auto mb-12"></div>
          <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto gap-16">
            <div className="md:w-1/3"><img src="/lourid.jpg" alt="Lourd Angelou at work" className="rounded-lg shadow-xl w-80 h-80 mx-auto object-cover md:w-full md:h-96 md:mx-0" /></div>
            <div className="md:w-2/3 text-lg text-gray-700 dark:text-gray-400 space-y-4">
              <p>As a Bachelor of Science in Information Technology student, I have a deep fascination with how technology can solve real-world problems. This curiosity drives my journey in web development, where I enjoy transforming complex ideas into intuitive and effective digital solutions.</p>
              <p>I am eager to learn and grow, continuously developing my skills in both front-end and back-end development. My goal is to create experiences that are not only functional but also seamless and enjoyable for users.</p>
              <p>I believe in lifelong learning and staying up to date with the latest technologies. Every project is an opportunity to grow, innovate, and push the boundaries of what’s possible in web development.</p>
            </div>
          </div>
        </section>

        {/* My Values (This includes your dark mode fix) */}
        <section className="py-0 pb-20">
          <h2 className="text-3xl font-bold text-center mb-12 mt-10 text-gray-900 dark:text-white">My Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Innovation Card */}
            <div className="rounded-xl bg-blue-50 dark:bg-gray-800 flex flex-col items-center text-center p-10 shadow-sm">
              <span className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-500 mb-6"><i className="fas fa-lightbulb text-5xl text-white"></i></span>
              <h3 className="text-2xl font-semibold mb-3 dark:text-white">Innovation</h3>
              <p className="text-gray-700 text-lg leading-relaxed dark:text-gray-300">Always seeking creative solutions and pushing the boundaries of what's possible</p>
            </div>
            {/* Collaboration Card */}
            <div className="rounded-xl bg-green-50 dark:bg-gray-800 flex flex-col items-center text-center p-10 shadow-sm">
              <span className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6"><i className="fas fa-users text-5xl text-white"></i></span>
              <h3 className="text-2xl font-semibold mb-3 dark:text-white">Collaboration</h3>
              <p className="text-gray-700 text-lg leading-relaxed dark:text-gray-300">Believing in the power of teamwork and open communication to achieve great results</p>
            </div>
            {/* Excellence Card */}
            <div className="rounded-xl bg-purple-50 dark:bg-gray-800 flex flex-col items-center text-center p-10 shadow-sm">
              <span className="flex items-center justify-center w-24 h-24 rounded-full bg-purple-500 mb-6"><i className="fas fa-trophy text-5xl text-white"></i></span>
              <h3 className="text-2xl font-semibold mb-3 dark:text-white">Excellence</h3>
              <p className="text-gray-700 text-lg leading-relaxed dark:text-gray-300">Committed to delivering high-quality work that exceeds expectations</p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-20 reveal">
          <h2 className="text-3xl md:text-4xl text-center font-bold mb-2 dark:text-white">Tools and <span className="text-sky-500">Frameworks</span></h2>
          <div className="w-20 h-1 accent-bg mx-auto mb-12"></div>
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div><img src="/about.png" alt="Developer Illustration" className="transition-transform duration-500 hover:scale-105" /></div>
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Technical Skills</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-8">
                  {[
                    ['HTML5','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'],
                    ['CSS3','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'],
                    ['JavaScript','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'],
                    ['Tailwind CSS','https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg'],
                    ['React','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'],
                    ['TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg']
                  ].map(([name, src]) => (
                    <div className="text-center transition-transform duration-300 hover:scale-110 hover:-translate-y-1" key={name}>
                      <img src={src} alt={name} className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-semibold">{name}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Others</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-6 gap-y-8">
                  {[
                    ['Node.js','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'],
                    ['Express.js', 'custom'],
                    ['Laravel','https://www.vectorlogo.zone/logos/laravel/laravel-icon.svg'],
                    ['GitHub', 'custom'],
                    ['C#','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg'],
                    ['C++','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg'],
                    ['MySQL','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'],
                  ].map(([name, src]) => (
                    <div className="text-center transition-transform duration-300 hover:scale-110 hover:-translate-y-1" key={name}>
                      {src === 'custom' ? (
                        name === 'Express.js' ? (
                          <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.713H.024c-.112 1.143.2 2.34 1.067 3.162 1.17 1.1 2.88 1.288 4.316.58 1.09-.526 1.835-1.433 2.126-2.464h3.43c-.36 3.906-3.354 6.78-7.19 6.78-3.65 0-6.714-2.624-7.302-6.1zm8.83-2.246c-1.44 0-2.666 1.16-2.666 2.597 0 1.437 1.226 2.597 2.666 2.597s2.666-1.16 2.666-2.597c0-1.437-1.226-2.597-2.666-2.597z"/>
                            </svg>
                          </div>
                        ) : name === 'GitHub' ? (
                          <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </div>
                        ) : null
                      ) : (
                        <img src={src} alt={name} className="w-10 h-10 mx-auto mb-1" />
                      )}
                      <p className="text-sm">{name}</p>
                    </div>
                  ))}
                  <div className="text-center transition-transform duration-300 hover:scale-110 hover:-translate-y-1">
                    <i className="fas fa-brain text-4xl text-sky-500 mx-auto mb-1"></i>
                    <p className="text-sm">P-Solving</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-20 reveal">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Featured Projects</h2>
          <div className="w-20 h-1 accent-bg mx-auto mb-12"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div className="glass-card rounded-lg overflow-hidden group" key={i}>
                {i===2 ? (
                  <AutoSlideImage
                    images={[ '/registrarPic.png', '/registrarPic2.png', '/registrarPic3.png', '/registrarPic4.png', '/registrarPic5.png', '/registrarPic6.png']}
                    alt={'Registrar System [Capstone 2]'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : i===1 ? (
                  <AutoSlideImage
                    images={[ '/inventoryPic.png', '/inventoryPic2.png', '/inventoryPic3.png', '/inventoryPic4.png', '/inventoryPic5.png' ]}
                    alt={'Inventory System [App Dev]'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <AutoSlideImage
                    images={[ '/notepad1.png', '/notepad2.png', '/notepad3.png' ]}
                    alt={'Modern Notepad'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {i===1 ? 'Inventory System [App Dev]' : i===2 ? 'Registrar System [Capstone 2]' : 'Modern Notepad'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {i===1
                      ? 'A web-based inventory and monitoring system tailored for computer laboratories. Tracks PCs, peripherals, flags low stock, damaged items and provides reports for maintenance and audits with role-based access.'
                      : i===2
                      ? 'A Record Management System designed to digitize and streamline school operations. It enables the registrar to manage student records and automatically generate requested documents, while allowing students to conveniently submit online requests.'
                      : 'Modern Notepad is a web-based note-taking app that lets users create, edit, and organize notes with ease. It features auto-save, real-time sync, and end-to-end encryption for secure, accessible note management anytime, anywhere.'}
                  </p>
                  {i===1 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {['Laravel','MySQL'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {i===2 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {['React','Tailwind CSS','Node.js','Express.js','Sequelize','MySQL','RESTful API','Axios'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {i===3 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {['React','TypeScript','Tailwind CSS','Node.js','Express.js', 'MySQL','Sequelize'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-4">
                    <a
                      href={
                        i === 1 ? '#' : // link for Inventory System
                        i === 2 ? 'https://benedictocollege-rms.onrender.com' : // Registrar System link
                        'https://modern-notepad.onrender.com' // Modern Notepad link
                      } 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="accent-color hover:underline font-medium"
                    >
                      Live Demo
                    </a>
                    <a 
                      href={i === 1 ? 'https://github.com/yurshtinkai/Laravel-Inventory_system' : //Inventory System GitHub link
                      i === 2 ? 'https://github.com/yurshtinkai/REGISTRAR-RMS-FRONTEND' : // Registrar System
                      'https://github.com/yurshtinkai/MODERN-NOTEPAD-FRONTEND' // Modern Notepad GitHub link
                      } 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="accent-color hover:underline font-medium"
                    >Source Code
                  </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 reveal">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white"><span className="bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">Let's Connect</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Ready to bring your next project to life? I'd love to hear about your ideas and discuss how we can work together.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Left Column */}
            <div className="text-gray-700 dark:text-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
              <p className="mb-8">I'm currently available for new opportunities and exciting projects. Whether you want to discuss a potential collaboration or just say hello, I'd be happy to hear from you.</p>
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="contact-icon-bg dark:bg-gray-800 dark:text-sky-400"><i className="fas fa-envelope text-xl"></i></div>
                  <div><h4 className="font-semibold text-gray-800 dark:text-gray-200">Email</h4><p>lourdangeloubufete17@gmail.com</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="contact-icon-bg dark:bg-gray-800 dark:text-sky-400"><i className="fas fa-phone text-xl"></i></div>
                  <div><h4 className="font-semibold text-gray-800 dark:text-gray-200">Phone</h4><p>+63 (966) 804-4546</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="contact-icon-bg dark:bg-gray-800 dark:text-sky-400"><i className="fas fa-map-marker-alt text-xl"></i></div>
                  <div><h4 className="font-semibold text-gray-800 dark:text-gray-200">Location</h4><p>Cubacub Mandaue City</p></div>
                </div>
              </div>
              <div className="bg-sky-50 dark:bg-gray-800 p-6 rounded-lg border border-sky-100 dark:border-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Response Time</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">I typically respond to emails within 24 hours. For urgent matters, feel free to reach out via phone.</p>
              </div>
            </div>
            
            {/* Right Column (Form) */}
            <div>
              <ContactForm />
            </div>
          </div>
        </section>

        <footer className="bg-white/50 dark:bg-gray-900/50 py-8 mt-16">
          <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 Lourd Angelou D. Bufete. All Rights Reserved.</p>
            <p className="text-sm mt-2">Designed & Built by Lourd Angelou D. Bufete</p>
          </div>
        </footer>
      </div>
    </main>
  );
}