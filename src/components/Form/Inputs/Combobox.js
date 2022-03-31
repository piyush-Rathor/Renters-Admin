import React from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

export default function Combobox({ value = [], options = [], onChange, ...rest }) {
  const { variant, label, placeholder, error, helperText, required, ...props } = rest

  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={option => (props.freeSolo ? option : option.label)}
      renderInput={params => (
        <TextField {...params} {...{ variant, label, placeholder, error, helperText, required }} />
      )}
      value={props.freeSolo ? value : options.filter(v => value.includes(v.value))}
      onChange={(evt, val) => onChange(val.map(v => (props.freeSolo ? v : v.value)))}
      ChipProps={{ size: 'small' }}
      {...props}
    />
  )
}
