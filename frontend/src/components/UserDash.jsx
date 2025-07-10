import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {FixedSizeList as List} from 'react-window';
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart, FaComment, FaPaperPlane } from "react-icons/fa";
import "../css/UserDash.css";

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const stars = [];

  for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} className="star-icon" />);
  if (halfStar) stars.push(<FaStarHalfAlt key="half" className="star-icon" />);
  for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`empty-${i}`} className="star-icon" />);

  return stars;
}

const UserDash = () => {
  const [workoutPosts, setWorkoutPosts] = useState([]);
  const [trainers, setTrainers] = useState([]);
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
  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [postComments, setPostComments] = useState({});

  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/trainers/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched trainers:", data);
        setTrainers(data);
      } catch (err) {
        console.error("Error fetching trainers:", err);
      }
    };

    fetchTrainers();
  }, []);

  // Fetch workout posts
  useEffect(() => {
    const fetchWorkoutPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          return;
        }

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

  // Handle reactions
  const handleReaction = async (postId, emoji) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      await axios.post(`http://localhost:8000/api/workout-posts/${postId}/react/`, 
        { emoji }, 
        {
          headers: { Authorization: `Token ${token}` }
        }
      );
    } catch (err) {
      console.error("Reaction failed", err);
    }
  };

  // WebSocket connection
  useEffect(() => {
  const newSocket = new WebSocket("ws://localhost:8000/ws/workout_feed/");

  newSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'like_update') {
      setWorkoutPosts(prev => prev.map(post => 
        post.id === data.post_id 
          ? { 
              ...post, 
              likes_count: data.likes_count,
              is_liked: data.is_liked ?? post.is_liked
            } 
          : post
      ));
    }

    if (data.type === 'comment_new') {
      // Update postComments (what the UI reads from)
      setPostComments(prev => ({
        ...prev,
        [data.post_id]: [...(prev[data.post_id] || []), data.comment]
      }));
      
      // Update comment count in workoutPosts
      setWorkoutPosts(prev => prev.map(post =>
        post.id === data.post_id
          ? { ...post, comments_count: (post.comments_count || 0) + 1 }
          : post
      ));
    }

    if (data.type === 'reaction_update') {
      setWorkoutPosts(prev =>
        prev.map(post =>
          post.id === data.post_id
            ? {
                ...post,
                reactions: [...(post.reactions || []), {
                  emoji: data.emoji,
                  user: data.user
                }]
              }
            : post
        )
      );
    }
  };

    newSocket.onopen = () => {
    console.log('WebSocket connected');
  };

  newSocket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  newSocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  setSocket(newSocket);

  return () => {
    newSocket.close();
  };
}, []);

  // Fetch user data and apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found');
          setIsLoading(false);
          return;
        }

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

  // Like/Unlike functionality - FIXED
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.post(`http://localhost:8000/api/workout-posts/${postId}/like/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // Update local state immediately for better UX
      setWorkoutPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: response.data.is_liked,
              likes_count: response.data.likes_count 
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
  const commentText = newComments[postId]?.trim();
  if (!commentText) return;
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    console.log("Comment being sent:", commentText);
    const response = await axios.post(`http://localhost:8000/api/workout-posts/${postId}/comments/`,
      { text: commentText },
      { headers: { Authorization: `Token ${token}` } }
    );
    
    // Clear the comment input
    setNewComments(prev => ({ ...prev, [postId]: '' }));
    
    // Also update the post's comment count in workoutPosts
    setWorkoutPosts(prev => prev.map(post =>
      post.id === postId
        ? { 
            ...post, 
            comments_count: (post.comments_count || 0) + 1
          }
        : post
    ));
  } catch (error) {
    console.error('Error posting comment:', error);
  }
};

  const toggleComments = async (postId) => {
  setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  
  if (!postComments[postId] && !showComments[postId]) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/workout-posts/${postId}/comments/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      console.log('Fetched comments for post', postId, ':', response.data); // Debug log
      setPostComments(prev => ({ ...prev, [postId]: response.data }));
    } catch (err) {
      console.error("Error loading comments", err);
    }
  }
};

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
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="user-welcome">
          <h1 className="welcome-title">Welcome, {userData.first_name || userData.username}!</h1>
          <p className="welcome-subtitle">Track your fitness journey and stay motivated</p>
        </div>
        <div className="header-actions">
          <button onClick={toggleDarkMode} className="theme-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/profile" className="profile-link">
            {userData.profile?.profile_picture ? (
              <img src={userData.profile.profile_picture} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                {(userData.first_name?.[0] || '') + (userData.last_name?.[0] || '')}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Main Dashboard Content */}
     <main className="dashboard-main">
  {/* Combined Quick Actions and Progress Section */}
  <div className="top-sections-container">
    {/* Quick Actions Section */}
    <section className="quick-actions">
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="actions-grid">
        <Link to="/workouts" className="action-card">
          <div className="action-icon">💪</div>
          <div className="action-content">
            <h3 className="action-title">Start Workout</h3>
            <p className="action-description">Begin a new training session</p>
          </div>
        </Link>
        <Link to="/diet-plan" className="action-card">
          <div className="action-icon">🥗</div>
          <div className="action-content">
            <h3 className="action-title">View Diet Plans</h3>
            <p className="action-description">Check your nutrition plans</p>
          </div>
        </Link>
        <Link to="/chat" className="action-card">
          <div className="action-icon">💬</div>
          <div className="action-content">
            <h3 className="action-title">Open Chat</h3>
            <p className="action-description">Message your trainer in real-time</p>
          </div>
        </Link>
      </div>
      
    </section>
    

        {/* Progress Section - Moved below quick actions */}
        <section className="progress-section">
          <div className="section-header">
            <h2 className="section-title">Your Progress</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{workoutStats.totalWorkouts}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{workoutStats.totalExercises}</div>
              <div className="stat-label">Exercises Done</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{workoutStats.avgDuration} min</div>
              <div className="stat-label">Avg. Duration</div>
            </div>
          </div>
        </section>
</div>
        {/* Trainers Section -  */}
        <section className="trainers-section">
    <div className="section-header">
      <h2 className="section-title">Our Trainers</h2>
    </div>
    {trainers.length === 0 ? (
      <div className="empty-state">
        <p className="empty-message">No trainers found. Check if API returned data.</p>
      </div>
    ) : (
      <div className="trainers-grid">
        {trainers.map(trainer => (
          <div
            key={trainer.id}
            className="trainer-card"
            onClick={() => navigate(`/trainers/${trainer.id}`)}
          >
            <div className="trainer-avatar">
              <img
                src={trainer.profile_picture || "/default-avatar.png"}
                alt={trainer.username}
                className="trainer-image"
              />
            </div>
            <div className="trainer-info">
              <h3 className="trainer-name">{trainer.username}</h3>
              <div className="trainer-rating">
                <div className="stars-container">
                  {renderStars(trainer.average_rating)}
                </div>
                <span className="rating-text">({trainer.average_rating.toFixed(1)} / 5)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>

        {/* Community Workout Feed Section */}
        <section className="workout-feed">
          <div className="section-header">
            <h2 className="section-title">🏋️ Community Workout Feed</h2>
          </div>
          <div className="posts-container">
            {workoutPosts.length > 0 ? (
              workoutPosts.map((post) => (
                <article key={post.id} className="post-card">
                  {/* Post Header */}
                  <div className="post-header">
                    <div className="post-user-info">
                      <div className="user-avatar">
                        {/* Add user avatar if available */}
                      </div>
                      <div className="user-details">
                        <h3 className="workout-title">{post.workout.title}</h3>
                        <p className="post-author">By: {post.user}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Caption */}
                  {post.caption && (
                    <div className="post-caption">
                      <p className="caption-text">"{post.caption}"</p>
                    </div>
                  )}
                  
                  {/* Post Details */}
                  <div className="post-details">
                    <div className="workout-stats">
                      {/* <div className="stat-item">
                        <span className="stat-label">Duration:</span>
                        <span className="stat-value">{post.workout_details.duration || 'N/A'} mins</span>
                      </div> */}
                      <div className="stat-item">
                        <span className="stat-label">Total Sets:</span>
                        <span className="stat-value">{post.workout_details.total_sets}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Exercises:</span>
                        <span className="stat-value">{post.workout_details.total_exercises}</span>
                      </div>
                    </div>
                    
                    {post.workout_details.notes && (
                      <div className="workout-notes">
                        <span className="notes-label">Notes:</span>
                        <p className="notes-text">{post.workout_details.notes}</p>
                      </div>
                    )}

                    {/* Exercise Slider */}
                    {post.workout_details.exercises?.length > 0 && (
                      <div className="exercise-slider">
                        <div className="slider-header">
                          <span className="slider-title">Exercise Breakdown:</span>
                        </div>
                        <div className="slider-container">
                          <button
                            className="slider-btn slider-btn-left"
                            onClick={() => handleSlideLeft(post.id)}
                          >
                            ❮
                          </button>

                          <div className="exercise-slide">
                            {(() => {
                              const currentIndex = currentExerciseIndices[post.id] || 0;
                              const ex = post.workout_details.exercises[currentIndex];
                              return (
                                <div className="exercise-details">
                                  <h4 className="exercise-name">{ex.name}</h4>
                                  <div className="sets-list">
                                    {ex.sets.map((set, i) => (
                                      <div key={i} className="set-item">
                                        <span className="set-info">{set.reps} reps @ {set.weight} kg</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <button
                            className="slider-btn slider-btn-right"
                            onClick={() => handleSlideRight(post.id)}
                          >
                            ❯
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

    {/* Post Interactions */}
    <div className="post-interactions">
      <div className="interaction-buttons">

        {/* ✅ Wrapper added to group button and menu */}
        <div className="like-reaction-wrapper">
          <button 
            className={`interaction-btn like-button ${post.is_liked ? 'liked' : ''}`}
            onClick={() => handleLike(post.id)}
          >
            <span className="btn-icon">
              {post.is_liked ? <FaHeart /> : <FaRegHeart />}
            </span>
            <span className="btn-count">{post.likes_count || 0}</span>
          </button>

          {/* ✅ This is now outside the button but still inside the hoverable wrapper */}
          <div className="reaction-menu">
            <span 
              className="reaction-emoji"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(post.id, '💪');
              }}
            >
              💪
            </span>
            <span 
              className="reaction-emoji"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(post.id, '🔥');
              }}
            >
              🔥
            </span>
            <span 
              className="reaction-emoji"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(post.id, '❤️');
              }}
            >
              ❤️
            </span>
          </div>
        </div>

      </div>
    </div>

                      
                      <button 
                        className="interaction-btn comment-button"
                        onClick={() => toggleComments(post.id)}
                      >
                        <span className="btn-icon">
                          <FaComment />
                        </span>
                        <span className="btn-count">{post.comments_count || 0}</span>
                      </button>
                    {/* </div> */}

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="comments-section">
                        {postComments[post.id] === undefined ? (
                          <div className="comments-loading">
                            <p>Loading comments...</p>
                          </div>
                        ) : (
                          <div className="comments-container">
                            {postComments[post.id].length === 0 ? (
                              <div className="no-comments">
                                <p>No comments yet. Be the first to comment!</p>
                              </div>
                            ) : (
                              <div className="comments-list">
                                {postComments[post.id].map((comment, index) => (
                                  <div key={comment.id || index} className="comment-item">
                                    <div className="comment-content">
                                      <span className="comment-author">{comment.user}:</span>
                                      <span className="comment-text">{comment.text}</span>
                                    </div>
                                    <div className="comment-meta">
                                      <span className="comment-time">
                                        {new Date(comment.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment Input */}
                            <div className="comment-input-container">
                              <input
                                type="text"
                                className="comment-input"
                                placeholder="Add a comment..."
                                value={newComments[post.id] || ''}
                                onChange={(e) =>
                                  setNewComments((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))
                                }
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleComment(post.id);
                                  }
                                }}
                              />
                              <button
                                className="comment-submit-btn"
                                onClick={() => handleComment(post.id)}
                                disabled={!newComments[post.id]?.trim()}
                              >
                                <FaPaperPlane />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  {/* </div> */}

                  {/* Post Reactions Display */}
                  {post.reactions && post.reactions.length > 0 && (
                    <div className="post-reactions">
                      {(() => {
                        const grouped = post.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {});

                        return Object.entries(grouped).map(([emoji, count], idx) => (
                          <div key={idx} className="reaction-group">
                            <span className="reaction-emoji">{emoji}</span>
                            <span className="reaction-count">x{count}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="empty-state">
                <p className="empty-message">No workout posts found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDash;