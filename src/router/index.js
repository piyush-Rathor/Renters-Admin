import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter as Router, Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom'

import AppRoutes from './app'
import Login from '../pages/Login'
import ResetPassword from '../pages/ResetPassword'
import ResetPasswordRequest from '../pages/ResetPasswordRequest'

export default function AppContainer() {
  return (
    <Router>
      <ScrollToTop />
      <Switch>
        <ProtectedRoute path="/login" exact>
          <Login />
        </ProtectedRoute>
        <Route path="/reset-password-request" exact>
          <ResetPasswordRequest />
        </Route>
        <Route path="/reset-password" exact>
          <ResetPassword />
        </Route>
        <ProtectedRoute path="/">
          <AppRoutes />
        </ProtectedRoute>
      </Switch>
    </Router>
  )
}

function ProtectedRoute({ children, ...rest }) {
  const { auth } = useSelector(state => state)

  // let location = useLocation()
  let { from } = /* location.state || */ { from: { pathname: '/' } }

  return (
    <Route
      {...rest}
      render={({ location }) => {
        const { pathname } = location
        return pathname === '/login' ? (
          auth.isLoggedIn ? (
            <Redirect to={from} />
          ) : (
            children
          )
        ) : auth.isLoggedIn ? (
          children
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: location } }} />
        )
      }}
    />
  )
}

function ScrollToTop() {
  const { url } = useLocation()
  const { action } = useHistory()

  useEffect(() => {
    if (action !== 'POP') window.scrollTo(0, 0)
  }, [action, url])

  return null
}
