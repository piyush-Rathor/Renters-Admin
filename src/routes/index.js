import React, { Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core'
import { BrowserRouter as Router, Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom'

import Login from '../pages/Login'
import ResetPassword from '../pages/ResetPassword'
import ResetPasswordRequest from '../pages/ResetPasswordRequest'
import DashboardLayout from '../pages/_layout'

import { Loader } from '../components'

const AppRoutes = React.lazy(() => import('./app'))

const useStyles = makeStyles(theme => ({
  '@global': {
    'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    'input[type="number"]': {
      MozAppearance: 'textfield',
    },
    '.MuiPaper-root::-webkit-scrollbar, .MuiPaper-root *::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '.MuiPaper-root::-webkit-scrollbar-track, .MuiPaper-root *::-webkit-scrollbar-track': {
      background: theme.palette.background.paper,
    },
    '.MuiPaper-root::-webkit-scrollbar-thumb, .MuiPaper-root *::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: 4,
      border: '2px solid ' + theme.palette.background.paper,
    },

    '.MuiCardContent-root:last-child': {
      padding: theme.spacing(2),
    },

    '.Form-dialog .Form-actions': {
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
    },
    '.Form-dialog .MuiDialogContent-root': {
      marginBottom: 72,
    },
    '.Form-dialog .Form-actions > div': {
      padding: 0,
    },
  },
}))

export default function AppContainer() {
  useStyles()

  useEffect(() => {
    const appVersion = '100000'
    const currentAppVersion = localStorage.getItem('appVersion')
    if (appVersion !== currentAppVersion) {
      localStorage.clear()
      localStorage.setItem('appVersion', appVersion)
      window.location.reload()
    }
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <Switch>
        <Route path="/reset-password-request" exact>
          <ResetPasswordRequest />
        </Route>
        <Route path="/reset-password" exact>
          <ResetPassword />
        </Route>
        <ProtectedRoute path="/login" exact>
          <Login />
        </ProtectedRoute>
        <ProtectedRoute path="/">
          <DashboardLayout>
            <Suspense fallback={<Loader />}>
              <AppRoutes />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      </Switch>
    </Router>
  )
}

function ProtectedRoute({ children, ...rest }) {
  const { auth } = useSelector(state => state)

  let location = useLocation()
  let { from } = location.state || { from: { pathname: '/' } }

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
    if (action !== 'POP') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [action, url])

  return null
}
