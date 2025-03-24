import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './HomePage'; // Assuming you have a Home component
import Workoutpost from './Workoutpost'; // Your workouts page component
import DietPlan from './DietPlan'; // Your search page component

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/Workoutpost" component={Workoutpost} />
          <Route path="/Dietplan" component={DietPlan} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
