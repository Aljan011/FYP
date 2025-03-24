import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";

const HomePage = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        // Dark mode toggle based on localStorage
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        // Cleanup: Reset dark mode class if component unmounts
        return () => {
            document.body.classList.remove("dark-mode");
        };
    }, [isDarkMode]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleDarkModeToggle = () => {
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    };

    const handleFAQToggle = (index) => {
        const faqElement = document.querySelectorAll('.faq-item')[index];
        faqElement.classList.toggle('active');
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
        <div>
            <Grid container spacing={1} className={isMobileMenuOpen ? 'mobile-menu-open' : ''}>

                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Welcome to Gym Freak
                    </Typography>
                </Grid>

                {/* Example of Dark Mode toggle */}
                <Grid item xs={12} align="center">
                    <button
                        id="themeToggle"
                        className="btn"
                        onClick={handleDarkModeToggle}
                    >
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                </Grid>

                {/* Example FAQ Section */}
                <Grid item xs={12}>
                    <div className="faq-item">
                        <div
                            className="faq-question"
                            onClick={() => handleFAQToggle(0)}
                        >
                            What is Gym Freak?
                        </div>
                        <div className="faq-answer">
                            <p>Gym Freak is a platform to track your workouts and progress!</p>
                        </div>
                    </div>
                </Grid>

            </Grid>
        </div>
    );
};

export default HomePage;
