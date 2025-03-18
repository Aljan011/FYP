import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { createRoot } from "react-dom/client";

import HomePage from "./HomePage";
import Login from "./Login";  
import UserDash from "./UserDash";
import Workoutpost from "./Workoutpost";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<UserDash />} />
                <Route path="/workout" element={<Workoutpost />} />
            </Routes>
        </Router>
    );
};


export default App;
