document.addEventListener('DOMContentLoaded', function() {
  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-white/80', 'backdrop-blur-sm', 'shadow-md');
    } else {
      header.classList.remove('bg-white/80', 'backdrop-blur-sm', 'shadow-md');
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuIcon = mobileMenuBtn.querySelector('i');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMenu() {
    mobileMenu.classList.toggle('hidden');
    if (mobileMenu.classList.contains('hidden')) {
      mobileMenuIcon.classList.remove('fa-times');
      mobileMenuIcon.classList.add('fa-bars');
    } else {
      mobileMenuIcon.classList.remove('fa-bars');
      mobileMenuIcon.classList.add('fa-times');
    }
  }
  mobileMenuBtn.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

  // Typewriter effect
  const typewriterElement = document.querySelector('.typewriter');
  const words = ["learning.", "creating.", "innovating."];
  let wordIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    typewriterElement.textContent = currentWord.substring(0, charIndex);

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex++;
      setTimeout(type, 120);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(type, 80);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) {
        wordIndex = (wordIndex + 1) % words.length;
      }
      setTimeout(type, 1200);
    }
  }
  type();

  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(el => revealObserver.observe(el));

  // Active nav links on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#desktop-nav a.nav-link');
  const mobileNavLinks = document.querySelectorAll('#mobile-menu a.nav-link');

  const observerOptions = { rootMargin: '-50% 0px -50% 0px' };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
        mobileNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);
  sections.forEach(section => sectionObserver.observe(section));

  // Contact form submission (demo behavior)
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! This is a demo form.');
    contactForm.reset();
  });
});
