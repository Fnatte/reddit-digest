const morgan = require("morgan")
const simple = require('@fvilers/simple-logger').default;

module.exports = {
  requestLogger: morgan("tiny"),
  logger: simple
}
