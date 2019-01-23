import React from "react"
import TelegramLogin from "./telegramLogin"
import "./landing.styl"

const onLogin = response => {
  console.log(response)
}

const Landing = () => {
  return (
    <div className="landing-page">
      <header>
      </header>
      <main>
        <div className="content">
          <p>{'Minimize distractions while staying on top of the things you care about.'}</p>
        </div>
        <TelegramLogin
          dataOnauth={onLogin}
          botName={process.env.TELEGRAM_BOT_NAME}
        />
      </main>
    </div>
  )
}

export default Landing
