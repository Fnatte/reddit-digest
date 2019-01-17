const fs = require('fs')
const path = require('path')

const filename = db => path.resolve(`./src/db_${db}.json`)

module.exports = {
  read: db => {
    return new Promise((resolve, reject) => {
      fs.readFile(filename(db), (error, data) => {
        if(error) {
          return reject(error)
        }

        return resolve(JSON.parse(data))
      })
    })
  },
  write: (db, data) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename(db), JSON.stringify(data), (error) => {
        if (error) {
          return reject(error)
        }

        return resolve()
      })
    })
  }
}
