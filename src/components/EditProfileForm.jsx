import React from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfileForm = ({ formData, ...props }) => {
  const navigate = useNavigate();

  const handleCancel = () => navigate('/profile');

  return (
    <div className="edit-profile-wrapper">
      <div className="edit-profile">
        <form onSubmit={props.handleSubmit} className="profile-card">
          
           {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-container">
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
      
      {/* Personal Information Section */}
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
      
      {/* Contact Details Section */}
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
            className="form-input"
          />
        </div>
      </div>
      
      {/* About You Section */}
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

      {/* Fitness Preferences Section */}
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

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          onClick={handleCancelEdit}
          className="btn btn-secondary"
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
      </div>
    </div>
  );
};

export default EditProfileForm;
