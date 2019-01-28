import React from 'react'
import './button.styl'

export const Button = ({ children, ...otherProps }) => {
  return <button {...otherProps} className="button">{children}</button>
}

export const DestructiveButton = ({ children, ...otherProps }) => {
  return <button {...otherProps} className="button button--destructive">{children}</button>
}
