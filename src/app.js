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
const axios = require("axios")
const cookieParser = require("cookie-parser")
const telegram = require("./telegram")
const reddit = require("./reddit")
const { requestLogger, logger } = require("./log")
const { formatToHtml } = require("./format/html")
const { sendMail } = require("./output/mail")
const firebase = require("./firebase")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)
app.use(compression())
app.use(cookieParser())

const notifyAnton = async data => {
  await axios.post("https://pi.antn.se/notify/telegram", {
    message: data
  })
}

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

  res.cookie("digest-token", jwt.sign({ user }, process.env.JWT_KEY), {
    httpOnly: true
  })

  return res.send(user)
})

app.post("/api/auth/firebase", async (req, res) => {
  const accessToken =
    req.body.stsTokenManager && req.body.stsTokenManager.accessToken
  const decodedToken = await firebase.auth.verifyIdToken(accessToken)

  if (!decodedToken) {
    return res.sendStatus(400)
  }

  const userPayload = _.pick([
    "uid",
    "auth_time",
    "name",
    "email",
    "email_verified",
    "picture"
  ])(decodedToken)
  const user = await firebase.getUser(userPayload)
  if (!user) {
    await firebase.storeUser(userPayload)
  }

  res.cookie("digest-token", jwt.sign({ user }, process.env.JWT_KEY), {
    httpOnly: true
  })

  return res.sendStatus(200)
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

  if (req.user.telegram_id) {
    telegram.sendMessage({
      chat_id: req.user.telegram_id,
      text: `Nice. I'll start sending you "${
        digest.title
      }" according to the schedule.`
    })
  }

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

  if (!digest || digest.creator !== user.telegram_id) {
    return res.sendStatus(404)
  }

  await firebase.deleteDigest(req.params.id)

  return res.status(204).send(digest)
})

app.get("/api/marshall_digests", async (req, res) => {
  const storedDigests = await firebase.getAllDigests()
  let marshalledDigests = []

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

        if (!shouldRunToday || !shouldRunThisHour) {
          logger.log(`Digest #${digest.id} should not run at this moment`)
          return Promise.resolve()
        }

        marshalledDigests = [...marshalledDigests, digest]

        let posts = await reddit.fetchPosts(digest.subreddits)

        if (posts.length > 0) {
          return Promise.all(
            digest.subscribers.map(subscriber =>
              (async () => {
                const user = await firebase.getUser({ uid: subscriber })
                const body = await sendMail({
                  to: user.email,
                  from:
                    "Digest <postmaster@sandbox65f4aae711784127b0bbaecede85b2f2.mailgun.org>",
                  subject: "Your digest",
                  html: formatToHtml(digest, posts.slice(0, 10))
                })

                return body
              })()
            )
          )
        }

        return Promise.resolve()
      })
    )
  } catch (error) {
    logger.error(error)

    /*
    await notifyAnton(
      "Something went wrong when marshalling digests" +
        "\n" +
        JSON.stringify(error, null, 2)
    )
    */
  }

  logger.log(
    "Marshalled the following digests successfully:" +
      "\n" +
      JSON.stringify(marshalledDigests, null, 2)
  )

  /*
  await notifyAnton(
    "Marshalled the following digests successfully:" +
      "\n" +
      JSON.stringify(marshalledDigests, null, 2)
  )
  */

  return res.send({ status: "done", marshalledDigests })
})

app.all("/api/*", (req, res) => res.sendStatus(404))

app.get("/*", express.static(path.join(__dirname, "../dist/")))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname, "../dist/")))

if (process.env.NODE_ENV === "production") {
  app.listen(process.env.PORT, () => {
    logger.log("Reddit Digest running with Production Build")
  })
} else {
  const options = {
    key: fs.readFileSync(path.resolve(`ssl/${process.env.DOMAIN}.key`)),
    cert: fs.readFileSync(path.resolve(`ssl/${process.env.DOMAIN}.crt`))
  }
  const server = https
    .createServer(options, app)
    .listen(process.env.PORT, () => {
      logger.log(
        `Reddit Digest listening https://${process.env.DOMAIN}:${
          server.address().port
        }`
      )
    })
}
