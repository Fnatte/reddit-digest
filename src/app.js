#! /usr/bin/env node

const path = require("path")
const fs = require("fs")
const express = require("express")
const https = require("https")
const cors = require("cors")
const moment = require("moment")
const bodyParser = require("body-parser")
const emoji = require("node-emoji")
const compression = require('compression')
const telegram = require("./telegram")
const reddit = require("./reddit")
const { requestLogger, logger } = require("./log")
const firebase = require("./firebase")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)
app.use(compression())

app.post("/api/auth/telegram", async (req, res) => {
  await firebase.storeUser(req.body)

  await telegram.sendMessage({
    chat_id: req.body.id,
    text: `Hey, lets get this party started! ${emoji.get("dancer")}`
  })

  return res.send(200)
})

app.post("/api/telegram", async (req, res) => {
  await telegram.onUpdate(req.body).then(() => {
    return res.sendStatus(200)
  })
})

app.get("/api/telegram", async (req, res) => {
  return res.send(await firebase.getAllTelegramUpdates())
})

app.get("/api/digest", async (req, res) => {
  return res.send(await firebase.getAllDigests())
})

app.post("/api/digest", async (req, res) => {
  return res.send(await firebase.createDigest(req.body))
})

app.get("/api/digest/:id", async (req, res) => {
  const digest = await firebase.getDigest(req.params.id)

  if (!digest) {
    return res.sendStatus(404)
  }

  return res.send(digest)
})

app.post("/api/digest/:id", async (req, res) => {
  await firebase.updateDigest(req.params.id, req.body)

  return res.send(req.body)
})

app.get("/api/marshall_digests", async (req, res) => {
  const storedDigests = await firebase.getAllDigests()

  await Promise.all(
    storedDigests.map(async digest => {
      const shiftedDayNumber = digest.days >>> (7 - moment().isoWeekday())
      const shouldRunToday = Boolean(shiftedDayNumber % 2)
      const shouldRunThisHour = digest.time === moment().hour()

      if (!shouldRunToday || !shouldRunThisHour) {
        logger.log(`Digest ${digest.id} should not run at this moment`)
        return Promise.resolve()
      }

      let posts = await reddit.fetchPosts(
        digest.subreddits.split(",").map(sr => sr.trim())
      )

      return Promise.all(
        digest.subscribers.map(subscriber => {
          return telegram.sendDigest(posts.slice(1, 10), subscriber)
        })
      )
    })
  )

  return res.send("done")
})

app.get("/*", express.static(path.join(__dirname, "../dist/")))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname, "../dist/")))

if (process.env.NODE_ENV === "production") {
  app.listen(process.env.PORT, () => {
    console.log("Reddit Digest running with Production Build")
  })
} else {
  const options = {
    key: fs.readFileSync(path.resolve("ssl/key.pem")),
    cert: fs.readFileSync(path.resolve("ssl/cert.pem"))
  }
  const server = https.createServer(options, app).listen(443, () => {
    console.log(
      `Reddit Digest listening https://${process.env.DOMAIN}:${
        server.address().port
      }`
    )
  })
}
