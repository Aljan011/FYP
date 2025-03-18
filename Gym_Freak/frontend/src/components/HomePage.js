import React, { useEffect, useState } from "react";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import UserDash from "./UserDash";

const HomePage = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Header scroll effect
        const handleScroll = () => {
            const header = document.querySelector('.header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
        };

        const toggleMobileMenu = () => {
            setMobileMenuOpen(!isMobileMenuOpen);
        };


        // Dark mode toggle
        const handleDarkModeToggle = () => {
            const themeToggle = document.getElementById("themeToggle");
            if (themeToggle) {
                themeToggle.addEventListener("click", () => {
                    document.body.classList.toggle("dark-mode");
                    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
                });
            }
        };

        // FAQ Accordion
        const handleFAQ = () => {
            document.querySelectorAll('.faq-question').forEach(question => {
                question.addEventListener("click", () => {
                    question.parentElement.classList.toggle("active");
                });
            });
        };

        // Animated Counters
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

        // Button Animations
        document.querySelectorAll(".btn").forEach(button => {
            button.addEventListener("mouseenter", () => {
                button.style.transform = "translateY(-5px)";
                button.style.boxShadow = "var(--shadow-lg)";
            });
            button.addEventListener("mouseleave", () => {
                button.style.transform = "translateY(0)";
                button.style.boxShadow = "var(--shadow)";
            });
        });

        // Apply all handlers
        window.addEventListener("scroll", handleScroll);
        // handleMobileMenu();
        handleDarkModeToggle();
        handleFAQ();
        startCounters();

        // Cleanup event listeners on unmount
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div>
            <Grid container spacing={1} className={isMobileMenuOpen ? 'mobile-menu-open' : ''}>

                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Welcome to Gym Freak
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
};

export default HomePage;
