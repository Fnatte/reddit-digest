var admin = require("firebase-admin")

var serviceAccount = require("../firebaseServiceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reddit-digests.firebaseio.com"
})

admin.firestore().settings({
  timestampsInSnapshots: true
})

const db = admin.firestore()

module.exports = {
  getAllDigests: async () => {
    const snapshot = await db.collection("digests").get()

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  },
  getDigest: async id => {
    if (!id) return null

    const query = await db
      .collection("digests")
      .doc(id)
      .get()

    return query.exists ? query.data() : null
  },
  createDigest: async payload => {
    const docRef = await db.collection("digests").add(payload)

    return { id: docRef.id }
  },

  getAllTelegramUpdates: async () => {
    const snapshot = await db.collection("telegram_updates").get()

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  },
  telegramUpdateExists: async updateId => {
    const query = await db
      .collection("telegram_updates")
      .where("update_id", "==", updateId)
      .limit(1)
      .get()

    return Boolean(query.docs.length)
  },
  storeTelegramUpdate: async (updateId, message) => {
    const docRef = await db.collection("telegram_updates").add({ updateId, message })

    return { id: docRef.id }
  },
}
