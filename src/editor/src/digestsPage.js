import React from "react"
import axios from "axios"
import { NavLink } from "react-router-dom"
import Layout from "./layout"
import Switch from "./switch"
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
                </div>
              ))}
            </div>
          ) : (
            <em>You haven't created any digests yet :(</em>
          )}
        </div>
      </Layout>
    )
  }
}
