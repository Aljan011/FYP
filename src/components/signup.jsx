import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/signup.css';
import { useLocation } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [registrationData, setRegistrationData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // Check if the user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check if the token is valid by making a request to the server
      axiosInstance.defaults.headers['Authorization'] = `Token ${token}`;
      axiosInstance.get('/profile/')
        .then((response) => {
          // If token is valid and profile is fetched, redirect to profile
          navigate('/profile');
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          // If error occurs (e.g. token is invalid), remove token and do not redirect
          localStorage.removeItem('authToken');
        });
    }
  }, [navigate]);

  const handleInputChange = (e, isLoginForm = true) => {
    const { name, value } = e.target;
    if (isLoginForm) {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegistrationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
  
    try {
      const response = await axiosInstance.post('/login/', loginData);
      const data = response.data;
  
      if (data.token) {
        // Save token in localStorage
        localStorage.setItem('authToken', data.token);
        axiosInstance.defaults.headers['Authorization'] = `Token ${data.token}`;
  
        // Fetch the user profile to ensure the user is authorized
        const profileRes = await axiosInstance.get('/profile/');
        if (profileRes.status === 200) {
          setLoginSuccess(true);
          setTimeout(() => {
            // Redirect after successful login
            const from = location.state?.from?.pathname || '/profile';
            navigate(from, { replace: true });
          }, 1500);
        } else {
          setLoginError('Failed to retrieve user profile.');
        }
      } else {
        setLoginError('Login failed. No token received.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 403) {
        setLoginError('Your account is pending admin approval.');
      } else if (error.response?.data?.detail) {
        setLoginError(error.response.data.detail);
      } else {
        setLoginError('Network or server error. Please try again.');
      }
    }
  };
  

  const handleRegistration = async (e) => {
    e.preventDefault();
    setRegistrationError(null);

    if (registrationData.password !== registrationData.confirmPassword) {
      setRegistrationError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registrationData.username,
          email: registrationData.email,
          password: registrationData.password,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRegistrationError('Registration successful. Awaiting admin approval.');
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        setRegistrationError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('Network error. Please try again.');
    }
  };

  const successMessageStyle = {
    padding: '15px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '5px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
    animation: 'fadeIn 0.5s'
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Success Message */}
        {loginSuccess && (
          <div style={successMessageStyle} className="success-message">
            Login Successful! Redirecting to Home Page...
          </div>
        )}

        <div className="auth-form">
          <h2 className="auth-header">
            {isLogin ? 'Login to GymFreak' : 'Create Your Account'}
          </h2>

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  placeholder="Enter your username"
                  className="form-input"
                  disabled={loginSuccess}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={loginSuccess}
                />
              </div>
              {loginError && <p className="error-message">{loginError}</p>}
              <button type="submit" className="submit-button" disabled={loginSuccess}>
                {loginSuccess ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistration}>
              <div className="name-inputs-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={registrationData.firstName}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                    placeholder="First Name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={registrationData.lastName}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                    placeholder="Last Name"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={registrationData.username}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Choose a username"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={registrationData.email}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registrationData.password}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Create a password"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registrationData.confirmPassword}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Confirm your password"
                  className="form-input"
                />
              </div>
              {registrationError && <p className="error-message">{registrationError}</p>}
              <button type="submit" className="submit-button">
                Register
              </button>
            </form>
          )}
        </div>
        <p className="toggle-form" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
