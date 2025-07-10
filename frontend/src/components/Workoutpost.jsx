import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/workout_track.css";

const Workoutpost = () => {

    //API base URL
    const API_BASE = "http://localhost:8000/api";
    //token call
    const token = localStorage.getItem('authToken');

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    // Search and exercise states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [badgePopup, setBadgePopup] = useState(false);
    const [userWorkouts, setUserWorkouts] = useState([]);
    const [lastSavedWorkout, setLastSavedWorkout] = useState(null);


    // Workout tracking states
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [currentWorkout, setCurrentWorkout] = useState({
                      exercises: [],
        title: "Today's Workout",
        description: "Workout on " + new Date().toLocaleDateString(),
    });
    const [userNotes, setUserNotes] = useState("");
    const [workoutStartTime] = useState(new Date()); // Capture start time when component loads
    
    // New states for adding exercise sets
    const [sessionId, setSessionId] = useState(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [restTime, setRestTime] = useState('');

    // Timer state
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [sessionTime, setSessionTime] = useState("00:00:00");

    // Apply dark mode theme
    useEffect(() => {
        document.documentElement.classList.toggle("dark-mode", isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);
    
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // Session timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionSeconds(prev => {
                const newTime = prev + 1;
                const hours = Math.floor(newTime / 3600).toString().padStart(2, '0');
                const minutes = Math.floor((newTime % 3600) / 60).toString().padStart(2, '0');
                const seconds = (newTime % 60).toString().padStart(2, '0');
                setSessionTime(`${hours}:${minutes}:${seconds}`);
                return newTime;
            });
        }, 1000);
    
        return () => clearInterval(timer);
    }, []);

    // Search exercises from API
    const searchExercises = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8000/api/exercises/?q=${encodeURIComponent(query)}`, {
                headers: {
                    "Accept": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Fetched Exercises:", data);
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };

    // Search input handler
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchExercises(query);
    };

    // Clear search input
    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
    };

    // View exercise details
    const viewExerciseDetails = (exercise) => {
        setSelectedExercise(exercise);
        setSelectedExerciseId(exercise.id); // Set the selected exercise ID for the form
        setShowDetails(true);
    };

    // Add exercise to workout
    const addToWorkout = () => {
        if (selectedExercise) {
            // Create exercise with sets data structure
            const exerciseWithSets = {
                ...selectedExercise,
                sets: [{ setNumber: 1, weight: "", reps: "" }]
            };
            
            // Add to workout exercises
            setWorkoutExercises(prev => [...prev, exerciseWithSets]);
            
            // Reset selection and close details
            setSelectedExercise(null);
            setShowDetails(false);
        }
    };

    // Add set to exercise
    const addSet = (exerciseIndex) => {
        const updatedExercises = [...workoutExercises];
        const currentSets = updatedExercises[exerciseIndex].sets;
        const newSetNumber = currentSets.length + 1;
        
        updatedExercises[exerciseIndex].sets.push({
            setNumber: newSetNumber,
            weight: "",
            reps: ""
        });
        
        setWorkoutExercises(updatedExercises);
    };

    // Update set values
    const updateSetValue = (exerciseIndex, setIndex, field, value) => {
        const updatedExercises = [...workoutExercises];
        updatedExercises[exerciseIndex].sets[setIndex][field] = value;
        setWorkoutExercises(updatedExercises);
    };

    // Remove set
    const removeSet = (exerciseIndex, setIndex) => {
        const updatedExercises = [...workoutExercises];
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
        
        // Renumber remaining sets
        updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.map((set, idx) => ({
            ...set,
            setNumber: idx + 1
        }));
        
        setWorkoutExercises(updatedExercises);
    };

    // Remove exercise from workout
    const removeExercise = (index) => {
        setWorkoutExercises(prev => prev.filter((_, i) => i !== index));
    };

    // Function to handle the form submission for adding exercise set
    const handleSubmitExerciseSet = async (e) => {
        e.preventDefault();
        if (!sessionId || !selectedExerciseId) {
            alert("Session ID and Exercise ID are required.");
            return;
        }
        
        // Construct the payload for adding an exercise set
        const payload = {
            exercise_id: selectedExerciseId,
            reps: reps,
            weight: weight,
            rest_time: restTime,
            set_number: 1, // Adjust as necessary, dynamically if needed
        };
        
        try {
            // Send the POST request to the backend
            const response = await axios.post(
                `/api/workout_sessions/${sessionId}/add_exercise_set/`,
                payload
            );
            console.log('Exercise set added:', response.data);
            // Reset form fields
            setReps('');
            setWeight('');
            setRestTime('');
            alert("Exercise set added successfully!");
        } catch (error) {
            console.error('Error adding exercise set:', error.response?.data || error.message);
            alert(`Failed to add exercise set: ${error.response?.data?.message || error.message}`);
        }
    };

    const fetchUserWorkouts = async () => {
  try {
    const res = await axios.get(`${API_BASE}/workouts/user_workouts/`, {
      headers: {
        Authorization: `Token ${token}`,
      }
    });
    setUserWorkouts(res.data);
  } catch (err) {
    console.error("Error fetching user workouts:", err);
  }
};

useEffect(() => {
  if (token) fetchUserWorkouts();
}, []);

    const finishWorkout = async () => {
        try {
            if (!token) {
                alert("Please log in first.");
                return;
            }
        
            const now = new Date();
            const duration = Math.floor((now - workoutStartTime) / 1000); // in seconds
        
            // Calculate total sets
            const totalSets = workoutExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    
            const hasValidSets = workoutExercises.some(ex =>
                ex.sets.some(set => set.reps || set.weight)
            );
            
            if (!hasValidSets) {
                alert("Please enter at least one set with reps or weight.");
                return;
            }
            
            // 1. Create Workout Session
            const sessionRes = await axios.post(
                `${API_BASE}/workout_sessions/`,
                {
                    ended_at: now.toISOString(),
                    total_duration: duration,
                    total_exercises: workoutExercises.length,
                    total_sets: totalSets,
                    notes: userNotes,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
        
            const sessionId = sessionRes.data.id;
            setSessionId(sessionId); // Store the session ID for adding exercise sets
            console.log("Session ID:", sessionId); // Check the session ID
        
            // 2. Add each Exercise Set
            for (const exercise of workoutExercises) {
                for (let i = 0; i < exercise.sets.length; i++) {
                    const set = exercise.sets[i];
                    
                    // Skip empty sets
                    if (!set.weight && !set.reps) continue;
        
                    console.log("Sending set data:", {
                        workout_session: sessionId,
                        exercise_id: exercise.id,
                        set_number: i + 1,
                        weight: set.weight || 0,
                        reps: set.reps || 0,
                        rest_time: 0,
                    });
                    
                    await axios.post(
                        `${API_BASE}/workout_exercise_sets/`,
                        {
                            workout_session: sessionId,
                            exercise_id: exercise.id,
                            set_number: i + 1,
                            weight: parseFloat(set.weight || 0),
reps: parseInt(set.reps || 0),
                            rest_time: 0, // Default rest time
                        },
                        {
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        }
                    );
                }
            }
        
            // 3. Finish Workout
             const finishRes = await axios.post(
      `${API_BASE}/workout_sessions/${sessionId}/finish_workout/`,
      { notes: userNotes },
      { headers: { Authorization: `Token ${token}` } }
    );

    console.log("Workout finished:", finishRes.data);

    setLastSavedWorkout(finishRes.data);

    // Show new achievements
    const newAchievements = finishRes.data.new_achievements;

if (newAchievements && newAchievements.length > 0) {
  console.log("🎯 Showing badge popup:", newAchievements[0]);  // ✅ Add this here
  setBadgePopup(newAchievements[0]);
  setTimeout(() => setBadgePopup(null), 4000);
}

// Show Personal Best popup even if no new badge was awarded
const personalBests = finishRes.data.personal_bests;
if (personalBests && Object.keys(personalBests).length > 0) {
  const exerciseNames = Object.keys(personalBests);
  const firstPB = exerciseNames[0];
  const pbData = personalBests[firstPB];
  const pbText = `🏋️ Personal Best in ${firstPB}: ${
    pbData.weight ? `Weight - ${pbData.weight}kg ` : ""
  }${pbData.reps ? `Reps - ${pbData.reps}` : ""}`;

  console.log("🔥 Showing personal best popup:", pbText);
  setBadgePopup({
    achievement: {
      name: "Personal Best Achieved",
      description: pbText,
    },
  });

  setTimeout(() => setBadgePopup(null), 4000);
}


    alert("Workout saved successfully!");

    // Reset workout state
    setWorkoutExercises([]);
    setSessionSeconds(0);
    setUserNotes("");

  } catch (error) {
    console.error("Error saving workout:", error);
    alert(`Failed to save workout: ${error.response?.data?.message || error.message}`);
  }
   await fetchUserWorkouts(); // 👈 Add this after success
};
          


const calculateWorkoutVolume = (sets) => {
  if (!Array.isArray(sets)) return 0; 
  return sets.reduce((total, set) => {
    const weight = parseFloat(set.weight || 0);
    const reps = parseFloat(set.reps || 0);
    return total + (weight * reps);
  }, 0);
};

const getTargetedMuscles = (exercises) => {
  if (!Array.isArray(exercises)) return "Unknown";
  const targets = new Set(exercises.map(ex => ex.target));
  return Array.from(targets).join(', ');
};

const getPersonalBestAchievements = (achievements) => {
  if (!Array.isArray(achievements)) return [];

  return achievements.filter(a =>
    a.achievement.code === "PB_WEIGHT" || a.achievement.code === "PB_REPS"
  );
};


    // Handle notes change
    const handleNotesChange = (e) => {
        setUserNotes(e.target.value);
    };

    return (
        <div className="workout-container">
            {/* Header Section */}
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
                            {isDarkMode ? (
                                <span className="sun">☀️</span>
                            ) : (
                                <span className="moon">🌙</span>
                            )}
                        </button>
                    </div>
                </nav>
            </header>
    
            {/* Workout Session Section */}
            <div className="workout-session-container">
                <div className="session-header">
                    <span className="small-chip">CURRENT SESSION</span>
                    <h2>Today's Workout</h2>
                    {/* <div className="session-timer">
                        <span className="timer-label">Session Time:</span>
                        <span id="sessionTime">{sessionTime}</span>
                    </div> */}
                </div>
            </div>
    
            {/* Exercise Search Section */}
            <section className="search-section">
                <div className="search-input-wrapper">
                    {/* <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg> */}
                    <input 
                        type="text"
                        id="exerciseSearch"
                        className="search-input"
                        placeholder="Search for an exercise..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <button id="clearSearch" className="clear-search-btn" onClick={clearSearch} aria-label="Clear search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div id="searchResults" className="search-results">
                        {searchResults.map((exercise) => (
                            <div key={exercise.id} className="search-result-item" onClick={() => viewExerciseDetails(exercise)}>
                                <h3>{exercise.name}</h3>
                                <div className="exercise-tags">
                                    <span className="exercise-tag">{exercise.target}</span>
                                    {exercise.difficulty && (
                                        <span className="exercise-tag difficulty">{exercise.difficulty}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
    
            {/* Selected Exercise Details Section */}
            {showDetails && selectedExercise && (
                <section className="exercise-details-section">
                    <div className="exercise-details-container">
                        <div className="exercise-image-container">
                            <div className="exercise-image-wrapper">
                                {selectedExercise.image_url ? (
                                    <img src={selectedExercise.image_url} alt={`${selectedExercise.name} demonstration`} className="exercise-image" />
                                ) : (
                                    <div className="placeholder-image">No image available</div>
                                )}
                            </div>
                        </div>
                        <div className="exercise-info">
                            <h3 className="exercise-name">{selectedExercise.name}</h3>
                            <div className="exercise-specs">
                                <div className="spec-item">
                                    <span className="spec-label">Target</span>
                                    <span className="spec-value">{selectedExercise.target}</span>
                                </div>
                                {selectedExercise.difficulty && (
                                    <div className="spec-item">
                                        <span className="spec-label">Difficulty</span>
                                        <span className="spec-value">{selectedExercise.difficulty}</span>
                                    </div>
                                )}
                                {selectedExercise.equipment && (
                                    <div className="spec-item">
                                        <span className="spec-label">Equipment</span>
                                        <span className="spec-value">{selectedExercise.equipment}</span>
                                    </div>
                                )}
                            </div>
                            <p className="exercise-description">{selectedExercise.description || "No description available."}</p>
                            <button className="primary-button" onClick={addToWorkout}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add to Workout
                            </button>

                            {/* New Exercise Set Form */}
                            {sessionId && (
                                <div className="add-exercise-set-form">
                                    <h4>Add Exercise Set</h4>
                                    <form onSubmit={handleSubmitExerciseSet}>
                                        <div className="form-row">
                                            <label>
                                                Reps:
                                                <input
                                                    type="number"
                                                    value={reps}
                                                    onChange={(e) => setReps(e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="form-row">
                                            <label>
                                                Weight:
                                                <input
                                                    type="number"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="form-row">
                                            <label>
                                                Rest Time (seconds):
                                                <input
                                                    type="number"
                                                    value={restTime}
                                                    onChange={(e) => setRestTime(e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <button type="submit" className="primary-button">Add Exercise Set</button>
                                    </form>
                                </div>
                            )}
                        </div>
                        <button className="close-details" onClick={() => setShowDetails(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </section>
            )}
    
            {/* Current Workout Section */}
            <section className="current-workout-section">
                <div className="workout-header">
                    <h3>Current Workout</h3>
                    {workoutExercises.length > 0 && (
                        <button className="finish-workout-button" onClick={finishWorkout}>
                            Finish Workout
                        </button>
                    )}
                </div>
    
                <div className="workout-exercises">
                    {workoutExercises.length > 0 ? (
                        workoutExercises.map((exercise, exerciseIndex) => (
                            <div key={`${exercise.id}-${exerciseIndex}`} className="workout-exercise-item">
                                <div className="exercise-header">
                                    <h4>{exercise.name}</h4>
                                    <button 
                                        className="remove-exercise" 
                                        onClick={() => removeExercise(exerciseIndex)}
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                {/* Exercise Sets */}
                                {exercise.sets.map((set, setIndex) => (
                                    <div key={`set-${setIndex}`} className="exercise-set">
                                        <div className="set-label">Set {set.setNumber}</div>
                                        <input
                                            type="number"
                                            className="set-input weight"
                                            placeholder="Weight"
                                            value={set.weight}
                                            onChange={(e) => updateSetValue(exerciseIndex, setIndex, 'weight', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className="set-input reps"
                                            placeholder="Reps"
                                            value={set.reps}
                                            onChange={(e) => updateSetValue(exerciseIndex, setIndex, 'reps', e.target.value)}
                                        />
                                        {exercise.sets.length > 1 && (
                                            <button 
                                                className="remove-set"
                                                onClick={() => removeSet(exerciseIndex, setIndex)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Add Set Button */}
                                <button 
                                    className="add-set-button"
                                    onClick={() => addSet(exerciseIndex)}
                                >
                                    + Add Set
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-workout-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <p>Your workout is empty. Search for exercises to add them to your session.</p>
                        </div>
                    )}
                </div>
                
                {/* Workout Notes */}
                {workoutExercises.length > 0 && (
                    <div className="workout-notes">
                        <h4>Workout Notes</h4>
                        <textarea
                            className="notes-input"
                            placeholder="Add notes about your workout session..."
                            value={userNotes}
                            onChange={handleNotesChange}
                        />
                    </div>
                )}
            </section>
            {badgePopup && (
  <div className="badge-popup">
    <div className="badge-content">
      <h4>🏆 New Achievement Unlocked!</h4>
      <p>{badgePopup.achievement.name}</p>
      <small>{badgePopup.achievement.description}</small>
    </div>
  </div>
)}
{lastSavedWorkout && (
  <div className="workout-summary-card">
    <h3>Workout Summary</h3>
    <p><strong>Title:</strong> {lastSavedWorkout.message || "Your recent workout"}</p>
    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
    <p><strong>Total Volume:</strong> {calculateWorkoutVolume(lastSavedWorkout.sets || [])} kg</p>
    <p><strong>Targeted Muscles:</strong> {getTargetedMuscles(lastSavedWorkout.exercises || [])}</p>

    {/* New Achievements */}
    {lastSavedWorkout.new_achievements && lastSavedWorkout.new_achievements.length > 0 && (
      <div>
        <h4>🏅 New Achievements</h4>
        <ul>
          {lastSavedWorkout.new_achievements.map((achv) => (
            <li key={achv.id}>
              {achv.achievement.name}
              {["PB_WEIGHT", "PB_REPS"].includes(achv.achievement.code) && (
                <span className="pb-badge" title={achv.achievement.description}>🏆 PB</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* ➕ Add Personal Bests */}
    {lastSavedWorkout.personal_bests && Object.keys(lastSavedWorkout.personal_bests).length > 0 && (
      <div className="personal-best-summary">
        <h4>🔥 Personal Bests This Session</h4>
        <ul>
          {Object.entries(lastSavedWorkout.personal_bests).map(([exerciseName, pb]) => (
            <li key={exerciseName}>
              <strong>{exerciseName}:</strong>{" "}
              {pb.weight && <span>🏋️‍♂️ Weight: {pb.weight} kg </span>}
              {pb.reps && <span>💪 Reps: {pb.reps}</span>}
            </li>
          ))}
        </ul>
      </div>
    )}

    <button className="summary-close-button" onClick={() => setLastSavedWorkout(null)}>Close</button>
  </div>
)}


        </div>
    );
}

export default Workoutpost;