import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom"; // Use HashRouter to prevent Django interference

import { createRoot } from "react-dom/client";

// Lazy loading for better performance
const HomePage = lazy(() => import("./HomePage"));
const Login = lazy(() => import("./Login"));
const UserDash = lazy(() => import("./UserDash"));
const Workoutpost = lazy(() => import("./Workoutpost"));

const App = () => {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<UserDash />} />
                    <Route path="/workout" element={<Workoutpost />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

// Ensure React is mounted correctly in both HTML files
const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}

export default App;

