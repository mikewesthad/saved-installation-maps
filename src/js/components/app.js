import React, { PureComponent } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SeedMap from "../genetic-map";

const About = () => <h2>About</h2>;
const Users = () => <h2>Users</h2>;

export default class App extends PureComponent {
  render() {
    return (
      <Router>
        <div>
          {/* <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about/">About</Link>
              </li>
              <li>
                <Link to="/users/">Users</Link>
              </li>
            </ul>
          </nav> */}

          <Route path="/" render={() => <SeedMap showImage={false} isRecording={true} />} />
        </div>
      </Router>
    );
  }
}
