import React from 'react'
import { InputAdornment, useTheme } from '@material-ui/core'
import { TimePicker } from '@material-ui/pickers'
import { mdiClock } from '@mdi/js'

import { Icon } from '../../../components'

const TimeInput = ({ type, value, onChange, onBlur, variant, ...props }) => {
  const theme = useTheme()

  props.format = 'hh:mma'
  if (props.views) {
    props.format = props.views
      .map(v => {
        if (v === 'hours') return 'hh'
        if (v === 'minutes') return 'mm'
        return null
      })
      .filter(Boolean)
      .join('/')
  }
  if (variant) props.inputVariant = variant

  return (
    <TimePicker
      {...props}
      value={value ? value : null}
      onChange={date => {
        if (!value) onBlur()
        onChange(date ? +date : '')
      }}
      InputLabelProps={{ shrink: !!value }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Icon path={mdiClock} color={theme.palette.text.secondary} />
          </InputAdornment>
        ),
      }}
      clearable
      fullWidth
    />
  )
}

export default TimeInput

// API ref. - https://material-ui-pickers.dev/api/TimePicker
