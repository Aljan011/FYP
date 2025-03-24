import React, { useState, useEffect } from "react";

const WorkoutPost = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [currentWorkout, setCurrentWorkout] = useState({
        exercises: [],
        title: "Today's Workout",
        description: "Workout on " + new Date().toLocaleDateString(),
    });
    const [sessionSeconds, setSessionSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const searchExercises = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`/api/exercises/?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchExercises(query);
    };

    const handleExerciseSelect = (exercise) => {
        setSelectedExercise(exercise);
    };

    const addToWorkout = () => {
        if (selectedExercise && !currentWorkout.exercises.some((ex) => ex.id === selectedExercise.id)) {
            setCurrentWorkout((prev) => ({
                ...prev,
                exercises: [...prev.exercises, selectedExercise],
            }));
        }
        setSelectedExercise(null);
    };

    const removeExercise = (index) => {
        setCurrentWorkout((prev) => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="workout-container">
            <h1>{currentWorkout.title}</h1>
            <p>{currentWorkout.description}</p>

            {/* Header Section */}
            <header className="header">
                <nav className="navbar">
                    <div className="logo">
                        <h1>GymFreak</h1>
                    </div>
                    <div className="nav-links" id="navLinks">
                        <ul>
                            <li><a href="#home" className="nav-link">Home</a></li>
                            <li><a href="#about" className="nav-link">Track</a></li>
                            <li><a href="#features" className="nav-link">Diets</a></li>
                            <li><a href="#faq" className="nav-link">Chat</a></li>
                        </ul>
                    </div>
                    <div className="nav-buttons">
                        <button className="theme-toggle" id="themeToggle">
                            <span className="sun">☀️</span>
                            <span className="moon">🌙</span>
                        </button>
                    </div>
                    <div className="hamburger" id="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </nav>
            </header>

            {/* Search Section */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search for an exercise..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <button onClick={() => setSearchQuery("")}>Clear</button>
            </div>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((exercise) => (
                        <div key={exercise.id} className="search-result-item">
                            <h3>{exercise.name}</h3>
                            <p>{exercise.target}</p>
                            <button onClick={() => handleExerciseSelect(exercise)}>View Details</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Exercise Details */}
            {selectedExercise && (
                <div className="exercise-details">
                    <img src={selectedExercise.image_url} alt={selectedExercise.name} />
                    <h3>{selectedExercise.name}</h3>
                    <p>Target Muscle: {selectedExercise.target}</p>
                    <p>Difficulty: {selectedExercise.difficulty || "Medium"}</p>
                    <p>Equipment: {selectedExercise.equipment}</p>
                    <p>Description: {selectedExercise.description}</p>
                    <button onClick={addToWorkout}>Add to Workout</button>
                </div>
            )}

            {/* Current Workout Section */}
            <section className="current-workout-section">
                <div className="section-header">
                    <h3>Current Workout</h3>
                    <div id="progressContainer" className="progress-container">
                        <div className="progress-bar-container">
                            <div id="progressBar" className="progress-bar" style={{ width: `${(sessionSeconds / 60) * 100}%` }}></div>
                        </div>
                        <button id="finishWorkout" className="finish-workout-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Finish Workout
                        </button>
                    </div>
                </div>

                {/* Workout Exercises */}
                <div id="workoutExercises" className="workout-exercises">
                    {currentWorkout.exercises.length > 0 ? (
                        <ul>
                            {currentWorkout.exercises.map((exercise, index) => (
                                <li key={exercise.id}>
                                    {exercise.name}{" "}
                                    <button onClick={() => removeExercise(index)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Your workout is empty. Search for exercises to add them to your session.</p>
                    )}
                </div>
            </section>

            {/* Workout Timer */}
            <h3>Workout Duration: {Math.floor(sessionSeconds / 60)} min {sessionSeconds % 60} sec</h3>
        </div>
    );
};

export default WorkoutPost;
