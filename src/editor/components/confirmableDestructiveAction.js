import React from "react"
import { DestructiveButton } from "./button"

export default class ConfirmDestructiveAction extends React.Component {
  state = {
    confirming: false
  }

  propTypes = {
    actionLabel: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string.isRequired,
    cancelLabel: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  }

  render() {
    const { confirming } = this.state
    const {
      actionLabel,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel
    } = this.props

    if (confirming) {
      return (
        <React.Fragment>
          <DestructiveButton onClick={onConfirm}>
            {confirmLabel}
          </DestructiveButton>
          <Button onClick={onCancel}>{cancelLabel}</Button>
        </React.Fragment>
      )
    }

    return (
      <DestructiveButton onClick={() => this.setState({ confirming: true })}>
        {actionLabel}
      </DestructiveButton>
    )
  }
}
