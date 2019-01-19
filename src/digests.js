const uuid = require('node-uuid')
const db = require("./database")

const createDigest = async payload => {
  const { title, subreddits, days, time } = payload

  const newDigest = {
    id: uuid.v4(),
    title,
    subreddits,
    days,
    time
  }

  const storedDigests = await db.read("digests", [])

  await db.write("digests", [...storedDigests, newDigest])

  return newDigest
}

const getDigest = async id => {
  const data = await db.read("digests", [])
  let matchingDigest = null

  for (const digest of data) {
    if (digest.id === id) {
      matchingDigest = digest
    }
  }

  return matchingDigest
}

const getAllDigests = async () => {
  return await db.read("digests", [])
}

const extractIdFromString = input => {
  const pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
  const result = input.match(pattern)

  return !result ? null : result[0]
}

const subscribeToDigest = async (digestId, subscriber) => {
  const storedDigests = await db.read("digests", [])

  const updatedDigests = storedDigests.map(digest => {
    if (digest.id !== digestId) {
      return digest
    }

    return {
      ...digest,
      subscribers:
        digest.subscribers && digest.subscribers.includes(subscriber)
          ? digest.subscribers
          : [...(digest.subscribers || []), subscriber]
    }
  })

  await db.write("digests", updatedDigests)
}

module.exports = { createDigest, getDigest, getAllDigests, extractIdFromString, subscribeToDigest }
