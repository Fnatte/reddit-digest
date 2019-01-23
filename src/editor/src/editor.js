import React from "react"
import axios from "axios"
import logo from "./telegram.svg"
import "./editor.styl"

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

const uiStringVariants = {
  create: {
    title: "Create a new digest"
  },
  update: {
    title: "Update digest"
  }
}

export default class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      __creating: false,
      __loading: false,
      error: null,

      digestId: null,
      title: "",
      subreddits: "",
      days: parseInt("0000000", 2),
      time: 8,
      createdDigest: null
    }
  }

  componentDidMount() {
    const digestId = this.props.match.params.id

    if (digestId) {
      this.setState({ __loading: true })

      axios(`/api/digest/${digestId}`)
        .then(res => {
          const digest = res.data

          this.setState({
            __loading: false,

            digestId: digest.id,
            title: digest.title,
            subreddits: digest.subreddits,
            days: digest.days,
            time: digest.time
          })
        })
        .catch(error => {
          console.error(error.response.data)
          this.setState({ __loading: false })
          window.location = "/"
        })
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

    this.setState({ __creating: true })

    const { digestId, title, subreddits, days, time } = this.state

    axios
      .post(`/api/digest${digestId ? `/${digestId}` : ""}`, {
        title,
        subreddits,
        days,
        time
      })
      .then(response => {
        this.setState({
          __creating: false,
          createdDigest: response.data.id
        })
      })
      .catch(error => {
        console.error(error)
        this.setState({ __creating: false, error: "Something broke :/" })
      })
  }

  render() {
    const {
      error,
      __loading,
      __creating,
      digestId,
      createdDigest,
      title,
      subreddits,
      days,
      time
    } = this.state


    if (__loading) {
      return <div>Loading digest...</div>
    }

    const strings = digestId ? uiStringVariants.update : uiStringVariants.create
    const canSubmitForm = title.length && subreddits.length && days > 0 && time

    return (
      <div className="editor-page">
        <h3>{strings.title}</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-field">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={this.onTitleChange}
              disabled={__creating}
            />
          </div>
          <div className="form-field">
            <label>Comma-separated subreddits:</label>
            <input
              type="text"
              value={subreddits}
              onChange={this.onSubredditsChange}
              disabled={__creating}
              placeholder="technology, programming, javascript"
            />
          </div>
          <div className="form-field">
            <label>What days?</label>
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
                      disabled={__creating}
                      id={`choice-${dayLabels[index]}`}
                    />
                    <label htmlFor={`choice-${dayLabels[index]}`}>
                      {dayLabels[index]}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <div className="form-field">
            <label>At what time?</label>
            <input
              type="number"
              min={0}
              max={23}
              value={time}
              onChange={this.onTimeChange}
              disabled={__creating}
            />
          </div>
          <button disabled={__creating || !canSubmitForm}>{__creating ? "..." : "Save"}</button>
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
