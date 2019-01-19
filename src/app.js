#! /usr/bin/env node

require("dotenv").config()

const process = require("process")
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const telegram = require("./telegram")
const reddit = require('./reddit')
const digests = require('./digests')
const { requestLogger } = require("./log")

const env = process.env

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)

app.use(express.static(__dirname + "/editor/dist"))

app.post("/api/telegram", (req, res) => {
  telegram.onUpdate(req.body).then(() => {
    return res.send("hello")
  })
})

app.get("/api/digest", async (req, res) => {
  return res.send(await digests.getAllDigests())
})

app.post("/api/digest", async (req, res) => {
  return res.send(await digests.createDigest(req.body))
})

app.get("/api/marshall_digests", async (req, res) => {
  const storedDigests = await digests.getAllDigests()

  await Promise.all(
    storedDigests.map(async digest => {
      const posts = await reddit.fetchPosts()
      return telegram.sendDigest(posts.slice(1, 10), digest.subscribers[0])
    })
  )

  return res.send('done')
});

app.get("/api/digest/:id", async (req, res) => {
  const digest = await digests.getDigest(req.params.id)

  if (!digest) {
    return res.sendStatus(404)
  }

  return res.send(digest)
})

const listener = app.listen(parseInt(env.PORT), () => {
  // eslint-disable-next-line
  console.log(
    `Reddit Digest fetcher listening http://localhost:${
      listener.address().port
    }`
  )
})
