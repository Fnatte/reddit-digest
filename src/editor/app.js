import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Editor from './editor'
import logo from './telegram.svg'

const App = () => (
  <div className="app-container">
    <h1>Reddit Digests</h1>
    <a className="buttonlink" href="https://t.me/redditdigest_bot" target="_blank"><img src={logo} />Add the Bot</a>
    <Router>
      <Route path="/:id">
        <Editor />
      </Route>
    </Router>
  </div>
)

ReactDOM.render(<App />, document.querySelector('#app'))
