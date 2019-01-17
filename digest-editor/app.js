import React from 'react'
import ReactDOM from 'react-dom'
import Editor from './editor'

const App = () => (
  <div className="app-container">
    <h1>Reddit Digest Editor</h1>

    <Editor />
  </div>
)

ReactDOM.render(<App />, document.querySelector('#app'))
