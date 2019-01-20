import React from "react"
import axios from "axios"

/* eslint-disable no-console */

const dayLabels = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]

export default class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      error: null,

      title: "",
      subreddits: "",
      days: parseInt("0000000", 2),
      time: 8,
      createdDigest: null
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

  onDayChange = day => () => {
    this.setState({ days: this.state.days ^ day })
  }

  onSubmit = event => {
    event.preventDefault()

    this.setState({ loading: true })

    const { title, subreddits, days, time } = this.state

    axios
      .post("/api/digest", { title, subreddits, days, time })
      .then(response => {
        this.setState({
          loading: false,
          createdDigest: response.data.id
        })
      })
      .catch(error => {
        console.error(error)
        this.setState({ loading: false, error: "Something broke :/" })
      })
  }

  render() {
    const {
      error,
      loading,
      createdDigest,
      title,
      subreddits,
      days,
      time
    } = this.state

    return (
      <div className="editor">
        <h3>Create a new digest</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-field">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={this.onTitleChange}
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label>Comma-separated subreddits:</label>
            <input
              type="text"
              value={subreddits}
              onChange={this.onSubredditsChange}
              disabled={loading}
              placeholder="technology, programming, javascript"
            />
          </div>
          <div className="form-field">
            <div className="multiselect">
              {(127)
                .toString(2)
                .split("")
                .map((_, index) => (
                  <div key={index} className="multiselect__choice">
                    <input
                      type="checkbox"
                      checked={Boolean((days >>> (6 - index)) % 2)}
                      onChange={this.onDayChange(64 >>> index)}
                      disabled={loading}
                    />
                    {dayLabels[index]}
                  </div>
                ))}
            </div>
          </div>
          <div className="form-field">
            <label>Hour:</label>
            <input
              type="number"
              min={0}
              max={23}
              value={time}
              onChange={this.onTimeChange}
              disabled={loading}
            />
          </div>
          <button disabled={loading}>{loading ? "..." : "Save"}</button>
        </form>

        {error && (
          <div className="notification--error">
            <p>{error}</p>
          </div>
        )}
        {createdDigest && (
          <div className="notification">
            <p>
              Awesome. Give the following id to the bot with the{" "}
              <code>/subscribe</code> command.
            </p>
            <p>
              <code>{createdDigest}</code>
            </p>
          </div>
        )}
      </div>
    )
  }
}
