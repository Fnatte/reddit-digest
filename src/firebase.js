var firebase = require("firebase-admin")

var serviceAccount = require("../firebaseServiceAccountKey.json")
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://reddit-digests.firebaseio.com"
})

firebase.firestore().settings({
  timestampsInSnapshots: true
})

const db = firebase.firestore()

const getAllDigests = async () => {
  const snapshot = await db.collection("digests").get()

  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
}

const getDigest = async id => {
  if (!id) return null

  const query = await db
    .collection("digests")
    .doc(id)
    .get()

  return query.exists ? { ...query.data(), id } : null
}

const updateDigest = async (digestId, payload) => {
  return await db.collection('digests').doc(digestId).set({
    title: payload.title,
    subreddits: payload.subreddits,
    days: payload.days,
    time: payload.time
  })
}

const createDigest = async payload => {
  const docRef = await db.collection("digests").add(payload)

  return { id: docRef.id }
}

const getAllTelegramUpdates = async () => {
  const snapshot = await db.collection("telegram_updates").get()

  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
}

const telegramUpdateExists = async updateId => {
  const query = await db
    .collection("telegram_updates")
    .where("update_id", "==", updateId)
    .limit(1)
    .get()

  return Boolean(query.docs.length)
}

const storeTelegramUpdate = async (updateId, message) => {
  const docRef = await db
    .collection("telegram_updates")
    .add({ updateId, message })

  return { id: docRef.id }
}

const getPreviousUpdateFromTelegramChat = async chatId => {
  const query = await db
    .collection("telegram_updates")
    .where("message.chat.id", "==", chatId)
    .orderBy("message.date", "desc")
    .limit(1)
    .get()

  return query.docs.length ? query.docs[0].data() : null
}

const getSubscriptionsByChat = async chatId => {
  const digests = await getAllDigests()
  return digests.reduce((acc, digest) => {
    return digest.subscribers.includes(chatId) ? [...acc, digest] : acc
  }, [])
}

const subscribeChatToDigest = async (chatId, digestTitle) => {
  const query = await db
    .collection("digests")
    .where("title", "==", digestTitle)
    .get()

    return query.docs.map(
      async doc =>
        await doc.ref.update({
          subscribers: firebase.firestore.FieldValue.arrayUnion(chatId)
        })
    )
}

const unsubscribeChatFromDigest = async (chatId, digestTitle) => {
  const query = await db
    .collection("digests")
    .where("title", "==", digestTitle)
    .get()

    return query.docs.map(
      async doc =>
        await doc.ref.update({
          subscribers: firebase.firestore.FieldValue.arrayRemove(chatId)
        })
    )
}

module.exports = {
  getDigest,
  updateDigest,
  getAllDigests,
  createDigest,
  getAllTelegramUpdates,
  telegramUpdateExists,
  storeTelegramUpdate,
  getPreviousUpdateFromTelegramChat,
  getSubscriptionsByChat,
  subscribeChatToDigest,
  unsubscribeChatFromDigest
}
