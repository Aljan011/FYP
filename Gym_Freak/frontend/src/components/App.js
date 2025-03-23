import React, { Suspense, lazy, useEffect } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom"; // Use HashRouter to prevent Django interference

// Lazy loading for better performance
const HomePage = lazy(() => import("./HomePage"));
const Login = lazy(() => import("./Login"));
const UserDash = lazy(() => import("./UserDash"));
const Workoutpost = lazy(() => import("./Workoutpost"));

const App = () => {
  useEffect(() => {
    console.log("inside app");
  }, []);
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/workouts">Workouts</Link>
          </li>
        </ul>
      </nav>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<UserDash />} />
            <Route path="/workouts" element={<Workoutpost />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;
