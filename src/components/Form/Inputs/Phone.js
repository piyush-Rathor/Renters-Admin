import React from 'react'
import NumberFormat from 'react-number-format'

const PhoneInput = ({ inputRef, onChange, ...props }) => {
  return (
    <NumberFormat
      {...props}
      getInputRef={inputRef}
      onValueChange={({ value }) =>
        onChange({
          target: { value: value },
        })
      }
      format="+971 ## ### #####"
      mask="_"
    />
  )
}

export default PhoneInput
