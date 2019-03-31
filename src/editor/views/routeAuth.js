import React from "react"
import { Redirect } from "react-router-dom"
import firebase from "../firebase"
import axios from "axios"

export default class RouteAuth extends React.Component {
  state = {
    __validating: true,
    authorized: false
  }

  componentDidMount() {
    this.setState({ __validating: true })

    axios("/api/me")
      .then(response => {
        mixpanel.identify(response.data.id)
        mixpanel.people.set(response.dat)
        this.setState({ __validating: false, authorized: true })
      })
      .catch(error => {
        this.setState({ __validating: false, authorized: false })
      })
  }

  render() {
    const { __validating, authorized } = this.state
    const { component: Component, ...otherProps } = this.props

    return __validating ? (
      <div>Validating credentials...</div>
    ) : authorized ? (
      <Component {...otherProps} />
    ) : (
      <Redirect to="/" />
    )
  }
}
