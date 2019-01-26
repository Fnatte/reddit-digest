import React from "react"
import axios from "axios"
import { NavLink, Link } from "react-router-dom"
import Layout from "./layout"
import Switch from "./switch"
import { DestructiveButton } from "./button"
import "./digestsPage.styl"

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
          digests: this.state.digests.filter(d => d.id === digest.id)
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
            <div className="digests__list">
              {digests.map(digest => (
                <div key={digest.id} className="digests__item">
                  <NavLink to={`/editor/${digest.id}`}>{digest.title}</NavLink>
                  <DestructiveButton onClick={this.deleteDigest(digest)}>
                    Delete {digest.title}
                  </DestructiveButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="digests__list">
              <p>
                <em>You haven't created any digests yet :(</em>
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
