import React from "react"
import axios from 'axios'
import process from 'process'
import TelegramLogin from "./telegramLogin"
import "./landing.styl"
import Layout from './layout'

const onLogin = response => {
  axios.post('/api/auth/telegram', response)
    .then(() => {
      window.mixpanel.track('Login')
      window.location = '/editor'
    })
}

const Landing = () => {
  return (
    <Layout withoutHeader>
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
    </Layout>
  )
}

export default Landing
