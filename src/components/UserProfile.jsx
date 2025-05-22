import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    profile: {
      profile_picture: null,
      bio: '',
      date_of_birth: '',
      phone_number: '',
      address: '',
      favorite_exercises: '',
      preferred_diet_plan: '',
    },
    first_name: '',
    last_name: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Workout history states
  const [workouts, setWorkouts] = useState([]);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [workoutError, setWorkoutError] = useState(null);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'stats'
  const [selectedWorkout, setSelectedWorkout] = useState(null); // New state for selected workout
  
  const navigate = useNavigate();

  // Navigate back to UserDash
  const handleBackToDashboard = () => {
    navigate('/UserDash');
  };

 // Make sure this function is correctly implemented
const fetchWorkoutHistoryByUsername = async (username) => {
  try {
    setWorkoutLoading(true);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setWorkoutError('Authentication required');
      setWorkoutLoading(false);
      return;
    }
    
    const response = await axios.get(`http://localhost:8000/api/users/${username}/workouts/`, {
      headers: {
        Authorization: `Token ${token}`
      }
    });
    
    console.log("Fetched workout data:", response.data);
    setWorkouts(response.data);
    setWorkoutLoading(false);
  } catch (err) {
    setWorkoutError('Failed to load workout history');
    setWorkoutLoading(false);
    console.error('Error fetching workouts:', err);
  }
};

const handlePostWorkout = async (workoutId) => {
  if (!workoutId || isNaN(workoutId)) {
    alert("Invalid workout ID.");
    return;
  }

  const token = localStorage.getItem("authToken");

  try {
    const caption = prompt("Enter a caption for your workout post:");

    const response = await fetch(`http://localhost:8000/api/workout-posts/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        workout: workoutId,
        caption: caption || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Server responded with error:", data);
      alert(`Failed to post workout: ${data.detail || JSON.stringify(data)}`);
      return;
    }

    alert("Workout posted successfully!");
  } catch (error) {
    console.error("Error posting workout:", error);
    alert("Error posting workout. Check console.");
  }
};

// Add a separate useEffect specifically for fetching workout history
useEffect(() => {
  if (userData && userData.username) {
    fetchWorkoutHistoryByUsername(userData.username);
  }
}, [userData.username]); // This will re-run when username changes

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
  
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });
  
        const user = response.data;
        console.log("Fetched user:", user);
  
        setUserData(user);

        if (user.profile?.profile_picture) {
          setPreviewUrl(user.profile.profile_picture);
        }
  
        setIsLoading(false);
  
        // ✅ Updated: Use username to fetch workout history
        if (user.username) {
          fetchWorkoutHistoryByUsername(user.username);
        } else {
          console.warn("Username is missing in profile response");
          setWorkoutLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          setErrorMessage('Failed to load profile data');
          setIsLoading(false);
        }
      }
    };
  
    fetchUserProfile();
  }, [navigate]);
  
  // Handle logout function
  const handleLogout = () => {
    // Clear auth token from local storage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || (userData.username ? userData.username.charAt(0).toUpperCase() : '');
  };

  // Workout History Functions
  
  // Group workouts by date for better organization
  const groupWorkoutsByDate = () => {
    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return {};
    }
    
    const grouped = {};
    
    workouts.forEach(workout => {
      if (!workout || !workout.created_at) return;
      
      const date = new Date(workout.created_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(workout);
    });
    
    return grouped;
  };
  
  // Calculate total stats
  const calculateStats = () => {
    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalExercises: 0,
        totalDuration: 0,
        averageIntensity: 'N/A',
      };
    }
    
    return {
      totalWorkouts: workouts.length,
      totalExercises: workouts.reduce((acc, workout) => acc + (workout.workout_session?.exercise_sets?.length || 0), 0),
      totalDuration: workouts.reduce((acc, workout) => {
        if (workout.duration) {
          // Convert duration string to minutes (assuming format: HH:MM:SS)
          const [hours, minutes] = workout.duration.split(':').map(Number);
          return acc + ((hours || 0) * 60 + (minutes || 0));
        }
        return acc;
      }, 0),
      averageIntensity: calculateAverageIntensity(),
    };
  };
  
  const calculateAverageIntensity = () => {
    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) return 'N/A';
    
    const intensityMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const sum = workouts.reduce((acc, workout) => {
      return acc + (workout.intensity ? intensityMap[workout.intensity] || 0 : 0);
    }, 0);
    const avg = sum / workouts.length;
    
    if (avg < 1.5) return 'Low';
    if (avg < 2.5) return 'Medium';
    return 'High';
  };
  
  // Format duration from seconds to MM:SS
  const formatDuration = (durationString) => {
    if (!durationString) return '0min';
    
    // Parse duration string (assumed format: HH:MM:SS)
    const parts = durationString.split(':');
    const hours = parseInt(parts[0] || 0);
    const minutes = parseInt(parts[1] || 0);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };
  
  const renderRecentWorkouts = () => {
    const groupedWorkouts = groupWorkoutsByDate();
  
    if (Object.keys(groupedWorkouts).length === 0) {
      return <p className="no-data-message">No workout history available</p>;
    }
  
    return (
      <div className='user-profile-container'>
        <div className="user-profile-inner">
          <div className="user-profile-workout">
            <div className="workout-history-list">
              {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
                <div key={date} className="workout-day">
                  <div className="workout-date">{date}</div>
                  {dayWorkouts.map(workout => {
                    const sets = workout.workout_session?.exercise_sets || [];
        
                    const uniqueExercises = [...new Map(
                      sets.map(set => [set.exercise?.id, set.exercise])
                    ).values()];
        
                    return (
                      <div 
                        key={workout.id} 
                        className={`workout-card ${selectedWorkout?.id === workout.id ? 'selected-workout' : ''}`}
                        onClick={() => setSelectedWorkout(workout)}
                      >
                        <div className="workout-header">
                          <h3>{workout.title || "Untitled Workout"}</h3>
                          <span className={`intensity-badge intensity-${(workout.intensity || "").toLowerCase()}`}>
                            {workout.intensity || "N/A"}
                          </span>
                        </div>
        
                        <div className="workout-details">
                          <div className="workout-detail">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{formatDuration(workout.workout_session?.total_duration || "N/A")}</span>
                          </div>
                          <div className="workout-detail">
                            <span className="detail-label">Sets:</span>
                            <span className="detail-value">{sets.length}</span>
                          </div>
                          <div className="workout-detail">
                            <span className="detail-label">Exercises:</span>
                            <span className="detail-value">{uniqueExercises.length}</span>
                          </div>
                        </div>
        
                        {sets.length > 0 ? (
                          <div className="workout-exercises">
                            {uniqueExercises.slice(0, 3).map((exercise, idx) => {
                              const relatedSets = sets.filter(set => set.exercise?.id === exercise.id);
                              return (
                                <div key={exercise.id || idx} className="exercise-item">
                                  <span className="exercise-name">{exercise.name || "Unknown Exercise"}</span>
                                  <div className="exercise-sets">
                                    {relatedSets.map((s, i) => (
                                      <div key={s.id || i} className="set-info">
                                        Set {s.set_number}: {s.reps} reps @ {s.weight} kg
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
        
                            {uniqueExercises.length > 3 && (
                              <div className="more-exercises">+{uniqueExercises.length - 3} more</div>
                            )}
                          </div>
                        ) : (
                          <div className="workout-exercises">
                            <p>No exercises recorded</p>
                          </div>
                        )}
        
                        {workout.notes && (
                          <div className="workout-notes">
                            <p>{workout.notes}</p>
                          </div>
                        )}
                        
                        {/* Add Post This Workout button to each workout card */}
                        <div className="workout-actions mt-3">
                          <button 
                            className="post-workout-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePostWorkout(workout.id);
                            }}
                          >
                            Post This Workout
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderWorkoutStats = () => {
    const stats = calculateStats();
    
    return (
      <div className="user-profile-workout">
        <div className="workout-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalExercises}</div>
            <div className="stat-label">Exercises Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</div>
            <div className="stat-label">Total Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageIntensity}</div>
            <div className="stat-label">Avg. Intensity</div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="profile-container">
      {/* Check for loading state first */}
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="container mx-auto">
          {/* Back button to UserDash */}
          <div className="back-button-container mb-4">
            <button 
              onClick={handleBackToDashboard} 
              className="btn btn-secondary flex items-center"
            >
              <span className="mr-1">←</span> Back to Dashboard
            </button>
          </div>
  
          {updateSuccess && (
            <div className="success-message">Profile updated successfully!</div>
          )}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          
          <div className="profile-card max-w-4xl mx-auto">
            {/* Display Mode */}
            <div className="profile-header">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{userData.first_name} {userData.last_name}</h1>
                  <p className="text-white opacity-90">@{userData.username}</p>
                </div>
                <div className="flex">
                  <button 
                    onClick={() => navigate('/profile-edit')} 
                    className="btn btn-secondary mr-2"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-danger"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="avatar-container mt-4">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={userData.username} 
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(userData.first_name, userData.last_name)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="info-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{userData.email}</p>
                </div>
                
                {userData.profile?.phone_number && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{userData.profile.phone_number}</p>
                  </div>
                )}
                
                {userData.profile?.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{userData.profile.address}</p>
                  </div>
                )}
                
                {userData.profile?.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{formatDate(userData.profile.date_of_birth)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {userData.profile?.bio && (
              <div className="info-section">
                <h3 className="section-title">About</h3>
                <p>{userData.profile.bio}</p>
              </div>
            )}
            
            {(userData.profile?.favorite_exercises || userData.profile?.preferred_diet_plan) && (
              <div className="info-section">
                <h3 className="section-title">Fitness Preferences</h3>
                
                {userData.profile?.favorite_exercises && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Favorite Exercises</p>
                    <p>{userData.profile.favorite_exercises}</p>
                  </div>
                )}
                
                {userData.profile?.preferred_diet_plan && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preferred Diet Plan</p>
                    <p>{userData.profile.preferred_diet_plan}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Workout History Section */}
          <div className="workout-history-container max-w-4xl mx-auto mt-6">
            <h2 className="section-title">Workout History</h2>
            
            <div className="user-profile-workout">
              <div className="workout-tabs">
                <button 
                  className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recent')}
                >
                  Recent Workouts
                </button>
                <button 
                  className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  Statistics
                </button>
              </div>
              
              <div className="tab-content">
                {workoutLoading ? (
                  <div className="loading-state">Loading workout history...</div>
                ) : workoutError ? (
                  <div className="error-state">{workoutError}</div>
                ) : (
                  activeTab === 'recent' ? renderRecentWorkouts() : renderWorkoutStats()
                )}
                {workouts.length > 0 && (
                  <div className="workout-actions mt-4">
                    <button 
                      className="post-workout-button" 
                      onClick={() => selectedWorkout && handlePostWorkout(selectedWorkout.id)} 
                      disabled={!selectedWorkout}
                    >
                      Post Selected Workout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
}

export default UserProfile;