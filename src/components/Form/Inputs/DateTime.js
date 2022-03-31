import React from 'react'
import { InputAdornment, useTheme } from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'
import { mdiClock } from '@mdi/js'

import { Icon } from '../../../components'

const DateTimeInput = ({ type, value, onChange, onBlur, variant, ...props }) => {
  const theme = useTheme()

  props.format = 'dd/MMM/yyyy hh:mma'
  if (props.views) {
    props.format = props.views
      .map(v => {
        if (v === 'year') return 'yyyy'
        if (v === 'month') return 'MMM'
        if (v === 'date') return 'dd'
        if (v === 'hours') return 'hh'
        if (v === 'minutes') return 'mm'
        return null
      })
      .filter(Boolean)
      .join('/')
  }
  if (variant) props.inputVariant = variant

  return (
    <DateTimePicker
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

export default DateTimeInput

// API ref. - https://material-ui-pickers.dev/api/DateTimePicker
