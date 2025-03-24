import React, { useEffect, useState } from 'react';

const DietPlan = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    // Handle scroll animations
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.plan-card, .benefit-card, .testimonial-card, .section-header');
      
      elements.forEach(element => {
        if (!element.classList.contains('fade-up')) {
          element.classList.add('fade-up');
        }

        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPosition < windowHeight - 100) {
          element.classList.add('active');
        }
      });
    };

    // Handle nav link activation on scroll
    const highlightNavLink = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll('section[id]');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          document.querySelector(`.nav-menu a[href="#${sectionId}"]`)?.classList.add('active');
        } else {
          document.querySelector(`.nav-menu a[href="#${sectionId}"]`)?.classList.remove('active');
        }
      });
    };

    // Dark mode toggle
    const handleDarkModeToggle = () => {
      setIsDarkMode(prevMode => {
        const newMode = !prevMode;
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        return newMode;
      });
    };

    // Initialize event listeners
    window.addEventListener('scroll', () => {
      animateOnScroll();
      highlightNavLink();
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('scroll', highlightNavLink);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      <nav>
        <button
          id="mobile-menu"
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <a href="#plan" className="nav-link">Plan</a>
          <a href="#benefits" className="nav-link">Benefits</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
        </div>
      </nav>

      <button
        id="themeToggle"
        className="btn"
        onClick={handleDarkModeToggle}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Example content */}
      <section id="plan" className="plan-card">Plan Section</section>
      <section id="benefits" className="benefit-card">Benefits Section</section>
      <section id="testimonials" className="testimonial-card">Testimonials Section</section>
    </div>
  );
};

export default DietPlan;
