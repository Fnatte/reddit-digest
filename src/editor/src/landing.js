import React from "react"
import TelegramLogin from './telegramLogin'

const onLogin = response => {
  console.log(response)
}

console.log(process.env.NODE_ENV)

const Landing = () => {
  return (
    <div className="landing-page">
      <header>
        <h1>Create a custom Reddit&nbsp;Digest</h1>
      </header>
      <main>
      <TelegramLogin dataOnauth={onLogin} botName="devredditdigest_bot" />
      </main>
    </div>
  )
}

export default Landing
