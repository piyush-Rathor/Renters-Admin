import React from 'react'
import NumberFormat from 'react-number-format'

const CurrencyInput = ({ inputRef, onChange, ...props }) => {
  return (
    <NumberFormat
      {...props}
      getInputRef={inputRef}
      onValueChange={({ value }) =>
        onChange({
          target: { value: value },
        })
      }
      prefix="AED "
      suffix="/-"
      allowNegative
    />
  )
}

export default CurrencyInput
