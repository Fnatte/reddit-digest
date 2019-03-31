import React from "react"
import axios from "axios"
import { NavLink, Link } from "react-router-dom"
import firebase from "../firebase"
import Layout from "../layout"
// import { DestructiveButton } from "../components/button"
import ConfirmableDestructiveAction from "../components/confirmableDestructiveAction"
import "./digestsView.styl"

export default class DigestsPage extends React.Component {
  state = {
    __fetching: false,
    digests: []
  }

  componentDidMount() {
    this.setState({ __fetching: true })

    axios.get("/api/digest").then(response => {
      this.setState({ digests: response.data, __fetching: false })
    })
  }

  deleteDigest = digest => () => {
    this.setState({ __deleting: true })

    axios
      .delete(`/api/digest/${digest.id}`)
      .then(response => {
        this.setState({
          __deleting: false,
          digests: this.state.digests.filter(d => d.id !== digest.id)
        })
      })
      .catch(error => {
        this.setState({ __deleting: false })
      })
  }

  render() {
    const { __fetching, digests } = this.state

    return (
      <Layout>
        <div className="digests-page">
          <h2>Your Digests</h2>
          {__fetching ? (
            <div className="digests__loading">
              <em>Fetching your digests...</em>
            </div>
          ) : digests.length > 0 ? (
            <React.Fragment>
              <div className="digests__list">
                {digests.map(digest => (
                  <div key={digest.id} className="digests__item">
                    <NavLink to={`/editor/${digest.id}`}>
                      {digest.title}
                    </NavLink>
                    <ConfirmableDestructiveAction
                      actionLabel={`Delete ${digest.title}`}
                      confirmLabel="Do it!"
                      cancelLabel="Nah, don't."
                      onConfirm={this.deleteDigest(digest)}
                      onCancel={() => {}}
                    />
                  </div>
                ))}
              </div>
              <Link to="/editor" className="digests__new-link">
                + Create Digest
              </Link>
            </React.Fragment>
          ) : (
            <div className="digests__list">
              <p>
                <em>You do not have any digests yet.</em>
              </p>
              <p>
                <Link to="/editor">Go here to create one!</Link>
              </p>
            </div>
          )}
        </div>
      </Layout>
    )
  }
}
