const mailgun = require("mailgun-js")

const mailgunClient = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

const sendMail = async ({ from, to, subject, html }) => {
  if (!to) {
    throw new Error("Can't send mail without recipient")
  }

  subject = subject || "No subject"
  html = html || "Empty message."

  const body = await mailgunClient.messages().send({ from, to, subject, html })

  return body
}

module.exports = { sendMail }
