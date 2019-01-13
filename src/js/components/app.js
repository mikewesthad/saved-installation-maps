import React, { PureComponent } from "react";
import { MemoryRouter as Router, Route, Switch, Link } from "react-router-dom";
import GeneticMap from "../genetic-map";
import SaversMap from "../savers-map";

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
            render={() => <GeneticMap showImage={true} isRecording={false} />}
          />
          <Route
            path="/genetic-record"
            render={() => <GeneticMap showImage={false} isRecording={true} />}
          />
          <Route
            path="/savers-play"
            render={() => <SaversMap showImage={true} isRecording={false} />}
          />
          <Route
            path="/savers-record"
            render={() => <SaversMap showImage={false} isRecording={true} />}
          />
          <Route render={() => <Nav />} />
        </Switch>
      </Router>
    );
  }
}
