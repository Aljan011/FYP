import React,{Component} from "react";
import UserDash from "./UserDash";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";


export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
         <Router>
            <Routes>

                <Route exact path="/"><p>This home page</p></Route>
                <Route path="/user" element={<UserDash />} />
                <Route path="/workout" element={<Workoutpost />} />

            </Routes>

        </Router>
        );
    }
}
