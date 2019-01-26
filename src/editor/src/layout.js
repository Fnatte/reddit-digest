import React from "react"
import { NavLink } from "react-router-dom"
import { default as PT } from "prop-types"
import "./layout.styl"

const Layout = ({ children, withoutHeader }) => {
  return (
    <div className="wrapper">
      {!withoutHeader && (
        <header>
          <h1>Digests</h1>
          <nav>
            <NavLink to="/digests" activeClassName="active">
              My Digests
            </NavLink>
            <NavLink to="/editor" activeClassName="active">
              Create digests
            </NavLink>
            <NavLink to="/logout" activeClassName="active">
              Logout
            </NavLink>
          </nav>
        </header>
      )}
      <div className="layout__content">{children}</div>
      <footer>
        <div>
          <span>
            Built by <a href="https://antonniklasson.se">Anton</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

Layout.propTypes = {
  withoutHeader: PT.bool
}

Layout.defaultProps = {
  withoutHeader: false
}

export default Layout
