import React from "react"
import PropTypes from "prop-types"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import firebase from "firebase/app"

class Login extends React.Component {
  constructor(props) {
    super(props);

    // Configure FirebaseUI.
    this.uiConfig = {
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: ({ user }) => {
          if (typeof this.props.onAuth === 'function') {
            this.props.onAuth(user.toJSON());
          }
        }
      }
    }
  }

  render() {
    return (
      <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
    )
  }
}

Login.propTypes = {
  onAuth: PropTypes.func
}

Login.defaultProps = {}

export default Login
