import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import UserDash from "./components/UserDash.jsx";
import Workoutpost from "./components/Workoutpost.jsx";
import DietPlan from "./components/DietPlan.jsx";
import AuthPage from "./components/signup.jsx";
import UserProfile from "./components/UserProfile.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DietDetail from "./components/DietDetail.jsx";
import ChatPage from "./components/ChatPage.jsx";
import EditProfileForm from "./components/EditProfileForm.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />

                {/* Protected Routes */}
                <Route
                    path="/UserDash"
                    element={
                        <ProtectedRoute>
                            <UserDash />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workouts"
                    element={
                        <ProtectedRoute>
                            <Workoutpost />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/diet-plan"
                    element={
                        <ProtectedRoute>
                            <DietPlan />
                        </ProtectedRoute>
                    }
                />
                <Route 
                     path="/chat" 
                     element={
                     <ProtectedRoute>
                        <ChatPage />
                        </ProtectedRoute>
                        } 
                        />

<Route path="/diet-plans/:slug" element={
  <ProtectedRoute>
    <DietDetail />
  </ProtectedRoute>
} />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile/edit"
                    element={
                        <ProtectedRoute>
                            <EditProfileForm />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
    
}

export default App;
