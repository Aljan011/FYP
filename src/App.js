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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/diet-detail/:id" element={<DietDetail />} />

                {/* Wrap protected components with ProtectedRoute in element prop */}
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
