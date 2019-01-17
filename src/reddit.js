#! /usr/bin/env node

const axios = require("axios")
const _ = require("lodash/fp")

const subreddits = [
    "technology",
    "programming",
    "psychology"
]

const fetchPosts = async () => {
  let responses;

  responses = await Promise.all(
      subreddits.map(sr => {
        const url = `https://www.reddit.com/r/${sr}/top.json`
        const params = { t: 'day' }

        return axios(url, { params })
      })
  )

  return _.pipe(
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
}

module.exports = { fetchPosts }
