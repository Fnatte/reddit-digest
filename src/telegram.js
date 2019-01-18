const axios = require('axios')

const TOKEN = process.env.TOKEN

const prefixUrl = method => `https://api.telegram.org/bot${TOKEN}/${method}`

const executeCommand = (command, payload = {}) => {
  return axios(prefixUrl(command), { params: payload })
    .then(res => res.data)
    .catch(error => error.response.data)
}

module.exports = {
  onUpdate: body => {
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
          telegram.sendMessage({
            chat_id: update.chat.id,
            text: `I couldn't fetch posts from Reddit right now. Try again in a short while.`
          })
        })
      }
    }

    return Promise.resolve()
  },
  sendMessage: payload => executeCommand('sendMessage', payload),
  getMe: () => executeCommand('getMe')
}
