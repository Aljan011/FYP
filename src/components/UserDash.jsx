import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../css/UserDash.css";

const UserDash = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [userData, setUserData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    profile: {
      profile_picture: null
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get('/api/profile/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        
        setUserData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prevState => !prevState);
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || userData.username.charAt(0).toUpperCase();
  };

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

  const highlightNavLink = () => {
    const scrollPosition = window.scrollY;
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLink?.classList.add('active');
      } else {
        navLink?.classList.remove('active');
      }
    });
  };

  useEffect(() => {
    // Attach event listeners
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('scroll', highlightNavLink);

    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    const handleAnchorClick = function (e) {
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
    };

    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('scroll', highlightNavLink);
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []); // Empty dependency array to attach these listeners once

  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          <h1>GymFreak</h1>
        </div>
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/UserDash" className="nav-link">Home</Link></li>
            <li><Link to="/workouts" className="nav-link">Track</Link></li>
            <li><Link to="/diet-plan" className="nav-link">Diets</Link></li>
            <li><Link to="/signup" className="nav-link">Chat</Link></li>
          </ul>
        </div>
        <div className="nav-buttons">
          <Link to="/profile" className="user-avatar">
            {isLoading ? (
              <div className="avatar-loading"></div>
            ) : userData.profile?.profile_picture ? (
              <img src={userData.profile.profile_picture} alt={`${userData.first_name} ${userData.last_name}`} />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(userData.first_name, userData.last_name)}
              </div>
            )}
          </Link>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <span className="sun">☀️</span>
            ) : (
              <span className="moon">🌙</span>
            )}
          </button>
        </div>
        <div 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
      {/* Rest of your page content can go here */}
    </header>
  );
};

export default UserDash;