import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Editor from "./editor"
import LandingPage from "./landing"

const App = () => (
  <div className="wrapper">
    <header>
      <h1>Reddit Digests</h1>
    </header>
    <Router>
      <Switch>
        <Route path="/" exact component={LandingPage} />
        <Route path="/editor/:id?" component={Editor} />
      </Switch>
    </Router>
    <footer>
      <div>
        <span>
          Built by <a href="https://antonniklasson.se">Anton Niklasson</a>
        </span>
      </div>
    </footer>
  </div>
)

ReactDOM.render(<App />, document.querySelector("#app"))
