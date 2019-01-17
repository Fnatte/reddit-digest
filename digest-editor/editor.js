import React from 'react'

const dayLabels = [
  'monday', 'tuesday', 'wednesday', 'thursday','friday', 'saturday', 'sunday'
]

export default class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      title: '',
      subreddits: '',
      days: parseInt('0010000', 2),
      time: 8
    }
  }

  onTitleChange = event => {
    this.setState({ title: event.target.value })
  }

  onSubredditsChange = event => {
    this.setState({ subreddits: event.target.value })
  }

  onTimeChange = event => {
    this.setState({ time: event.target.value })
  }

  onDayChange = day => event => {
    console.log(day)

    this.setState({ days: this.state.days ^ day })
  }

  onSubmit = event => {
    event.preventDefault()
  }

  render () {
    const { title, subreddits, days, time } = this.state

    return (
      <div className="editor">
        <form onSubmit={this.onSubmit}>
          <div className="form-field">
            <label>Title:</label>
            <input type="text" value={title} onChange={this.onTitleChange} />
          </div>
          <div className="form-field">
            <label>Subreddits:</label>
            <input type="text" value={subreddits} onChange={this.onSubredditsChange} />
          </div>
          <div className="form-field">
            <div className="multiselect">
            {(127).toString(2).split('').map((_, index) => (
              <div className="multiselect__choice">
                <input type="checkbox" checked={Boolean((days >>> (6 - index)) % 2)} onChange={this.onDayChange(64 >>> index)} />
                {dayLabels[index]}
              </div>
            ))}
            </div>
          </div>
          <div className="form-field">
            <label>Hour:</label>
            <input type="number" min={0} max={23} value={time} onChange={this.onTimeChange} />
          </div>
          <button>Save</button>
        </form>
      </div>
    )
  }
}
