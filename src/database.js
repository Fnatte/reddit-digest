const fs = require('fs')
const path = require('path')

const filename = db => path.resolve(`./data/db_${db}.json`)

const read = (db, defaultData = null) => {
  return new Promise((resolve, reject) => {
    const file = filename(db)

    return fs.exists(file, exists => {
      if (!exists) {
        return write(db, defaultData).then(() => resolve(defaultData))
      }

      fs.readFile(file, (error, data) => {
        if(error) {
          return reject(error)
        }

        return resolve(JSON.parse(data))
      })
    })
  });
}

const write = (db, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename(db), JSON.stringify(data), (error) => {
      if (error) {
        return reject(error)
      }

      return resolve()
    })
  })
}

module.exports = { read, write }
