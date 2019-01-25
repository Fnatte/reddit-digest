import React from "react"
import './switch.styl'

const Switch = () => {
  return (
    <div className="switch">
      <input type="checkbox" className="switch__input" />
      <div className="switch__visual">
        <div className="switch__visual-track" />
        <div className="switch__visual-knob" />
      </div>
    </div>
  )
}

export default Switch
