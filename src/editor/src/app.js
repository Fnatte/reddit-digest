import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Editor from './editor'
import LandingPage from './landing'

const App = () => (
    <Router>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/editor/:id?" component={Editor} />
      </Switch>
    </Router>
)

ReactDOM.render(<App />, document.querySelector('#app'))
