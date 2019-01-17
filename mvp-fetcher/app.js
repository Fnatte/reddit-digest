#! /usr/bin/env node

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')
const reddit = require('./reddit')
const telegram = require('./telegram')
const time = require('./time')

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

app.post('/', (req, res) => {
  const updateId = req.body.update_id
  const update = req.body.message

  switch(update.text) {
    case '/digest': {
      reddit.fetchPosts().then(posts => posts.slice(1, 10)).then(posts => {
        telegram.sendMessage({
          chat_id: update.chat.id,
          parse_mode: 'markdown',
          disable_web_page_preview: true,
          text: `*Reddit Digest ${moment().format('YYYY-MM-DD')}*\n\n${formatTelegramDigest(posts)}`
        })
      })
      .catch(error => {
        console.error(error)

        telegram.sendMessage({
          chat_id: update.chat.id,
          text: `I couldn't fetch posts from Reddit right now. Try again in a short while.`
        })
      })
    }
  }

  return res.send('hello')
});

app.listen(8888, () => {
  console.log('Reddit Digest fetcher listening http://localhost:8888')
})
