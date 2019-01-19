#! /usr/bin/env node

const axios = require("axios")
const _ = require("lodash/fp")

const subreddits = [
    "technology",
    "programming",
    "psychology"
]

const fetchPosts = async () => {
  console.log('reddit.fetchPosts')

  return new Promise((resolve, reject) => {
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
