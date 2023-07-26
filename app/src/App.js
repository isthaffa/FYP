/* eslint-disable jsx-a11y/alt-text */
import './App.scss';

import 'normalize.css/normalize.css'; //NP, Resettar alla browsers default grejer
import React from 'react';
//import firebase from "./firebase";

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import StreamingPage from './components/BodyContainer/Streaming.js';
import HomePage from './Home';
import LearningPage from './Learning';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/streaming" component={StreamingPage} />
        <Route path="/learning" component={LearningPage} />
        {/* Other routes */}
      </Switch>
    </Router>
  );
};

export default App;
