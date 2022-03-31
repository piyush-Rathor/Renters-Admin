import React from 'react'
import { InputAdornment, useTheme } from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers'
import { mdiCalendar } from '@mdi/js'

import { Icon } from '../../../components'

const DateInput = ({ type, value, onChange, onBlur, variant, ...props }) => {
  const theme = useTheme()

  props.format = 'dd/MMM/yyyy'
  if (props.views) {
    props.format = props.views
      .map(v => {
        if (v === 'year') return 'yyyy'
        if (v === 'month') return 'MMM'
        if (v === 'date') return 'dd'
        return null
      })
      .filter(Boolean)
      .join('/')
  }
  if (variant) props.inputVariant = variant

  return (
    <DatePicker
      {...props}
      value={value ? value : null}
      onChange={date => {
        if (!value) onBlur()
        onChange(date ? new Date(date).toISOString() : '')
      }}
      InputLabelProps={{ shrink: !!value }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Icon path={mdiCalendar} color={theme.palette.text.secondary} />
          </InputAdornment>
        ),
      }}
      clearable
      fullWidth
    />
  )
}

export default DateInput

// API ref. - https://material-ui-pickers.dev/api/DatePicker
