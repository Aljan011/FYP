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

  for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
  if (halfStar) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);

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
    
    // // Update postComments state (this is what the UI reads from)
    // setPostComments(prev => ({ 
    //   ...prev, 
    //   [postId]: [...(prev[postId] || []), response.data]
    // }));
    
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

        <div className="my-8 px-4">
          <h2 className="text-2xl font-bold mb-4">Our Trainers</h2>
          {trainers.length === 0 ? (
            <p className="text-gray-500">No trainers found. Check if API returned data.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map(trainer => (
                <div
                  key={trainer.id}
                  className="cursor-pointer p-4 bg-white shadow rounded flex items-center gap-4 hover:bg-gray-100 transition"
                  onClick={() => navigate(`/trainers/${trainer.id}`)}
                >
                  <img
                    src={trainer.profile_picture || "/default-avatar.png"}
                    alt={trainer.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{trainer.username}</h3>
                    <div className="flex items-center gap-1">
                      {renderStars(trainer.average_rating)}
                      <span className="text-sm text-gray-600">({trainer.average_rating.toFixed(1)} / 5)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                <div className="post-header">
                  <h3>{post.workout.title}</h3>
                  <p><strong>By:</strong> {post.user}</p>
                </div>
                
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

                {/* Like and Comment Section */}
                <div className="post-interactions">
                  <div className="interaction-buttons">
                    <button 
                      className={`like-button ${post.is_liked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      {post.is_liked ? <FaHeart /> : <FaRegHeart />}
                      <span>{post.likes_count || 0}</span>
                      <div className="reaction-menu">
                        <span onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(post.id, '💪');
                        }}>💪</span>
                        <span onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(post.id, '🔥');
                        }}>🔥</span>
                        <span onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(post.id, '❤️');
                        }}>❤️</span>
                      </div>
                    </button>
                    
                    <button 
                      className="comment-button"
                      onClick={() => toggleComments(post.id)}
                    >
                      <FaComment />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="comments-section">
  {postComments[post.id] === undefined ? (
    <p>Loading comments...</p>
  ) : (
    <>
      {postComments[post.id].length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <div className="comments-list">
          {postComments[post.id].map((comment, index) => (
            <div key={comment.id || index} className="comment">
              <strong>{comment.user}:</strong> {comment.text}
              <span className="comment-time">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Always show comment input */}
      <div className="comment-input">
        <input
          type="text"
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
          onClick={() => handleComment(post.id)}
          disabled={!newComments[post.id]?.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </>
  )}
</div>

                  )}
                </div>
                {post.reactions && post.reactions.length > 0 && (() => {
  const grouped = post.reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="post-reactions mt-2 flex flex-wrap gap-3 text-xl">
      {Object.entries(grouped).map(([emoji, count], idx) => (
        <span key={idx}>
          {emoji} x{count}
        </span>
      ))}
    </div>
  );
})()}

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