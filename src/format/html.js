const _ = require("lodash/fp")
const moment = require("moment")

const formatDate = post => {
  return `${moment().diff(moment(post.created * 1000), "hour")} hours ago`
}

const formatUpvotes = votes => {
  return votes >= 1000
    ? `${(votes / 1000).toFixed(1)}k upvotes`
    : `${votes} upvotes`
}

const formatPostRow = post => {
  const meta = `<b>${formatUpvotes(post.ups)} in /r/${
    post.subreddit
  }</b> <i>${formatDate(post)}</i>`
  const title = `<a href="https://www.reddit.com${post.permalink}">${
    post.title
  }</a>`

  return `${meta}<br>${title}`
}

const formatPosts = posts => {
  return _.pipe(
    _.map(formatPostRow),
    _.join("<br><br>")
  )(posts)
}

const formatToHtml = (digest, posts) => {
  const header = `<b>Yo! Here's your digest "${digest.title}" for today:</b>`
  const content = formatPosts(posts)
  const footer = `<a href="https://digest.antonniklasson.se/editor/${
    digest.id
  }">[Edit digest]</a>`

  return `${header}<br><br>${content}<br><br>${footer}`
}

module.exports = { formatToHtml };
