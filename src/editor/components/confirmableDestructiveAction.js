import React from "react"
import PropTypes from "prop-types"
import { Button, DestructiveButton } from "./button"
import "./confirmableDestructiveAction.styl"

export default class ConfirmableDestructiveAction extends React.Component {
  state = {
    confirming: false
  }

  static propTypes = {
    actionLabel: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string.isRequired,
    cancelLabel: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  }

  onCancel = () => {
    this.setState({ confirming: false })
    this.props.onCancel()
  }

  render() {
    const { confirming } = this.state
    const { actionLabel, confirmLabel, cancelLabel, onConfirm } = this.props

    return (
      <div className="confirmable-destructive-action">
        {confirming ? (
          <React.Fragment>
            <DestructiveButton onClick={onConfirm}>
              {confirmLabel}
            </DestructiveButton>
            <Button onClick={this.onCancel}>{cancelLabel}</Button>
          </React.Fragment>
        ) : (
          <DestructiveButton
            onClick={() => this.setState({ confirming: true })}
          >
            {actionLabel}
          </DestructiveButton>
        )}
      </div>
    )
  }
}
