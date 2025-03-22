
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu) {
      mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Toggle the hamburger menu animation
        const bars = mobileMenu.querySelectorAll('.bar');
        if (mobileMenu.classList.contains('active')) {
          bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
          bars[1].style.opacity = '0';
          bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
          bars[0].style.transform = 'none';
          bars[1].style.opacity = '1';
          bars[2].style.transform = 'none';
        }
      });
    }
    
    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
        const bars = mobileMenu.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
    
    // Scroll animations
    const animateOnScroll = function() {
      const elements = document.querySelectorAll('.plan-card, .benefit-card, .testimonial-card, .section-header');
      
      elements.forEach(element => {
        // Add fade-up class to enable transition
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

    const handleDarkModeToggle = () => {
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                document.body.classList.toggle("dark-mode");
                localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
            });
        }
    };
    
    // Run once on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
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
    
    // Add active class to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
      const scrollPosition = window.scrollY;
      
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
    }
    
    window.addEventListener('scroll', highlightNavLink);
  });