#! /usr/bin/env node

const axios = require("axios")
const _ = require("lodash/fp")
const { logger } = require("./log")

const log = (...args) => {
  logger.log("[Reddit]", ...args)
}

const fetchPosts = async subreddits => {
  log("Fetching posts from subreddits", subreddits)

  return new Promise(resolve => {
    const requests = subreddits.map(subreddit => {
      const url = `https://www.reddit.com/r/${subreddit}/top.json`
      return axios(url, {
        params: { t: "day" }
      }).catch(error => {
        console.error("reddit.fetchPosts", subreddit, error)
        return Promise.resolve(null)
      })
    })

    Promise.all(requests).then(responses =>
      resolve(
        _.pipe(
          _.flatten,
          _.compact,
          _.map(_.get("data.data.children")),
          _.flatten,
          _.map(
            _.pipe(
              _.get("data"),
              _.pick([
                "title",
                "url",
                "permalink",
                "ups",
                "downs",
                "author",
                "created",
                "subreddit",
                "subreddit_id"
              ])
            )
          ),
          _.sortBy(_.get("ups")),
          _.reverse
        )(responses)
      )
    )
  })
}

module.exports = { fetchPosts }
