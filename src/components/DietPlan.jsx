import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/DietPlan.css'; 
import './DietDetail.jsx';

const DietPlan = () => {
  const [dietPlan, setDietPlan] = useState([]);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [diet, setDiet] = useState([]);


  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

  //  Move these functions outside of useEffect
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

   useEffect(() => {
  if (diet) {
    console.log("Diet image path:", diet.image);
  }
}, [diet]);

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

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found!");
      return;
    }

    console.log("Token being used:", token);

    axios.get("http://localhost:8000/api/diets/", {
      headers: {
        Authorization: `Token ${token}`,
      }
    })
    .then((response) => {
      setDietPlan(response.data);
    })
    .catch((error) => {
      console.error("Failed to fetch diets:", error);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('scroll', highlightNavLink);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
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

    

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('scroll', highlightNavLink);
    };
  }, []);
    // Cleanup event listeners on unmount
    return (
      <>
        <header className="header">
          <nav className="navbar">
            <div className="logo">
              <h1>GymFreak</h1>
            </div>
            <div className="nav-links" id="navLinks">
              <ul>
                                          <li><Link to="/UserDash" className="nav-link">Home</Link></li>
                                          <li><Link to="/workouts" className="nav-link">Track</Link></li>
                                          <li><Link to="/diet-plan" className="nav-link">Diets</Link></li>
                                          <li><Link to="/chat" className="nav-link">Chat</Link></li>
                                      </ul>
            </div>
            <div className="nav-buttons">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? '🌙' : '☀️'}
            </button>
              {/* <a href="#signup" className="btn btn-primary">Login</a> */}
            </div>
            <div className="hamburger" id="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </nav>
        </header>
    
        <main>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container">
              <div className="hero-content">
                <span className="badge">Personalized Diet Plans</span>
                <h1>Transform Your Health With Expert Nutrition</h1>
                <p>Our scientifically-backed diet plans are designed by expert nutritionists to help you reach your health goals with delicious, satisfying meals.</p>
                <div className="hero-buttons">
                  <a href="#plans" className="button primary">Browse Plans</a>
                  <a href="#" className="button secondary">Free Consultation</a>
                </div>
                <div className="hero-stats">
                  <div className="stat">
                    <h3>15k+</h3>
                    <p>Happy Clients</p>
                  </div>
                  <div className="stat">
                    <h3>92%</h3>
                    <p>Success Rate</p>
                  </div>
                  <div className="stat">
                    <h3>30+</h3>
                    <p>Expert Nutritionists</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
      {/* Diet Plans Section */}
      <section id="plans" className="plans">
      <div className="container">
        <div className="section-header">
          <span className="badge">Featured Plans</span>
          <h2>Discover Our Personalized Diet Plans</h2>
          <p>Each plan is crafted by expert nutritionists to meet specific health goals while ensuring delicious, satisfying meals.</p>
          <div className="scroll-indicator">
            <span>Scroll to explore</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <div className="plans-grid">
          {dietPlan.map((diet) => (
            <div className="plan-card" key={diet.slug}>
              <div className="plan-image">
                <img
  src={diet.image ? diet.image : "/fallback.jpg"}
  alt={diet.name}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/fallback.jpg";
  }}
/>

              </div>
              <div className="plan-content">
                <h3>{diet.name}</h3>
                <p>{diet.description}</p>
                {diet.benefits && (
                  <ul className="benefits-list">
                    {diet.benefits.split('\n').map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                )}
                <div className="plan-footer">
                  <Link to={`/diet-plans/${diet.slug}`} className="arrow-button primary">View Plan</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
          
          {/* Benefits Section */}
          <section id="benefits" className="benefits">
            <div className="container">
              <div className="section-header">
                <span className="badge">Why Choose Us</span>
                <h2>The Benefits of Our Diet Plans</h2>
                <p>Our approach to nutrition is backed by science and focused on sustainability, ensuring you achieve long-term results.</p>
              </div>
              
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                      <line x1="16" y1="8" x2="2" y2="22"></line>
                      <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <h3>Personalized Approach</h3>
                  <p>Every plan is customized to your body type, metabolic rate, and personal health goals.</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                  </div>
                  <h3>Science-Backed Nutrition</h3>
                  <p>Our meal plans are created by registered dietitians based on the latest nutritional research.</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                  </div>
                  <h3>Expert Guidance</h3>
                  <p>Get ongoing support from professional nutritionists who monitor your progress.</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <h3>Flexible Scheduling</h3>
                  <p>Our meal plans adapt to your lifestyle, not the other way around.</p>
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
            <div className="footer-bottom">
                <p>&copy; 2023 GymFreak. All rights reserved.</p>
              </div>
          </footer>
      </>
    );
};

export default DietPlan;
