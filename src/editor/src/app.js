import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import RouteAuth from "./routeAuth"
import Editor from "./editor"
import LandingPage from "./landing"
import DigestsPage from "./digestsPage"

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={LandingPage} />
      <Route
        path="/editor/:id?"
        render={props => <RouteAuth {...props} component={Editor} />}
      />
      <Route
        path="/digests"
        render={props => <RouteAuth {...props} component={DigestsPage} />}
      />
    </Switch>
  </Router>
)

ReactDOM.render(<App />, document.querySelector("#app"))
