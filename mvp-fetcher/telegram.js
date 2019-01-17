const axios = require('axios')

const TOKEN = '757027700:AAGivV0AKmpd-q4YhtJF7NW2z9GlW_DODgQ'

/*
 * How to make requests for the bot:
 * 
 * https://api.telegram.org/bot<token>/METHOD_NAME
 *
 */

const prefixUrl = method => `https://api.telegram.org/bot${TOKEN}/${method}`
const executeCommand = (command, payload = {}) => axios(prefixUrl(command), { params: payload }).then(res => res.data).catch(error => error.response.data)

module.exports = {
  sendMessage: payload => executeCommand('sendMessage', payload),
  getMe: () => executeCommand('getMe')
}
