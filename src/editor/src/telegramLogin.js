import React from "react"
import PropTypes from "prop-types"

class TelegramLogin extends React.Component {
  constructor(props) {
    super(props)

    this.containerRef = React.createRef()
  }

  componentDidMount() {
    const {
      botName,
      buttonSize,
      cornerRadius,
      requestAccess,
      usePic,
      dataOnauth
    } = this.props

    window.TelegramLoginWidget = {
      dataOnauth: user => dataOnauth(user)
    }

    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?4"
    script.setAttribute("data-telegram-login", botName)
    script.setAttribute("data-size", buttonSize)

    if (cornerRadius !== undefined) {
      script.setAttribute("data-radius", cornerRadius)
    }

    script.setAttribute("data-request-access", requestAccess)
    script.setAttribute("data-userpic", usePic)
    script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)")
    script.async = true

    this.containerRef.current.appendChild(script)
  }

  render() {
    return (
      <div
        className={this.props.className}
        ref={this.containerRef}
      >
        {this.props.children}
      </div>
    )
  }
}

TelegramLogin.propTypes = {
  botName: PropTypes.string.isRequired,
  dataOnauth: PropTypes.func,
  buttonSize: PropTypes.oneOf(["large", "medium", "small"]),
  cornerRadius: PropTypes.number,
  requestAccess: PropTypes.string,
  usePic: PropTypes.bool
}

TelegramLogin.defaultProps = {
  botName: "samplebot",
  dataOnauth: () => undefined,
  buttonSize: "large",
  requestAccess: "write",
  usePic: true
}

export default TelegramLogin
