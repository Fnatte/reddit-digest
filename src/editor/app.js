import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Editor from './editor'

const App = () => (
  <div className="app-container">
    <h1>Reddit Digest Editor</h1>

    <Router>
      <Route path="/:id">
        <Editor />
      </Route>
    </Router>
    
  </div>
)

ReactDOM.render(<App />, document.querySelector('#app'))
