import { createMuiTheme } from '@material-ui/core/styles'

const isDev = process.env.NODE_ENV === 'development'

const theme = createMuiTheme({
  palette: {
    type: isDev ? 'dark' : 'light',
    primary: {
      main: '#738C4A',
    },
    secondary: {
      main: '#8c4a73',
    },
  },
})

export default theme
