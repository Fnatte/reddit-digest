#! /usr/bin/env node

require('dotenv').config()

const process = require('process')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')
const uuid = require('node-uuid')
const database = require('./database')
const reddit = require('./reddit')
const telegram = require('./telegram')
const time = require('./time')

const env = process.env

const app = express()
app.use(cors())
app.use(bodyParser.json())

const formatPostRow = post => `*${formatUpvotes(post.ups)} in /r/${post.subreddit}* _${formatDate(post)}_\n[${post.title}](${post.url})`
const formatTelegramDigest = posts => {
  return posts.reduce((result, post) => `${result}${formatPostRow(post)}\n\n`, '')
};
const formatUpvotes = votes => {
  return votes >= 1000 ? `${(votes / 1000).toFixed(1)}k upvotes` : `${votes} upvotes`
}
const formatDate = post => {
  return `${moment().diff(moment(post.created * 1000), 'hour')} hours ago`
}

app.use(express.static(__dirname + '/editor/dist'))

app.post('/api/telegram/input', (req, res) => {
  telegram.onUpdate(req.body)
    .then(() => {
      return res.send('hello')
    })
});

app.get('/api/digest', (req, res) => {
  database.read('digests').then(digests => res.send(digests))
})

app.post('/api/digest', (req, res) => {
  const id = uuid.v4()
  const { title, subreddits, days, time } = req.body

  const newDigest = {
    id: uuid.v4(),
    title,
    subreddits,
    days,
    time
  }

  database.read('digests')
    .then(storedDigests => {
      database.write('digests', [...storedDigests, newDigest]) 

      return res.send(newDigest)
    })
})

app.get('/api/digest/:id', (req, res) => {
  database.read('digests')
    .then(digests => {
      const matching = digests.filter(digest => digest.id === req.params.id)

      if (matching.length === 0) {
        return res.sendStatus(404)
      }

      return res.send(matching[0])
    })
})

const listener = app.listen(parseInt(env.PORT), () => {
  console.log(`Reddit Digest fetcher listening http://localhost:${listener.address().port}`)
})
