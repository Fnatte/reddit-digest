const morgan = require("morgan")
const simple = require("@fvilers/simple-logger").default

module.exports = {
  requestLogger: morgan(
    ":date :method :url :status :response-time ms - :res[content-length]"
  ),
  logger: simple
}
