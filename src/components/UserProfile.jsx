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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    favorite_exercises: '',
    preferred_diet_plan: '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  // Fetch user profile data
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
        
        setUserData(response.data);
        
        // Format date if it exists (YYYY-MM-DD format for input date field)
        let formattedDate = '';
        if (response.data.profile?.date_of_birth) {
          const date = new Date(response.data.profile.date_of_birth);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        }
        
        // Set form default values with fetched data
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          bio: response.data.profile?.bio || '',
          date_of_birth: formattedDate,
          phone_number: response.data.profile?.phone_number || '',
          address: response.data.profile?.address || '',
          favorite_exercises: response.data.profile?.favorite_exercises || '',
          preferred_diet_plan: response.data.profile?.preferred_diet_plan || '',
        });
        
        if (response.data.profile?.profile_picture) {
          setPreviewUrl(response.data.profile.profile_picture);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setErrorMessage('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle logout function
  const handleLogout = () => {
    // Clear auth token from local storage
    localStorage.removeItem('authToken');
    
    // Optionally, you could also make an API call to invalidate the token on the server
    // but this depends on your backend implementation
    
    // Redirect to login page
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrorMessage('');
    
    // Reset form data and preview URL
    let formattedDate = '';
    if (userData.profile?.date_of_birth) {
      const date = new Date(userData.profile.date_of_birth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }
    
    setFormData({
      username: userData.username || '',
      email: userData.email || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      bio: userData.profile?.bio || '',
      date_of_birth: formattedDate,
      phone_number: userData.profile?.phone_number || '',
      address: userData.profile?.address || '',
      favorite_exercises: userData.profile?.favorite_exercises || '',
      preferred_diet_plan: userData.profile?.preferred_diet_plan || '',
    });
    
    setSelectedImage(null);
    setPreviewUrl(userData.profile?.profile_picture || '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setUpdateSuccess(false);
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken'); // Make sure this matches your authentication setup
      
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username);
      formDataObj.append('email', formData.email);
      formDataObj.append('first_name', formData.first_name);
      formDataObj.append('last_name', formData.last_name);
      formDataObj.append('bio', formData.bio);
      
      if (formData.date_of_birth) {
        formDataObj.append('date_of_birth', formData.date_of_birth);
      }
      
      formDataObj.append('phone_number', formData.phone_number);
      formDataObj.append('address', formData.address);
      formDataObj.append('favorite_exercises', formData.favorite_exercises);
      formDataObj.append('preferred_diet_plan', formData.preferred_diet_plan);
      
      if (selectedImage) {
        formDataObj.append('profile_picture', selectedImage);
      }

      const response = await axios.put('/api/profile/', formDataObj, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      // Update the userData state with the new data
      setUserData(response.data);
      setUpdateSuccess(true);
      setIsEditMode(false);
      setIsLoading(false);
      
      // Show success message briefly
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
      setIsLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || (userData.username ? userData.username.charAt(0).toUpperCase() : '');
  };

  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="profile-container">
      <div className="container mx-auto">
        {updateSuccess && (
          <div className="success-message">Profile updated successfully!</div>
        )}
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        <div className="profile-card max-w-4xl mx-auto">
          {!isEditMode ? (
            // Display Mode
            <>
              <div className="profile-header">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{userData.first_name} {userData.last_name}</h1>
                    <p className="text-white opacity-90">@{userData.username}</p>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={handleEditProfile} 
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
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="avatar" 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {getInitials(formData.first_name, formData.last_name)}
                    </div>
                  )}
                  <label 
                    htmlFor="profile-picture" 
                    className="avatar-edit-button"
                  >
                    <span>+</span>
                    <input
                      type="file"
                      id="profile-picture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="section-title">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="section-title">About You</h3>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Fitness Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Favorite Exercises</label>
                    <input
                      type="text"
                      name="favorite_exercises"
                      value={formData.favorite_exercises}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Diet Plan</label>
                    <input
                      type="text"
                      name="preferred_diet_plan"
                      value={formData.preferred_diet_plan}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary mr-3"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Additional sections for stats and calendar remain unchanged */}
        {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="stats-card">
              <h3 className="section-title">Statistics</h3>
              <div className="flex mb-2">
                <button className="btn btn-primary mr-2 text-sm">Duration</button>
                <button className="btn btn-secondary text-sm">Reps</button>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-bold">0min</div>
                <div className="text-sm text-gray-500">This week</div>
              </div>
              <div className="h-48 flex items-end justify-between">
                {/* Simple bar chart visualization */}
                {Array.from({length: 7}).map((_, i) => (
                  <div key={i} className="w-8 bg-blue-500" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </div>
            
            <div className="calendar-card">
              <div className="calendar-header">
                <h3 className="section-title">Calendar</h3>
                <div className="flex">
                  <button className="btn btn-secondary mr-1 p-1">&lt;</button>
                  <button className="btn btn-secondary p-1">&gt;</button>
                </div>
              </div>
              <div className="text-center mb-4">
                <h4 className="font-medium">April 2025</h4>
              </div>
              <div className="calendar-grid mb-2">
                <div className="text-center text-gray-500 text-sm">S</div>
                <div className="text-center text-gray-500 text-sm">M</div>
                <div className="text-center text-gray-500 text-sm">T</div>
                <div className="text-center text-gray-500 text-sm">W</div>
                <div className="text-center text-gray-500 text-sm">T</div>
                <div className="text-center text-gray-500 text-sm">F</div>
                <div className="text-center text-gray-500 text-sm">S</div>
              </div>
              <div className="calendar-grid">
                {Array.from({length: 30}).map((_, i) => (
                  <div 
                    key={i} 
                    className={`calendar-day ${i === 2 || i === 3 || i === 4 ? 'calendar-day-active' : ''}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;