import React,{Component} from "react";
import UserDash from "./UserDash";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material /TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FromControl from "@mui/material/FormControl";
import {Link} from "react-router-dom";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";  


export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
         <div>
           <Grid container spacing={1}>
           <Grid item xs={12} align="center">
            <Typography component="h4" variant="h4">
                Welcome to Gym Freak
            </Typography>
           </Grid>
           </Grid>
         </div>
        );
    }
}

const appDiv = document.getElementById("app");
const root = createRoot(appDiv);
root.render(<App />);


// const appDiv = document.getElementById("app");
// const root = createRoot(appDiv);
// root.render(<App />);


// DOM Elements
const header = document.querySelector('.header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const faqItems = document.querySelectorAll('.faq-item');
const counters = document.querySelectorAll('.counter');
const navLinksItems = document.querySelectorAll('.nav-link');
const featureCards = document.querySelectorAll('.feature-card');

// Header scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  // Activate feature cards when they come into view
  featureCards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (cardTop < windowHeight - 100) {
      card.classList.add('in-view');
    }
  });
  
  // Start counters when stats section is in view
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsSectionTop = statsSection.getBoundingClientRect().top;
    if (statsSectionTop < window.innerHeight - 200) {
      startCounters();
    }
  }
});

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
  
  // Transform hamburger into X
  const spans = hamburger.querySelectorAll('span');
  if (hamburger.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') && 
      !navLinks.contains(e.target) && 
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Smooth Scrolling for Navigation Links
navLinksItems.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Close mobile menu if open
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
    
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Dark Mode Toggle 
themeToggle.addEventListener('click', () => {
  // Toggle dark mode class on body
  document.body.classList.toggle('dark-mode');
  
  // Get sun and moon icons
  const sunIcon = themeToggle.querySelector('.sun');
  const moonIcon = themeToggle.querySelector('.moon');
  
  // Set theme preference in localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    // Show moon icon, hide sun icon
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  } else {
    localStorage.setItem('theme', 'light');
    // Show sun icon, hide moon icon
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  }
});

// Apply saved theme preference when page loads
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    
    // Update toggle appearance for dark mode
    const sunIcon = themeToggle.querySelector('.sun');
    const moonIcon = themeToggle.querySelector('.moon');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }
});

// FAQ Accordion
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    // Close all other items
    faqItems.forEach(otherItem => {
      if (otherItem !== item && otherItem.classList.contains('active')) {
        otherItem.classList.remove('active');
      }
    });
    
    // Toggle current item
    item.classList.toggle('active');
  });
});

// Animated Counter
function startCounters() {
  counters.forEach(counter => {
    if (counter.classList.contains('counting')) return;
    
    counter.classList.add('counting');
    const target = +counter.getAttribute('data-target');
    const duration = 2000; // ms
    const increment = target / (duration / 16); // 60fps
    
    let currentCount = 0;
    
    const updateCounter = () => {
      currentCount += increment;
      
      // Round to handle decimal increments
      const displayValue = Math.min(Math.round(currentCount), target);
      counter.textContent = displayValue;
      
      if (displayValue < target) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target; // Ensure we end at exactly the target
      }
    };
    
    updateCounter();
  });
}

// Form Submission (for demo purposes)
const signupForm = document.querySelector('.signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    
    // Simple validation
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    // Show success message (in a real app, you'd send this to a server)
    alert(`Thank you, ${name}! Your account has been created. Check your email at ${email} for confirmation.`);
    signupForm.reset();
  });
};

// Add Animation on Scroll for Feature Cards
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state for feature cards
  featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });
  
  // Check if elements are in viewport on page load
  checkElementsInViewport();
});


function checkElementsInViewport() {
  featureCards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (cardTop < windowHeight - 100) {
      card.classList.add('in-view');
    }
  });
}

// Add custom animation for buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = 'var(--shadow-lg)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'var(--shadow)';
  });
  
  button.addEventListener('mousedown', function() {
    this.style.transform = 'translateY(-2px)';
  });
  
  button.addEventListener('mouseup', function() {
    this.style.transform = 'translateY(-5px)';
  });
});

