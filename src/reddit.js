#! /usr/bin/env node

const axios = require("axios")
const _ = require("lodash/fp")
const { logger } = require('./log')

const log = (...args) => {
  logger.log('[Reddit]', ...args)
}

const fetchPosts = async (subreddits) => {
  log('Fetching posts', 'Subs:', subreddits)

  return new Promise((resolve) => {
    Promise.all(
      subreddits.map(sr =>
        axios(  
          `https://www.reddit.com/r/${sr}/top.json`,
          { params: { t: 'day' } }
        )
      )
    ).then(responses => {
      resolve(
        _.pipe(
          _.flatten,
          _.map(_.get('data.data.children')),
          _.flatten,
          _.map(_.pipe(
            _.get('data'),
            _.pick([
              'title',
              'url',
              'ups',
              'downs',
              'author',
              'created',
              'subreddit',
              'subreddit_id'
            ])
          )),
          _.sortBy(_.get('ups')),
          _.reverse,
        )(responses)
      )
    })
  })
}

module.exports = { fetchPosts }
