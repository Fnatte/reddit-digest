import React from "react"
import axios from "axios"
import process from "process"
import TelegramLogin from "../telegramLogin"
import Login from "../login"
import "./landingView.styl"
import Layout from "../layout"
import firebase from "firebase/app"

class Landing extends React.Component {
  state = {
    __authorizing: false,
    isSignedIn: false
  }

  onLogin = user => {
    this.setState({ __authorizing: true })

    axios
      .post("/api/auth/firebase", user)
      .then(response => {
        this.setState({ __authorizing: false })

        const user = response.data

        window.mixpanel.identify(user.id)
        window.mixpanel.people.set(user)
        window.mixpanel.track("Login", user)

        this.props.history.push("/digests")
      })
      .catch(error => {
        console.log(error)
        this.setState({ __authorizing: false })
      })
  }

  componentDidMount() {
    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(user => this.setState({ isSignedIn: !!user }))
  }

  render() {
    const { __authorizing, isSignedIn } = this.state

    return (
      <Layout withoutHeader>
        <div className="landing-page">
          <header />
          <main>
            <div className="content">
              <p>
                {
                  "Minimize distractions while staying on top of the things you care about."
                }
              </p>
            </div>
            {!isSignedIn ? (
              __authorizing ? (
                <div>Signing in...</div>
              ) : (
                <Login onAuth={this.onLogin} />
              )
            ) : (
              <div>Signed in</div>
            )}
          </main>
        </div>
      </Layout>
    )
  }
}

export default Landing
