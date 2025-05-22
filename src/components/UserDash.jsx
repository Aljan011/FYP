import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../css/UserDash.css";

const UserDash = () => {
  const [workoutPosts, setWorkoutPosts] = useState([]);
  const [userData, setUserData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    profile: {
      profile_picture: null
    }
  });
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    avgDuration: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isLoading, setIsLoading] = useState(true);
  const [currentExerciseIndices, setCurrentExerciseIndices] = useState({});

  useEffect(() => {
    const fetchWorkoutPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/workout-posts/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        
        // Initialize current exercise indices for each post
        const indices = {};
        response.data.forEach(post => {
          indices[post.id] = 0;
        });
        setCurrentExerciseIndices(indices);
        
        setWorkoutPosts(response.data);
      } catch (error) {
        console.error('Error fetching workout posts:', error);
      }
    };
  
    fetchWorkoutPosts();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const userResponse = await axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Token ${token}` }
        });

        setUserData(userResponse.data);

        const workoutsResponse = await axios.get(`http://localhost:8000/api/users/${userResponse.data.username}/workouts/`, {
          headers: { Authorization: `Token ${token}` }
        });

        const workouts = workoutsResponse.data;
        setRecentWorkouts(workouts.slice(0, 5));

        const stats = {
          totalWorkouts: workouts.length,
          totalExercises: workouts.reduce((acc, w) => acc + (w.exercises?.length || 0), 0),
          avgDuration: calculateAverageDuration(workouts)
        };
        setWorkoutStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isDarkMode]);

  const calculateAverageDuration = (workouts) => {
    if (!workouts.length) return 0;
    const totalMinutes = workouts.reduce((acc, workout) => {
      if (!workout.duration) return acc;
      const [hours, minutes] = workout.duration.split(':');
      return acc + (parseInt(hours) * 60 + parseInt(minutes));
    }, 0);
    return Math.round(totalMinutes / workouts.length);
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem('theme', newDarkModeState ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-mode');
  };

  const getIntensityClass = (intensity) => {
    if (!intensity) return 'medium';
    return intensity.toLowerCase();
  };

  // Add the missing slide handlers
  const handleSlideLeft = (postId) => {
    setCurrentExerciseIndices(prevIndices => {
      const post = workoutPosts.find(p => p.id === postId);
      const exercisesLength = post?.workout_details?.exercises?.length || 0;
      const currentIndex = prevIndices[postId] || 0;
      const newIndex = currentIndex === 0 ? exercisesLength - 1 : currentIndex - 1;
      
      return {
        ...prevIndices,
        [postId]: newIndex
      };
    });
  };

  const handleSlideRight = (postId) => {
    setCurrentExerciseIndices(prevIndices => {
      const post = workoutPosts.find(p => p.id === postId);
      const exercisesLength = post?.workout_details?.exercises?.length || 0;
      const currentIndex = prevIndices[postId] || 0;
      const newIndex = (currentIndex + 1) % exercisesLength;
      
      return {
        ...prevIndices,
        [postId]: newIndex
      };
    });
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome, {userData.first_name || userData.username}!</h1>
          <p>Track your fitness journey and stay motivated</p>
        </div>
        <div className="header-actions">
          <button onClick={toggleDarkMode} className="theme-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/profile" className="profile-link">
            {userData.profile?.profile_picture ? (
              <img src={userData.profile.profile_picture} alt="Profile" />
            ) : (
              <div className="profile-placeholder">
                {(userData.first_name?.[0] || '') + (userData.last_name?.[0] || '')}
              </div>
            )}
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section stats-section">
          <h2>Your Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{workoutStats.totalWorkouts}</h3>
              <p>Total Workouts</p>
            </div>
            <div className="stat-card">
              <h3>{workoutStats.totalExercises}</h3>
              <p>Exercises Done</p>
            </div>
            <div className="stat-card">
              <h3>{workoutStats.avgDuration} min</h3>
              <p>Avg. Duration</p>
            </div>
          </div>
        </div>

        {/* <div className="dashboard-section recent-workouts">
          <h2>Recent Workouts</h2>
          <div className="workouts-list">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <div key={workout.id} className="workout-card">
                  <div className="workout-header">
                    <h3>{workout.title}</h3>
                    <span className={`intensity-badge ${getIntensityClass(workout.intensity)}`}>
                      {workout.intensity || 'Medium'}
                    </span>
                  </div>
                  <div className="workout-details">
                    <span>{workout.duration || '0'} mins</span>
                    <span>{workout.exercises?.length || 0} exercises</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-workouts">No recent workouts found</p>
            )}
          </div>
        </div> */}

        <div className="dashboard-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/workouts" className="action-card">
              <span className="icon">💪</span>
              <h3>Start Workout</h3>
              <p>Begin a new training session</p>
            </Link>
            <Link to="/diet-plan" className="action-card">
              <span className="icon">🥗</span>
              <h3>View Diet Plans</h3>
              <p>Check your nutrition plans</p>
            </Link>
            <Link to="/chat" className="action-card">
  <span className="icon">💬</span>
  <h3>Open Chat</h3>
  <p>Message your trainer in real-time</p>
</Link>
          </div>
        </div>
      </div>

      <div className="global-posts-section">
        <h2>🏋️ Community Workout Feed</h2>
        <div className="posts-list">
          {workoutPosts.length > 0 ? (
            workoutPosts.map((post) => (
              <div key={post.id} className="post-card">
                <h3>{post.workout.title}</h3>
                <p><strong>By:</strong> {post.user}</p>
                {post.caption && <p className="caption">"{post.caption}"</p>}
                <div className="post-details">
                  <p><strong>Duration:</strong> {post.workout_details.duration || 'N/A'} mins</p>
                  <p><strong>Total Sets:</strong> {post.workout_details.total_sets}</p>
                  <p><strong>Exercises:</strong> {post.workout_details.total_exercises}</p>
                  <p><strong>Notes:</strong> {post.workout_details.notes}</p>

                  {post.workout_details.exercises?.length > 0 && (
                    <div className="exercise-slider">
                      <strong>Exercise Breakdown:</strong>
                      <div className="slider-wrapper">
                        <button
                          className="slider-btn left"
                          onClick={() => handleSlideLeft(post.id)}
                        >
                          ❮
                        </button>

                        <div className="exercise-slide">
                          {(() => {
                            const currentIndex = currentExerciseIndices[post.id] || 0;
                            const ex = post.workout_details.exercises[currentIndex];
                            return (
                              <div className="exercise-block">
                                <p><strong>{ex.name}</strong></p>
                                <ul>
                                  {ex.sets.map((set, i) => (
                                    <li key={i}>
                                      {set.reps} reps @ {set.weight} kg
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })()}
                        </div>

                        <button
                          className="slider-btn right"
                          onClick={() => handleSlideRight(post.id)}
                        >
                          ❯
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No workout posts found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDash;