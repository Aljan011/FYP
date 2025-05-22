import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "../css/index.css"; 

const HomePage = () => {
  // const [activeIndex, setActiveIndex] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

   // Add useNavigate hook
   const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from local storage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      navigate('/profile/${storedUserId}'); // Redirect to profile page
    }
  }, [navigate]);

  useEffect(() => {
    // Apply dark mode class to entire document
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    
    // Update localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // New method to handle navigation to login/signup
  const handleAuthNavigation = () => {
    if (!isLoggedIn) {
      navigate('/signup');
    } else {
      navigate(`/profile/${userId}`);
    }
  };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleFAQToggle = (index) => {
  const faqItems = document.querySelectorAll('.faq-item');
  const target = faqItems[index];
  const answer = target.querySelector('.faq-answer');
//  setActiveIndex(activeIndex === index ? null : index);
  target.classList.toggle('active');

  if (target.classList.contains('active')) {
    answer.style.maxHeight = answer.scrollHeight + "px";
  } else {
    answer.style.maxHeight = "0px";
  }
};


    const startCounters = () => {
        document.querySelectorAll(".counter").forEach(counter => {
            let target = +counter.getAttribute("data-target");
            let count = 0;
            const increment = target / 100;
            
            const updateCounter = () => {
                count += increment;
                counter.textContent = Math.round(count);
                if (count < target) {
                    requestAnimationFrame(updateCounter);
                }
            };
            updateCounter();
        });
    };

    useEffect(() => {
        startCounters();
    }, []);

    return (
      <div id="app"  className={isDarkMode ? 'dark-mode' : ''}>
        <header className="header">
          <nav className="navbar">
            <div className="logo">
              <h1>GymFreak</h1>
            </div>
            <div className="nav-links" id="navLinks">
              <ul>
                <li><a href="#home" className="nav-link">Home</a></li>
                <li><a href="#about" className="nav-link">About</a></li>
                <li><a href="#faq" className="nav-link">FAQ</a></li>
              </ul>
            </div>
            <div className="nav-buttons">
              <button 
                className="theme-toggle"  
                onClick={toggleDarkMode} // Add onClick to toggle theme
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button 
              onClick={handleAuthNavigation} 
              className="btn btn-primary"
            >
              Login
            </button>
            </div>
            <div className="hamburger" id="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </nav>
        </header>
          
          <main>
/* Hero Section */
  
 <section id="home" className="gf-hero-section">
  <div className="gf-hero-content">
    <div className="gf-hero-text-box">
      <h1 className="gf-hero-title">Transform Your Fitness Journey</h1>
      <p className="gf-hero-subtitle">
        Track workouts, connect with trainers, achieve your goals
      </p>
      <div className="gf-hero-buttons">
        <a href="#intro" className="btn btn-primary">Explore Us</a>
        <button onClick={handleAuthNavigation} className="btn btn-secondary">Login Now</button>
      </div>
    </div>
  </div>

  <div className="gf-hero-image">
    <div className="gf-image-container">
      <img 
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
        alt="Fitness training"
      />
    </div>
  </div>
</section>


    
             {/* Introduction Section */}
     <section id="intro" className="gf-intro-section">
  <div className="gf-intro-container">
    
    <div className="gf-intro-header">
      <h2 className="gf-intro-title">Embrace the Power of Fitness</h2>
      <p className="gf-intro-description">
        Regular gym workouts not only build strength and endurance but also
        boost mental well-being, enhance sleep quality, and increase your
        overall energy levels. Whether you're a beginner or a fitness
        enthusiast, consistency is the key to transformation.
      </p>
    </div>

    <div className="gf-intro-facts">
      <h3 className="gf-intro-facts-heading">Gym Facts That Might Surprise You</h3>
      <div className="gf-facts-grid">
        <div className="gf-fact-card">
          <h4>Did You Know?</h4>
          <p>Just 30 minutes of exercise a day can increase your lifespan by up to 5 years.</p>
        </div>
        <div className="gf-fact-card">
          <h4>Muscle Facts</h4>
          <p>Your body has over 600 muscles, making up about 40% of your total body weight.</p>
        </div>
        <div className="gf-fact-card">
          <h4>Mind-Muscle Connection</h4>
          <p>Focusing mentally on the muscle you're training can increase its activation by up to 20%.</p>
        </div>
      </div>
    </div>

  </div>
</section>

<section id="about" className="gf-about-section">
  <div className="gf-about-container">
    
    <div className="gf-about-header">
      <h2 className="gf-about-title">About Gym Freak</h2>
      <p className="gf-about-description">
        Your all-in-one fitness companion that helps you track progress,
        connect with professionals, and achieve your dream physique.
      </p>
    </div>

    <div className="gf-features-grid">
      {[
        { icon: "📊", title: "Workout Tracking", description: "Log daily workouts, exercises and sets to visualize your journey." },
        { icon: "👥", title: "Social Engagement", description: "Share posts with the fitness community for motivation." },
        { icon: "💬", title: "Trainer Chat", description: "Message certified gym trainers directly for personalized advice and guidance." },
        { icon: "🥗", title: "Diet Plans", description: "Access popular diet plans and customize meal plans to complement your workouts." }
      ].map((feature, index) => (
        <div key={index} className="gf-feature-card" data-aos="fade-up" data-aos-delay={index * 100}>
          <div className="gf-feature-icon">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
    
  </div>
</section>

     {/* CTA Section */}
<section id="cta" className="gf-cta-section">
  <div className="gf-cta-container">
    <div className="gf-cta-content">
      <h2>Ready to Transform Your Fitness Journey?</h2>
      <p>Join thousands of fitness enthusiasts who are already achieving their goals with GymFreak.</p>
      <div className="gf-cta-buttons">
        <button 
          onClick={handleAuthNavigation} 
          className="btn btn-secondary"
        >
          Login Now
        </button>
        <a href="#about" className="btn btn-secondary">Learn More</a>
      </div>
    </div>
  </div>
</section>

     {/* FAQ Section */}
<section id="faq" className="faq">
  <div className="container">

    <div className="section-header">
      <h2 className="section-title">Frequently Asked Questions</h2>
      <p className="section-description">
        Get answers to the most common questions about GymFreak.
      </p>
    </div>

    <div className="faq-container">
      <div className="faq-item">
        {/* <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`}> */}
        <div className="faq-question" onClick={() => handleFAQToggle(0)}>
          <h3>How do I get started with GymFreak?</h3>
          <span className="faq-toggle">+</span>
        </div>
        <div className="faq-answer">
          <p>Simply sign up for an account, complete your profile, and start exploring the features. You can log your first workout right away!</p>
        
        </div>
      </div>

      <div className="faq-item">
        {/* <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`}> */}
        <div className="faq-question" onClick={() => handleFAQToggle(1)}>
          <h3>Is GymFreak suitable for beginners?</h3>
          <span className="faq-toggle">+</span>
        </div>
        <div className="faq-answer">
          <p>Absolutely! GymFreak offers workout plans for all fitness levels, from complete beginners to advanced athletes.</p>
        </div>
      
      </div>

      <div className="faq-item">
        {/* <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`}> */}
        <div className="faq-question" onClick={() => handleFAQToggle(2)}>
          <h3>How do I connect with a trainer?</h3>
          <span className="faq-toggle">+</span>
        </div>
        <div className="faq-answer">
          <p>Browse through our certified trainer profiles, find someone whose expertise matches your goals, and send them a direct message through the app.</p>
        </div>
      
      </div>

      <div className="faq-item">
        {/* <div className={`faq-item ${activeIndex === 0 ? 'active' : ''}`}> */}
        <div className="faq-question" onClick={() => handleFAQToggle(3)}>
          <h3>Are the diet plans customizable?</h3>
          <span className="faq-toggle">+</span>
        </div>
        <div className="faq-answer">
          <p>Yes, all diet plans can be customized based on your preferences, allergies, and dietary restrictions while still aligning with your fitness goals.</p>
        </div>
      
      </div>
    </div>

  </div>
</section>

  </main>

{/* Footer Section */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <h2>GymFreak</h2>
                  <p>Transform Your Fitness Journey</p>
                </div>
                <div className="footer-links">
                  <div className="footer-column">
                    <h3>Company</h3>
                    <ul>
                      <li><a href="#">About Us</a></li>
                      <li><a href="#">Careers</a></li>
                      <li><a href="#">Contact</a></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>Resources</h3>
                    <ul>
                      <li><a href="#">Blog</a></li>
                      <li><a href="#">Guides</a></li>
                      <li><a href="#">Support</a></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>Legal</h3>
                    <ul>
                      <li><a href="#">Privacy Policy</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="footer-bottom" >
                <p style={{color : "white"}}>&copy; 2023 GymFreak. All rights reserved.</p>
              </div>
          </footer>
        </div>
      );
    };

export default HomePage;
