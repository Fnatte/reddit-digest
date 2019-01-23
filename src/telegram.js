const axios = require("axios")
const moment = require("moment")
const emoji = require("node-emoji")
const db = require("./database")
const { logger } = require("./log")
const digests = require("./digests")
const firebase = require("./firebase")

const TOKEN = process.env.TELEGRAM_TOKEN

const log = (...args) => {
  logger.log("[Telegram]", ...args)
}

const prefixUrl = method => `https://api.telegram.org/bot${TOKEN}/${method}`

const executeCommand = (command, payload = {}) => {
  log("executeCommand", command)
  return axios(prefixUrl(command), { params: payload })
    .then(res => res.data)
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
}

const formatTelegramDigest = posts => {
  return posts.reduce(
    (result, post) => `${result}${formatPostRow(post)}\n\n`,
    ""
  )
}
const formatPostRow = post =>
  `<b>${formatUpvotes(post.ups)} in /r/${post.subreddit}</b> <i>${formatDate(
    post
  )}</i>\n<a href="https://www.reddit.com${post.permalink}">${post.title}</a>`
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

  log(`Received update #${update_id} from chat #${message.chat.id}`)

  const updateExists = await firebase.telegramUpdateExists(update_id)

  // Don't act on updates already stored.
  if (updateExists) {
    log(`Update #${update_id} has already been handled`)
    return
  }
  
  // Grab the previous update, and store the current one.
  const previousUpdate = await firebase.getPreviousUpdateFromTelegramChat(message.chat.id)
  await firebase.storeTelegramUpdate(update_id, message)

  switch (true) {
    case message.text.startsWith("/subscribe"): {
      const digestId = message.text.split("/subscribe")[1].trim()

      if (!digestId.length) {
        return executeCommand("sendMessage", {
          chat_id: message.chat.id,
          text: 'Subscribe with "/subscribe abc-123"\n\nGo here to create a digest: https://digest.antonniklasson.se'
        })
      }

      const digest = await firebase.getDigest(digestId)

      if (!digest) {
        executeCommand("sendMessage", {
          chat_id: message.chat.id,
          text: `I could not find a digest with that id ${emoji.get("pensive")}`
        })
        return
      }

      await firebase.subscribeChatToDigest(message.chat.id, digestId)

      executeCommand("sendMessage", {
        chat_id: message.chat.id,
        text: `You are now subscribed to "${digest.title}" ${emoji.get(
          "ok_hand"
        )}`
      })
      break
    }
    case message.text.startsWith("/unsubscribe"): {
      const subscriptions = await firebase.getSubscriptionsByChat(message.chat.id)

        if (subscriptions.length === 0) {
          await executeCommand('sendMessage', {
            chat_id: message.chat.id,
            text: `You are not subscribed to any digests ${emoji.get('unamused')} Go here to create one: https://digest.antonniklasson.se ${emoji.get('v')}`
          })
        } else {
          await executeCommand("sendMessage", {
            chat_id: message.chat.id,
            text: 'Which digest would you like to unsubscribe from?',
            reply_markup: {
              one_time_keyboard: true,
              keyboard: [
                subscriptions.map(s => s.title) 
              ]
            }
          })
        }
      break;
    }
    default: {
      if (previousUpdate && previousUpdate.message.text.startsWith('/unsubscribe')) {
        await firebase.unsubscribeChatFromDigest(message.chat.id, message.text)
        await executeCommand('sendMessage', {
          chat_id: message.chat.id,
          text: `Done ${emoji.get('white_check_mark')}`
        })
      }
      break;
    }
  }
}

const sendDigest = async (posts, chatId) => {
  const text = `<b>Reddit Digest ${moment().format(
    "YYYY-MM-DD"
  )}</b>\n\n${formatTelegramDigest(posts)}`

  await executeCommand("sendMessage", {
    chat_id: chatId,
    parse_mode: "html",
    disable_web_page_preview: true,
    text
  })
}

const sendMessage = payload => executeCommand("sendMessage", payload)

const getMe = () => executeCommand("getMe")

module.exports = { onUpdate, sendDigest, sendMessage, getMe }
