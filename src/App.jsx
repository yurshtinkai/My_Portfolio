import React, { useEffect, useMemo, useRef, useState } from 'react';

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
  useEffect(() => {
    const header = document.getElementById('header');
    const onScroll = () => {
      if (window.scrollY > 50) header.classList.add('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-sm', 'shadow-md');
      else header.classList.remove('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-sm', 'shadow-md');
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header id="header" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <nav className="container mx-auto px-6 py-2 flex justify-between items-center">
        <a href="#home" className="text-2xl font-bold"><span className="bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">Lou</span><span>rd</span></a>
        <div id="desktop-nav" className="hidden md:flex space-x-8 items-center font-medium text-gray-600 dark:text-gray-300">
          <a href="#home" className="nav-link hover:text-sky-500 transition-colors duration-300">Home</a>
          <a href="#about" className="nav-link hover:text-sky-500 transition-colors duration-300">About</a>
          <a href="#skills" className="nav-link hover:text-sky-500 transition-colors duration-300">Skills</a>
          <a href="#projects" className="nav-link hover:text-sky-500 transition-colors duration-300">Projects</a>
          <a href="#contact" className="nav-link text-sky-500 px-4 py-2 border-2 accent-border rounded-full hover:accent-bg hover:text-sky-700 transition-all duration-300">Contact</a>
          <button onClick={onToggleTheme} type="button" aria-label="Toggle theme" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
        </div>
        <MobileMenu onToggleTheme={onToggleTheme} theme={theme} />
      </nav>
    </header>
  );
}

// src/App.jsx

function MobileMenu({ onToggleTheme, theme }) {
  const [open, setOpen] = useState(false);

  // New: Add an effect to prevent body scroll when the menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to reset the style when the component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <div className="flex items-center md:hidden">
      {/* --- Theme Toggle Button (no change here) --- */}
      <button onClick={onToggleTheme} aria-label="Toggle theme" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 mr-2">
        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
      </button>

      {/* --- Hamburger Button (no change here) --- */}
      <button className="z-50" onClick={() => setOpen(o => !o)}>
        <i className={`fas ${open ? 'fa-times' : 'fa-bars'} text-2xl dark:text-white`}></i>
      </button>
      
      {/* --- New: Background Overlay --- */}
      {/* This div will dim the main content when the menu is open */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 
                   ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* --- Updated: The Sidebar Menu --- */}
      <div 
        id="mobile-menu" 
        className={`fixed top-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-40 
                   w-2/3 max-w-sm p-8 pt-20 flex flex-col items-start space-y-8 text-2xl
                   transform transition-transform duration-300 ease-in-out
                   ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {['home', 'about', 'skills', 'projects', 'contact'].map(id => (
          <a key={id} href={`#${id}`} className="nav-link mobile-link font-medium text-gray-700 dark:text-gray-300" onClick={() => setOpen(false)}>
            {id[0].toUpperCase() + id.slice(1)}
          </a>
        ))}
      </div>
    </div>
  );
}

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

export default function App() {
  const { theme, toggle } = useDarkMode();
  useReveal();
  useActiveNav();

  return (
    <main className="container mx-auto px-6">
      <Header onToggleTheme={toggle} theme={theme} />
      <section id="home" className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center md:justify-center md:gap-x-24 pt-24 md:pt-0">
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2">Hi! I'm <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">Lourd Angelou D. Bufete</span></h1>
          <h2 className="text-2xl md:text-3xl accent-color font-semibold mb-4">BSIT Student</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">A passionate IT student from the Philippines, currently exploring the world of web development and creating engaging digital experiences. Always <Typewriter /></p>
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <a href="#projects" className="inline-block px-8 py-3 accent-bg text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300">View My Work</a>
            <div className="flex items-center space-x-2">
              {[
                { href: 'https://github.com/yurshtinkai', label: 'GitHub', svg: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>
                )},
                { href: 'https://linkedin.com', label: 'LinkedIn', svg: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                )},
                { href: 'https://facebook.com', label: 'Facebook', svg: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>
                )}
              ].map(s => (
                <div className="social-link-wrapper" key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors duration-300 p-3 bg-white/70 rounded-full shadow-md flex items-center justify-center">{s.svg}</a>
                  <span className="social-tooltip">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-12 md:mb-0 md:ml-12">
          <img src="/lourd.jpg" alt="Lourd Angelou D. Bufete Portrait" className="w-64 h-64 md:w-96 md:h-96 rounded-full object-cover border-8 border-white shadow-2xl" />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 reveal">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">About Me</h2>
        <div className="w-24 h-1 accent-bg mx-auto mb-12"></div>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3"><img src="/lourid.jpg" alt="Lourd Angelou at work" className="rounded-lg shadow-xl w-full h-96 object-cover" /></div>
          <div className="md:w-2/3 text-lg text-gray-700 dark:text-gray-400 space-y-4">
            <p>As a Bachelor of Science in Information Technology student, I have a deep fascination for how technology can solve real-world problems. This curiosity drives my journey in web development, where I enjoy turning complex ideas into intuitive and effective digital solutions.</p>
            <p>I am eager to learn and grow, constantly building on my skills in both front-end and back-end development. My goal is to craft experiences that are not only functional but also seamless and enjoyable for users.</p>
            <p>When I'm not studying or coding, you can find me exploring new technologies, collaborating on projects, or seeking inspiration for my next creation.</p>
          </div>
        </div>
      </section>

      {/* Skills (illustration and icons kept) */}
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
    ['TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'] // <-- Add this line
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

      {/* Projects (placeholder content kept) */}
      <section id="projects" className="py-20 reveal">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Featured Projects</h2>
        <div className="w-20 h-1 accent-bg mx-auto mb-12"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div className="glass-card rounded-lg overflow-hidden group" key={i}>
              <img
                src={i===1 ? '/inventoryPic.png' : i===2 ? '/registrarPic.png' : 'https://placehold.co/600x400/1F2937/E0F2FE?text=Personal+Portfolio'}
                alt={i===1 ? 'Inventory System [App Dev]' : i===2 ? 'Registrar System [Capstone 2]' : 'Personal Portfolio Website'}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {i===1 ? 'Inventory System [App Dev]' : i===2 ? 'Registrar System [Capstone 2]' : 'Personal Portfolio Website'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {i===1
                    ? 'A web-based inventory and monitoring system tailored for computer laboratories. Tracks PCs, peripherals, flags low stock, damaged items and provides reports for maintenance and audits with role-based access.'
                    : i===2
                    ? 'Developing a Student Management System to digitize and streamline school operations, featuring modules for student enrollment, grade management, attendance tracking, and automated report generation.'
                    : 'This very portfolio, designed to be a clean, modern, and responsive showcase of my skills and work. Built with React and Tailwind CSS.'}
                </p>
                {i===1 && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {['Laravel','php','MySQL'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {i===2 && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {['React','Tailwind CSS','Node.js','Express','Sequelize','MySQL','RESTful API','Axios'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {i===3 && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {['React','Tailwind CSS','Lucide Icons','React Icons'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/80 text-indigo-100 dark:bg-indigo-600/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex space-x-4">
                  <a href="https://rms-front-9our.onrender.com" target="_blank" rel="noopener noreferrer" className="accent-color hover:underline font-medium">Live Demo</a>
                  <a href="#" className="accent-color hover:underline font-medium">Source Code</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 reveal">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white"><span className="bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">Let's Connect</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Ready to bring your next project to life? I'd love to hear about your ideas and discuss how we can work together.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
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
            <div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for your message! This is a demo form.'); e.currentTarget.reset(); }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <input type="text" placeholder="First Name" className="w-full p-3 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border dark:border-gray-300 text-gray-900 dark:text-gray-200" />
                  <input type="text" placeholder="Last Name" className="w-full p-3 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border dark:border-gray-300 text-gray-900 dark:text-gray-200" />
                </div>
                <input type="email" placeholder="Email" className="w-full p-3 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border dark:border-gray-300 text-gray-900 dark:text-gray-200" />
                <input type="text" placeholder="Subject" className="w-full p-3 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border dark:border-gray-300 text-gray-900 dark:text-gray-200" />
                <textarea placeholder="Your Message" rows="5" className="w-full p-3 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 border dark:border-gray-300 text-gray-900 dark:text-gray-200"></textarea>
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-sky-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300"><i className="fas fa-paper-plane"></i>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white/50 dark:bg-gray-900/50 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Lourd Angelou D. Bufete. All Rights Reserved.</p>
          <p className="text-sm mt-2">Designed & Built by Lourd Angelou D. Bufete</p>
        </div>
      </footer>
    </main>
  );
}


