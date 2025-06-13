import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import UserDash from "./components/UserDash.jsx";
import Workoutpost from "./components/Workoutpost.jsx";
import DietPlan from "./components/DietPlan.jsx";
import AuthPage from "./components/signup.jsx";
import UserProfile from "./components/UserProfile.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ChatPage from "./components/ChatPage.jsx";
import TrainerDetail from "./components/TrainerDetail";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />

                {/* Protected Routes */}
                <Route
                    path="/userdash"
                    element={
                        <ProtectedRoute>
                            <UserDash />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trainers/:trainerId"
                    element={
                        <ProtectedRoute>
                            <TrainerDetail />
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

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />

                
            </Routes>
        </Router>
    );
    
}

export default App;
