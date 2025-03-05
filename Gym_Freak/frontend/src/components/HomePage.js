import React,{Component} from "react";
import UserDash from "./UserDash";
import {BrowserRouter as Router, Route, Switch, Link, redirect} from "react-router-dom";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return
         <Router>
            <Switch>
                <Route exact path="/"><p>This home page</p></Route>
                <Route path="/user" exact component={UserDash} ></Route>
                <Route path="/workout" exact component={Workoutpost} ></Route>
            </Switch>
        </Router>;
    }
}