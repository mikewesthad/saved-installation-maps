import React, { PureComponent } from "react";
import { MemoryRouter as Router, Route, Switch, Link } from "react-router-dom";
import SeedMap from "../genetic-map";

const Nav = () => (
  <nav>
    <ul>
      <li>
        <Link to="/genetic-play">Genetic Map Play Mode</Link>
      </li>
      <li>
        <Link to="/genetic-record">Genetic Map Record Mode</Link>
      </li>
      <li>
        <Link to="/savers-play">Savers Map Play Mode</Link>
      </li>
      <li>
        <Link to="/savers-record">Savers Map Record Mode</Link>
      </li>
    </ul>
  </nav>
);

export default class App extends PureComponent {
  render() {
    return (
      <Router>
        <Switch>
          <Route
            path="/genetic-play"
            render={() => <SeedMap showImage={true} isRecording={false} />}
          />
          <Route
            path="/genetic-record"
            render={() => <SeedMap showImage={false} isRecording={true} />}
          />
          <Route render={() => <Nav />} />
        </Switch>
      </Router>
    );
  }
}
