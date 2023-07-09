/* eslint-disable jsx-a11y/alt-text */
import "./App.scss";

import "normalize.css/normalize.css"; //NP, Resettar alla browsers default grejer
import React from "react";
//import firebase from "./firebase";

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import TrainingPage from './components/BodyContainer/Training.js';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={TrainingPage} />
        <Route path="/training" component={TrainingPage} />
        {/* Other routes */}
      </Switch>
    </Router>
  );
};

export default App;
