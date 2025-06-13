import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/signup.css'; // Make sure to replace with your new CSS file

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    lastName: '',
    role: 'user'
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axiosInstance.defaults.headers['Authorization'] = `Token ${token}`;
      axiosInstance.get('/profile/')
        .then(() => navigate('/profile'))
        .catch((error) => {
          console.error('Error fetching profile:', error);
          localStorage.removeItem('authToken');
        });
    }
  }, [navigate]);

  const handleInputChange = (e, isLoginForm = true) => {
    const { name, value } = e.target;
    if (isLoginForm) {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegistrationData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/login/', loginData);
      const data = response.data;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        axiosInstance.defaults.headers['Authorization'] = `Token ${data.token}`;

        const profileRes = await axiosInstance.get('/profile/');
        if (profileRes.status === 200) {
          const role = profileRes.data.role;
          localStorage.setItem('userRole', data.role);
          setLoginSuccess(true);
          setTimeout(() => {
            const from = location.state?.from?.pathname || '/UserDash';
            navigate(from, { replace: true });
          }, 1500);
        } else {
          setLoginError('Failed to retrieve user profile.');
          setIsLoading(false);
        }
      } else {
        setLoginError('Login failed. No token received.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 403) {
        setLoginError('Your account is pending admin approval.');
      } else if (error.response?.data?.detail) {
        setLoginError(error.response.data.detail);
      } else {
        setLoginError('Network or server error. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setRegistrationError(null);
    setIsLoading(true);

    if (registrationData.password !== registrationData.confirmPassword) {
      setRegistrationError('Passwords do not match');
      setIsLoading(false);
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
          last_name: registrationData.lastName,
          role: registrationData.role
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRegistrationError(null);
        setLoginSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setLoginSuccess(false);
        }, 2000);
      } else {
        setRegistrationError(data.detail || 'Registration failed. Please try again.');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Brand Logo Position (you can add your logo here) */}
        <div className="auth-form">
          <svg className="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 17.5L7.5 16.5M17.5 6.5L16.5 7.5M7.5 7.5L6.5 6.5M16.5 16.5L17.5 17.5M12 3V4M12 20V21M3 12H4M20 12H21M7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12Z" 
                  stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          <h2 className="auth-header">
            {isLogin ? 'Welcome to GymFreak' : 'Join GymFreak'}
          </h2>

          {loginSuccess && (
            <div className="success-message">
              {isLogin ? 'Login successful! Redirecting...' : 'Registration successful! Please log in.'}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username" className="form-label" style={{color: '#111'}}>Username</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  placeholder="Enter your username"
                  className="form-input"
                  style={{color: '#111'}}
                  disabled={loginSuccess || isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label" style={{color: '#111'}}>Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                  style={{color: '#111'}}
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={loginSuccess || isLoading}
                />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit" className="submit-button" disabled={loginSuccess || isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
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
                    id="firstName"
                    value={registrationData.firstName}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                    placeholder="First Name"
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={registrationData.lastName}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                    placeholder="Last Name"
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  id="reg-username"
                  value={registrationData.username}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Choose a username"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={registrationData.email}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Enter your email"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  id="reg-password"
                  value={registrationData.password}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Create a password"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={registrationData.confirmPassword}
                  onChange={(e) => handleInputChange(e, false)}
                  required
                  placeholder="Confirm your password"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Register as:</label>
                <select
                  name="role"
                  id="role"
                  value={registrationData.role}
                  onChange={(e) => handleInputChange(e, false)}
                  className="form-input"
                  required
                  disabled={isLoading}
                >
                  <option value="user">User</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              {registrationError && <div className="error-message">{registrationError}</div>}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="toggle-form" onClick={() => !isLoading && setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;