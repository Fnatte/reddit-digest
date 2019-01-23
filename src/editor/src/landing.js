import React from "react"
import TelegramLogin from './telegramLogin'

const onLogin = response => {
  console.log(response)
}

const Landing = () => {
  return (
    <div className="landing-page">
      <header>
        <h1>Create a custom Reddit&nbsp;Digest</h1>
      </header>
      <main>
      <TelegramLogin dataOnauth={onLogin} botName={process.env.TELEGRAM_BOT_NAME}/>
      </main>
    </div>
  )
}

export default Landing
