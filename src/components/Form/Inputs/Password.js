import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { InputAdornment, TextField } from '@material-ui/core'

import Icons from '../../../constants/icons'
import { Button } from '../../index'

const Password = ({ onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      {...props}
      onChange={e => onChange(e.target.value)}
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Button
              icon={showPassword ? Icons.eye : Icons.eyeOff}
              onClick={() => setShowPassword(!showPassword)}
            />
          </InputAdornment>
        ),
      }}
      fullWidth
    />
  )
}

Password.propTypes = {
  label: PropTypes.string.isRequired,
}

export default Password
