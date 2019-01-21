#! /usr/bin/env node

require("dotenv").config()

const process = require("process")
const express = require("express")
const cors = require("cors")
const moment = require("moment")
const bodyParser = require("body-parser")
const telegram = require("./telegram")
const reddit = require("./reddit")
const { requestLogger, logger } = require("./log")
const firebase = require("./firebase")

const env = process.env

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)

app.use(express.static(__dirname + "/editor/dist"))

app.post("/api/telegram", (req, res) => {
  telegram.onUpdate(req.body).then(() => {
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

const listener = app.listen(parseInt(env.PORT), () => {
  // eslint-disable-next-line
  console.log(
    `Reddit Digest fetcher listening http://localhost:${
      listener.address().port
    }`
  )
})
