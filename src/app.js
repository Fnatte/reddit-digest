#! /usr/bin/env node

const path = require("path")
const fs = require("fs")
const express = require("express")
const https = require("https")
const cors = require("cors")
const moment = require("moment")
const bodyParser = require("body-parser")
const emoji = require("node-emoji")
const compression = require("compression")
const _ = require("lodash/fp")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const telegram = require("./telegram")
const reddit = require("./reddit")
const { requestLogger, logger } = require("./log")
const firebase = require("./firebase")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)
app.use(compression())
app.use(cookieParser())

const auth = (req, res, next) => {
  const token = req.cookies["digest-token"]

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY)
    req.user = payload.user
  } catch (error) {
    return res.sendStatus(401)
  }

  return next()
}

app.get("/api/me", auth, (req, res) => {
  if (!req.user) {
    return res.sendStatus(401)
  }

  return res.send(req.user)
})

app.post("/api/auth/telegram", async (req, res) => {
  let userPayload = _.pick([
    "id",
    "auth_date",
    "first_name",
    "last_name",
    "username",
    "photo_url"
  ])(req.body)
  const integrityHash = req.body.hash
  const valid = await telegram.checkPayloadIntegrity(userPayload, integrityHash)

  if (!valid) {
    return res.sendStatus(400)
  }

  userPayload = _.mapKeys(k => (k === "id" ? "telegram_id" : k))(userPayload)

  let user = await firebase.getUser(userPayload)

  if (!user) {
    user = await firebase.storeUser(userPayload)
    await telegram.sendMessage({
      chat_id: req.body.id,
      text: `Hey, lets get this party started! ${emoji.get("dancer")}`
    })
  }

  const token = jwt.sign({ user }, process.env.JWT_KEY)
  console.log({ token })
  res.cookie("digest-token", token, { httpOnly: true })

  return res.send(user)
})

app.get("/api/auth/logout", (req, res) => {
  return res.clearCookie("digest-token").sendStatus(200)
})

app.post("/api/telegram", async (req, res) => {
  await telegram.onUpdate(req.body).then(() => {
    return res.sendStatus(200)
  })
})

app.get("/api/digest", auth, async (req, res) => {
  return res.send(await firebase.getAllDigests(req.user))
})

app.post("/api/digest", auth, async (req, res) => {
  const digest = await firebase.createDigest(req.user, req.body)

  telegram.sendMessage({
    chat_id: req.user.telegram_id,
    text: `Nice. I'll start sending you "${
      digest.title
    }" according to the schedule.`
  })

  return res.send(digest)
})

app.get("/api/digest/:id", auth, async (req, res) => {
  const digest = await firebase.getDigest(req.user, req.params.id)

  if (!digest) {
    return res.sendStatus(404)
  }

  return res.send(digest)
})

app.post("/api/digest/:id", auth, async (req, res) => {
  await firebase.updateDigest(req.params.id, req.body)

  return res.send(req.body)
})

app.delete("/api/digest/:id", auth, async (req, res) => {
  const user = req.user
  const digest = await firebase.getDigest(user, req.params.id)

  console.log({ user, digest })

  if (!digest || digest.creator !== user.telegram_id) {
    return res.sendStatus(404)
  }

  await firebase.deleteDigest(req.params.id)

  return res.status(204).send(digest)
})

app.get("/api/marshall_digests", async (req, res) => {
  const storedDigests = await firebase.getAllDigests()

  try {
    await Promise.all(
      storedDigests.map(async digest => {
        const shiftedDayNumber = digest.days >>> (7 - moment().isoWeekday())
        const shouldRunToday = Boolean(shiftedDayNumber % 2)
        const shouldRunThisHour =
          +digest.time ===
          moment()
            .utc()
            .hour()

        console.log({
          shiftedDayNumber,
          shouldRunToday,
          shouldRunThisHour,
          currentHour: moment().hour(),
          currentUTCHour: moment()
            .utc()
            .hour()
        })

        if (!shouldRunToday || !shouldRunThisHour) {
          logger.log(`Digest ${digest.id} should not run at this moment`)
          return Promise.resolve()
        }

        let posts = await reddit.fetchPosts(
          digest.subreddits.split(",").map(sr => sr.trim())
        )

        return Promise.all(
          digest.subscribers.map(subscriber => {
            return telegram.sendDigest(digest, posts.slice(1, 10), subscriber)
          })
        )
      })
    )
  } catch (error) {
    console.error(error)
  }

  return res.send("done")
})

app.all("/api/*", (req, res) => res.sendStatus(404))

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
