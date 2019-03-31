import firebase from "firebase/app"
import "firebase/auth"

firebase.initializeApp({
  apiKey: "AIzaSyCXeI6rDIALP2E7oWoEGcyf9KOAVEkYWgU",
  authDomain: "digest-728bc.firebaseapp.com",
  databaseURL: "https://digest-728bc.firebaseio.com",
  projectId: "digest-728bc",
  storageBucket: "digest-728bc.appspot.com",
  messagingSenderId: "167395521438"
})

// Session cookies are managed by our server side, so we do not need firebase
// to manage auth persistence.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)

export default firebase
