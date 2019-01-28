import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import axios from "axios"
import RouteAuth from "./views/routeAuth"
import EditorView from "./views/editorView"
import LandingView from "./views/landingView"
import DigestsView from "./views/digestsView"

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={LandingView} />
      <Route
        path="/editor/:id?"
        render={props => <RouteAuth {...props} component={EditorView} />}
      />
      <Route
        path="/digests"
        render={props => <RouteAuth {...props} component={DigestsView} />}
      />
      <Route
        path="/logout"
        render={({ history }) => {
          axios("/api/auth/logout").then(response => {
            window.mixpanel.push("Logout")
            history.push("/")
          })
          return null
        }}
      />
    </Switch>
  </Router>
)

ReactDOM.render(<App />, document.querySelector("#app"))
