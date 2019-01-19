const axios = require("axios")
const moment = require("moment")
const emoji = require("node-emoji")
const db = require("./database")
const { logger } = require("./log")
const digests = require("./digests")
const reddit = require("./reddit")

const TOKEN = process.env.TELEGRAM_TOKEN

const log = (...args) => {
  logger.log("[Telegram]", ...args)
}

const prefixUrl = method => `https://api.telegram.org/bot${TOKEN}/${method}`

const executeCommand = (command, payload = {}) => {
  log("executeCommand", command)
  return axios(prefixUrl(command), { params: payload }).then(res => res.data)
}

const formatPostRow = post =>
  `*${formatUpvotes(post.ups)} in /r/${post.subreddit}* _${formatDate(
    post
  )}_\n[${post.title}](${post.url})`
const formatTelegramDigest = posts => {
  return posts.reduce(
    (result, post) => `${result}${formatPostRow(post)}\n\n`,
    ""
  )
}
const formatUpvotes = votes => {
  return votes >= 1000
    ? `${(votes / 1000).toFixed(1)}k upvotes`
    : `${votes} upvotes`
}
const formatDate = post => {
  return `${moment().diff(moment(post.created * 1000), "hour")} hours ago`
}

const onUpdate = async payload => {
  const message = payload.message
  const update_id = payload.update_id

  if (!message || !message.text) {
    log("Invalid update", payload)
    return
  }

  log("Received update", update_id, message.text)

  const data = await db.read("telegram", {})

  // Don't act on updates already stored.
  if (data.updates && data.updates.includes(update_id)) {
    log(`Update ${update_id} has already been handled. Noop.`)
    return
  }

  // Store the update.
  await db.write("telegram", {
    updates: [...(data.updates || []), update_id]
  })

  switch (true) {
    case message.text.startsWith("/subscribe"): {
      const digestId = digests.extractIdFromString(message.text)
      const digest = await digests.getDigest(digestId)

      if (!digest) {
        executeCommand("sendMessage", {
          chat_id: message.chat.id,
          text: `I could not find a digest with that id ${emoji.get("pensive")}`
        })
        return
      }

      await digests.subscribeToDigest(digestId, message.chat.id)

      executeCommand("sendMessage", {
        chat_id: message.chat.id,
        text: `You are now subscribed to "Sports" ${emoji.get(
          "ok_hand"
        )}\n\nid: ${digestId}`
      })
      break
    }
    case message.text.startsWith('/unsubscribe'): {
      executeCommand('sendMessage', {
        chat_id: message.chat.id,
        text: `Unsubscribing is not yet implemented ${emoji.get('shrug')}`
      })
    }
  }
}

const sendDigest = async (posts, chatId) => {
  const text = `*Reddit Digest ${moment().format(
    "YYYY-MM-DD"
  )}*\n\n${formatTelegramDigest(posts)}`

  await executeCommand('sendMessage', {
    chat_id: chatId,
    parse_mode: 'markdown',
    disable_web_page_preview: true,
    text
  })
}

const sendMessage = payload => executeCommand("sendMessage", payload)

const getMe = () => executeCommand("getMe")

module.exports = { onUpdate, sendDigest, sendMessage, getMe }
