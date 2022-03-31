import React from 'react'
import PropTypes from 'prop-types'
import {
  FormControlLabel,
  Checkbox as MuiCheckbox,
  FormControl,
  FormGroup,
  FormHelperText,
} from '@material-ui/core'

const Checkbox = ({ onChange, value, label, errorMessage, required, ...props }) => {
  return (
    <FormControl component="fieldset" required={required} error={!!errorMessage} fullWidth>
      <FormGroup>
        <FormControlLabel
          control={
            <MuiCheckbox
              color="primary"
              {...props}
              checked={value}
              onChange={e => onChange && onChange(e.target.checked)}
            />
          }
          label={label}
        />
      </FormGroup>
      <FormHelperText>{errorMessage}</FormHelperText>
    </FormControl>
  )
}

Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
}

export default Checkbox
