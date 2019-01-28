import React from "react"
import axios from "axios"
import process from "process"
import TelegramLogin from "../telegramLogin"
import "./landingView.styl"
import Layout from "../layout"

class Landing extends React.Component {
  state = {
    __authorizing: false
  }

  onLogin = response => {
    this.setState({ __authorizing: true })

    axios
      .post("/api/auth/telegram", response)
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

  render() {
    const { __authorizing } = this.state

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
            {__authorizing ? (
              <div>Signing in...</div>
            ) : (
              <TelegramLogin
                dataOnauth={this.onLogin}
                botName={process.env.TELEGRAM_BOT_NAME}
              />
            )}
          </main>
        </div>
      </Layout>
    )
  }
}

export default Landing
