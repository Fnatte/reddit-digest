import React from "react"
import { browserHistory } from "react-router"
import axios from "axios"
import process from "process"
import TelegramLogin from "./telegramLogin"
import "./landing.styl"
import Layout from "./layout"

class Landing extends React.Component {
  state = {
    __authorizing: false
  }

  onLogin = response => {
    this.setState({ __authorizing: true })

    axios
      .post("/api/auth/telegram", response)
      .then(() => {
        this.setState({ __authorizing: false })

        window.mixpanel.track("Login", { ...response.data })
        window.location = "/editor"
      })
      .catch(error => {
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
