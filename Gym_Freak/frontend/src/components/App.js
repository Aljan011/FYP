import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Workoutpost from "./Workoutpost";
import DietPlan from "./DietPlan";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Workoutpost" element={<Workoutpost />} />
          <Route path="/Dietplan" element={<DietPlan />} />
          <Route path="/workouts" element={<Workoutpost />} />
          <Route path="/diet-plan" element={<DietPlan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
