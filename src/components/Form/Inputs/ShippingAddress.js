import React, { useState } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  InputAdornment,
  TextField,
  useTheme,
} from '@material-ui/core'
import { mdiMapMarker } from '@mdi/js'

import addressConfig from './address.config'

import Form from '../index'
import { Icon } from '../../../components'
import shippingAddressConfig from "./shippingAdress.config";

const ShippingAddressInput = ({ inputRef, onChange, onBlur, value, ...props }) => {
  const theme = useTheme()

  const [showDialog, setShowDialog] = useState(false)
  const openDialog = () => {
    setShowDialog(true)
  }
  const closeDialog = values => {
    setShowDialog(false)
    onBlur && onBlur()
    if (values) {
      const { map, ...address } = values
      onChange(address)
    }
  }

  const _value = getShippingAddressString(value)

  if (!props.disabled) props.onClick = openDialog
  return (
    <>
      <TextField
        {...props}
        value={_value}
        InputLabelProps={{ shrink: !!_value }}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Icon path={mdiMapMarker} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      <Dialog open={showDialog} onClose={() => closeDialog({})} keepMounted={false}>
        <DialogContent>
          <DialogContentText>Address</DialogContentText>
          <Box>
            <Form
              formConfig={shippingAddressConfig}
              incomingValue={{ ...value, map: value }}
              submitHandler={closeDialog}
              cancelHandler={() => closeDialog()}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShippingAddressInput

export const getShippingAddressString = value =>
  [
    'name',
    'cityCode',
    'contactNumber',
    'addressType',
    'flatNumber',
    'floorNumber',
    'buildingNumber',
    'line1',
    'line2',
    'city',
    'area',
    'state',
    'country',
    'PIN',
  ]
    .map(k => value && value[k])
    .filter(Boolean)
    .join(', ')
