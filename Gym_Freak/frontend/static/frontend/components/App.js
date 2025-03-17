import React, { Component } from "react";
import { createRoot } from "react-dom/client";

import HomePage from "./HomePage";
import Login from "./Login";  // 

import UserDash from "./UserDash";
import Workoutpost from "./Workoutpost";

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        
        <div>
            <HomePage />
            <Login />  // Add the Login component
            <UserDash />

            <Workoutpost />
        </div>
        
        );
    }
}

