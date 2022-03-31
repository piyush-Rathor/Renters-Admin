import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  AppBar,
  Box,
  makeStyles,
  Container,
  Toolbar,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Typography,
  Tooltip,
} from '@material-ui/core'

import Icons from '../constants/icons'
import { getSidebarLinks, getSidebarFooterLinks } from '../constants'

import { logout } from '../store/reducers/auth'
import { Logo, Icon, Avatar, Button } from '../components'

const DRAWER_WIDTH = 252
const DRAWER_MINI_WIDTH = 72
const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuIcon: {
    overflow: 'hidden',
    transition: theme.transitions.create(['width', 'padding'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawerMini: {
    width: DRAWER_MINI_WIDTH,
    flexShrink: 0,
    overflowX: 'hidden',
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  activeListItem: {
    background: theme.palette.action.selected,
    pointerEvents: 'none',
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },

  tooltip: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.getContrastText(theme.palette.background.paper),
    boxShadow: theme.shadows[1],
  },
  tooltipArrow: {
    color: theme.palette.background.paper,
  },
}))

function DashboardLayout({ children }) {
  const { pathname } = useLocation()
  const classes = useStyles()

  const {
    app: { showProcessIndicator },
    auth: { user },
  } = useSelector(state => state)
  const dispatch = useDispatch()

  const [isCollapsed, setIsCollapsed] = React.useState(window.innerWidth < 1600)

  const handleLogOut = () => dispatch(logout())

  const containerMaxWidth = pathname === '/' ? 'xl' : 'lg'
  return (
    <Box display="flex">
      <AppBar
        className={clsx({ [classes.appBar]: isCollapsed, [classes.appBarShift]: !isCollapsed })}
        elevation={1}
        color="inherit">
        <Box display="flex">
          <Box
            display="flex"
            alignItems="center"
            className={classes.menuIcon}
            pl={isCollapsed ? 0.5 : 0}
            width={isCollapsed ? DRAWER_MINI_WIDTH : 0}>
            <Button icon={Icons.menu} size="medium" onClick={() => setIsCollapsed(false)} />
          </Box>
          <Box flexGrow={1}>
            <Container maxWidth={containerMaxWidth}>
              <Toolbar disableGutters>
                <Box height={48} mr={2}>
                  <Logo />
                </Box>
                <Box display="flex" alignItems="flex-end" alignSelf="stretch">
                  <Typography variant="caption" gutterBottom>
                    Admin Panel
                  </Typography>
                </Box>
                <Box flexGrow={1} />

                <Tooltip
                  arrow
                  title={
                    <Box minWidth={180}>
                      <Box p={0.5}>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {user.role}
                        </Typography>
                      </Box>
                      <Button size="small" color="error" variant="text" onClick={handleLogOut} fullWidth>
                        Logout
                      </Button>
                    </Box>
                  }
                  classes={{ tooltip: classes.tooltip, arrow: classes.tooltipArrow }}
                  interactive
                  placement="bottom-end">
                  <Avatar />
                </Tooltip>
              </Toolbar>
            </Container>
          </Box>
        </Box>
        {showProcessIndicator && <LinearProgress />}
      </AppBar>

      <Drawer
        variant="permanent"
        anchor="left"
        className={clsx({ [classes.drawerMini]: isCollapsed, [classes.drawer]: !isCollapsed })}
        classes={{
          paper: clsx({ [classes.drawerMini]: isCollapsed, [classes.drawer]: !isCollapsed }),
        }}>
        <Toolbar disableGutters>
          <Box flexGrow={1} />
          <Button icon={Icons.menuClose} size="medium" onClick={() => setIsCollapsed(true)} />
          <Box p={0.5} />
        </Toolbar>

        {getSidebarLinks(user.permissions)
          .filter(i => i.length)
          .map((links, idx) => (
            <React.Fragment key={'sidebarLinks' + idx}>
              <Divider style={{ marginBottom: !idx && 16 }} />
              <NavList items={links} />
            </React.Fragment>
          ))}

        <Box flexGrow={1} />
        <Divider />
        <NavList items={getSidebarFooterLinks(user.permissions)} />
      </Drawer>

      <Box flexGrow={1} minHeight="calc(100vh + 1px)" pb={8}>
        <Toolbar />
        <Box pt={3}>
          <Container maxWidth={containerMaxWidth}>{children}</Container>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout

const NavList = ({ items }) => {
  const classes = useStyles()

  if (!Array.isArray(items)) return null
  return (
    <List>
      {items.map(i => (
        <ListItem
          key={i.label}
          component={NavLink}
          to={{ pathname: i.pathname }}
          exact
          activeClassName={classes.activeListItem}
          title={i.label}
          button>
          <ListItemIcon>
            <Icon path={i.icon} color={i.color} />
          </ListItemIcon>
          <ListItemText primary={i.label} className={classes.noWrap} />
        </ListItem>
      ))}
    </List>
  )
}
NavList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
      pathname: PropTypes.string.isRequired,
    })
  ).isRequired,
}
