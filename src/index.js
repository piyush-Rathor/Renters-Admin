import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as StoreProvider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import 'react-grid-layout-builder/dist/public/css/react-grid-layout-with-builder.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import theme from './constants/theme'
import store from './store'

import AppContainer from './routes'
import Prompt from './components/Prompt'

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer />

      <StoreProvider store={store}>
        <AppContainer />
      </StoreProvider>
      <Prompt />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
