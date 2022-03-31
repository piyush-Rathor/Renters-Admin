import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  ThemeProvider,
  useTheme,
  makeStyles,
  Button as MuiButton,
  IconButton as MuiIconButton,
  Avatar as MuiAvatar,
  Box,
  CircularProgress,
  Menu as MuiMenu,
  MenuItem,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  CardActionArea,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  ButtonGroup,
} from '@material-ui/core'
import MdiIcon from '@mdi/react'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'

import Icons from '../constants/icons'

const absoluteFillObject = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
}

const useStyles = makeStyles(theme => ({
  logo: {
    maxHeight: '100%',
    maxWidth: '100%',
  },

  avatar: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
  },

  button: {
    minWidth: 110,
  },
  buttonLoader: {
    ...absoluteFillObject,
  },
  smallIconButton: {
    padding: theme.spacing(0.75),
  },

  menuPaper: {
    minWidth: 240,
    maxWidth: 360,
  },
  menuPopover: {
    marginTop: theme.spacing(0.5),
  },

  status: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  notificationText: {
    overflow: 'hidden',
    whiteSpace: 'normal',
    textOverflow: 'ellipsis',
    '-webkit-line-clamp': 2,
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
  },

  toggleButton: {
    color: theme.palette.text.secondary,
  },
  activeToggleButton: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    pointerEvents: 'none',
  },
}))

export const Logo = () => {
  const classes = useStyles()
  const { palette } = useTheme()

  return (
    <img
      className={classes.logo}
      src={`/logo_${palette.type === 'light' ? 'dark' : 'light'}.png`}
      alt="logo"
    />
  )
}

const getAvatarText = (string = '', splitter = ' ') => {
  return string
    .split(splitter)
    .filter(w => typeof w === 'string' && w.length)
    .slice(0, 2)
    .map(c => c[0].toUpperCase())
    .join('')
}

export const Avatar = React.forwardRef(({ size, style, text, ...props }, ref) => {
  const classes = useStyles()

  if (size) props.style = { width: size, height: size }
  if (style) props.style = { ...props.style, ...style }

  if (text) props.children = getAvatarText(text)

  return <MuiAvatar ref={ref} classes={{ root: classes.avatar }} {...props} />
})
Avatar.propTypes = {
  size: PropTypes.number,
}

export const Icon = ({ color, ...props }) => {
  const theme = useTheme()
  const _color = color ? (theme.palette[color] ? theme.palette[color].main : color) : null

  const iconProps = { ...props }
  if (_color) iconProps.color = _color
  return <MdiIcon size={1} {...iconProps} />
}
Icon.propTypes = {
  path: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  color: PropTypes.string,
}

export const Button = ({ color = 'primary', href, routerLink, icon, avatar, ...restProps }) => {
  const { loading, onClick, containerProps, ...rest } = restProps
  const classes = useStyles()
  const theme = useTheme()
  const [processing, setProcessing] = useState(false)

  let isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const props = { ...rest }

  const { disabled } = props
  props.color = 'primary'
  props.variant = props.variant || 'contained'
  if (icon || avatar) props.variant = null
  const _loading = loading || processing
  props.disabled = disabled || _loading
  props.children = props.children || props.text
  if (onClick)
    props.onClick = async (...args) => {
      if (isMounted.current) setProcessing(true)
      try {
        await onClick(...args)
      } catch (e) {
        console.log(e.message)
      } finally {
        if (isMounted.current) setProcessing(false)
      }
    }

  const avatarProps = {}
  if (avatar)
    avatarProps.style = {
      background: theme.palette[color].main,
      color: theme.palette.getContrastText(theme.palette[color].main),
    }
  return (
    <ThemeProvider theme={t => ({ ...t, palette: { ...t.palette, primary: { ...t.palette[color] } } })}>
      <Box position="relative" display={props.fullWidth ? 'block' : 'inline-block'} {...containerProps}>
        {avatar ? (
          <MuiIconButton size="small" {...props}>
            {avatar.src ? (
              <Avatar {...avatarProps} src={avatar.src} />
            ) : avatar.text ? (
              <Avatar {...avatarProps} text={avatar.text} />
            ) : (
              <Avatar {...avatarProps} />
            )}
          </MuiIconButton>
        ) : icon ? (
          <MuiIconButton size="small" classes={{ sizeSmall: classes.smallIconButton }} {...props}>
            <Icon path={icon} />
          </MuiIconButton>
        ) : href ? (
          <MuiButton
            component={routerLink ? Link : 'a'}
            {...{ [routerLink ? 'to' : 'href']: href }}
            rel="noopener noreferrer"
            {...props}
          />
        ) : (
          <MuiButton {...props} classes={{ root: classes.button }} />
        )}

        {_loading && (
          <Box display="flex" alignItems="center" justifyContent="center" className={classes.buttonLoader}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'warning', 'success', 'error']),
  text: PropTypes.string,

  href: PropTypes.string,
  routerLink: PropTypes.bool,

  icon: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),

  avatar: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({ src: PropTypes.string, text: PropTypes.string }),
  ]),

  loading: PropTypes.bool,
  disabled: PropTypes.bool,
}

export const Menu = React.forwardRef(
  ({ items, activator, itemRenderer, noItemText, menuProps, ...props }, ref) => {
    const classes = useStyles()

    const [anchorEl, setAnchorEl] = React.useState(null)
    const handleClick = event => setAnchorEl(event.currentTarget)
    const handleClose = () => setAnchorEl(null)

    if (!props.avatar && !props.icon) props.endIcon = <Icon path={anchorEl ? mdiChevronUp : mdiChevronDown} />
    return (
      <Box ref={ref}>
        {(activator && typeof activator === 'function' && activator(handleClick, Boolean(anchorEl))) || (
          <Button {...props} onClick={handleClick} />
        )}
        <MuiMenu
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          classes={{ paper: classes.menuPaper }}
          PopoverClasses={{ root: classes.menuPopover }}
          elevation={3}
          PaperProps={{ style: { maxHeight: 640 } }}
          {...menuProps}>
          {items.length ? (
            items.map(item => (
              <MenuItem
                key={item._id || item.label}
                onClick={() => {
                  const { persistOnClick, onClick, ...rest } = item
                  if (!persistOnClick) handleClose()
                  if (onClick) onClick(rest)
                }}>
                {itemRenderer ? itemRenderer({ item }) : item.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>{noItemText || 'No option available'}</MenuItem>
          )}
        </MuiMenu>
      </Box>
    )
  }
)
Menu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      label: PropTypes.string,
      persistOnClick: PropTypes.bool,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
  activator: PropTypes.func,
  itemRenderer: PropTypes.func,
  ...Button.propTypes,
}

export const LabelWithIcon = ({ icon, label }) => {
  return (
    <Box display="inline-flex">
      {!!icon && (
        <Box mr={1} display="inline-flex" alignItems="center">
          <Icon path={icon} />
        </Box>
      )}
      <Typography variant="h6" component="h2" noWrap>
        {label}
      </Typography>
    </Box>
  )
}
LabelWithIcon.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  label: PropTypes.string.isRequired,
}

export const SectionHeader = ({ icon, label, leftComponent, rightComponent, alignItems = "flex-end" }) => {
  return (
    <Box display="flex" alignItems={alignItems} pb={2}>
      <LabelWithIcon icon={icon} label={label} />
      <Box p={1} />
      {leftComponent}
      <Box flexGrow={1} />
      {rightComponent}
    </Box>
  )
}
SectionHeader.propTypes = {
  ...LabelWithIcon.propTypes,
  leftComponent: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  rightComponent: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

export const Section = ({ icon, label, leftComponent, rightComponent, ...props }) => {
  const { cardContent, cardActions, containerProps } = props
  return (
    <Box {...(containerProps || { pt: 4 })}>
      <Card elevation={0}>
        <CardContent>
          <SectionHeader {...{ icon, label, leftComponent, rightComponent }} />
          {cardContent}
        </CardContent>
        {!!cardActions && (
          <CardActions>
            <Box flexGrow={1} />
            {cardActions}
          </CardActions>
        )}
      </Card>
    </Box>
  )
}
Section.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  actionButton: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  headerContent: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  cardContent: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  cardActions: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

const beautifyStatus = status => status.replace(/_/g, ' ').split(':')[0]
export const Status = ({ status,color='primary' }) => {
  const classes = useStyles()

  return (
    <Chip size="small" color={color} classes={{ root: classes.status }} label={beautifyStatus(status)} />
  )
}
Status.propTypes = {
  status: PropTypes.string.isRequired,
}

export const ContentCell = ({ label, content, divider, inline = true, children, containerProps }) => (
  <Box display={inline ? 'flex' : 'block'} alignItems="center" my={0.5} {...containerProps}>
    <Box mr={inline ? 1.5 : 0}>
      <Typography variant="body1" style={{ fontWeight: 500 }} noWrap>
        {label}
        {divider || (inline ? ' -' : '')}
      </Typography>
    </Box>
    {!!content && (
      <Typography variant="body1" component="span">
        {content}
      </Typography>
    )}
    {children}
  </Box>
)
ContentCell.propTypes = {
  label: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inline: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

export const NotificationCell = ({ username, team, text, addedAt, read }) => {
  const classes = useStyles()

  return (
    <Box>
      <Typography variant="body2">
        {username}, {team}
      </Typography>
      <Typography variant="body1" className={classes.notificationText}>
        {text}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {format(addedAt, 'hh:mma MMM do, yyyy')} {read && '✓'}
      </Typography>
    </Box>
  )
}

export const LinkBlock = ({ url, cardActions, containerProps, ...headerProps }) => {
  return (
    <Box mt={4} {...containerProps}>
      <Card>
        <CardActionArea component={Link} to={url}>
          <CardContent>
            <Box mb={-2}>
              <SectionHeader {...headerProps} />
            </Box>
          </CardContent>
        </CardActionArea>
        {cardActions && <CardActions>{cardActions}</CardActions>}
      </Card>
    </Box>
  )
}
LinkBlock.propTypes = {
  url: PropTypes.string.isRequired,
  ...SectionHeader.propTypes,
}

export const Loader = ({ absolute }) => {
  const theme = useTheme()

  const style = {
    ...absoluteFillObject,
    background: theme.palette.background.default,
  }
  if (!absolute) style.position = 'fixed'

  return (
    <Box display="flex" alignItems="center" justifyContent="center" style={style}>
      <CircularProgress />
    </Box>
  )
}

export const StatCard = ({ label, count }) => {
  return (
    <Card title={label}>
      <CardContent style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" style={{ flexGrow: 1 }} noWrap>
          {label}
        </Typography>
        <Typography variant="h4" align="center">
          {count}
        </Typography>
      </CardContent>
    </Card>
  )
}

export const Dialog = ({ title, buttonProps: bp, width, children, dialogProps, activator, dialogOpen = null }) => {
  const theme = useTheme()

  const [open, setOpen] = React.useState(dialogOpen?.open || false)
  const handleClose = () => { setOpen(false); dialogOpen && dialogOpen?.handleClose(false) }

  useEffect(() => {
    if(dialogOpen && dialogOpen?.open) setOpen(dialogOpen?.open)
  }, [dialogOpen])

  useEffect(() => {
    if(!open) setOpen(dialogOpen?.open)
  }, [open])

  const buttonProps = { ...bp }
  if (buttonProps.startIcon) buttonProps.startIcon = <Icon path={buttonProps.startIcon} />
  if (!buttonProps.icon && !buttonProps.startIcon) buttonProps.startIcon = <Icon path={Icons.add} />
  return (
    <Box>
      {(activator && typeof activator === 'function' && activator(() => setOpen(true))) || (
        <Button variant="outlined" size="small" onClick={() => setOpen(true)} {...buttonProps}>
          {title}
        </Button>
      )}
      <MuiDialog open={open} onClose={handleClose} maxWidth="xl" {...dialogProps}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between">
            {title}

            <Button
              size="small"
              color="error"
              icon={Icons.close}
              onClick={handleClose}
              style={{ marginTop: -8, marginRight: -8 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box width={theme.breakpoints.values[width || 'sm']}>
            {typeof children === 'function' ? children({ handleClose }) : children}
          </Box>
        </DialogContent>
      </MuiDialog>
    </Box>
  )
}
Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  buttonProps: PropTypes.object,
  width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  activator: PropTypes.func,
}

export const ToggleButtons = ({ options, value, onChange }) => {
  const classes = useStyles()

  return (
    <ButtonGroup size="small">
      {options.map(o => {
        return (
          <MuiButton
            key={o.label}
            className={clsx(classes.toggleButton, value === o.value && classes.activeToggleButton)}
            onClick={() => onChange(o.value)}>
            {o.label}
          </MuiButton>
        )
      })}
    </ButtonGroup>
  )
}
