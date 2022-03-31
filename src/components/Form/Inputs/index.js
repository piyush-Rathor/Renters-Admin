import React from "react";
import { Box, InputAdornment, MenuItem, TextField, Typography } from "@material-ui/core";
import { mdiClose, mdiPhone } from "@mdi/js";

import { Icon } from "../../index";

import Checkbox from "./Checkbox";
import CurrencyInput from "./Currency";
import PhoneInput from "./Phone";
import DateInput from "./Date";
import TimeInput from "./Time";
import DateTimeInput from "./DateTime";
import AddressInput from "./Address";
import MapInput from "./Map";
import FileInputBox from "./File";
import Combobox from "./Combobox";
import Password from "./Password";
import ShippingAddressInput from "./ShippingAddress";
import { Autocomplete } from "@material-ui/lab";

const Inputs = {
  checkbox: Checkbox,
  currency: ({ onChange, errorMessage, ...props }) => (
    <TextField
      {...props}
      onChange={e => onChange(e.target.value)}
      error={!!errorMessage}
      helperText={errorMessage}
      InputProps={{ inputComponent: CurrencyInput }}
      fullWidth
    />
  ),
  phone: ({ onChange, errorMessage, ...props }) => (
    <TextField
      {...props}
      onChange={e => onChange(e.target.value)}
      error={!!errorMessage}
      helperText={errorMessage}
      InputProps={{
        inputComponent: PhoneInput,
        endAdornment: (
          <InputAdornment position="end">
            <Icon path={mdiPhone} />
          </InputAdornment>
        )
      }}
      fullWidth
    />
  ),
  date: ({ onChange, errorMessage, ...props }) => {
    return (
      <DateInput
        {...props}
        onChange={value => onChange(value)}
        error={!!errorMessage}
        helperText={errorMessage}
      />
    );
  },
  time: ({ onChange, errorMessage, ...props }) => {
    return (
      <TimeInput
        {...props}
        onChange={value => onChange(value)}
        error={!!errorMessage}
        helperText={errorMessage}
      />
    );
  },
  "date-time": ({ onChange, errorMessage, ...props }) => {
    return (
      <DateTimeInput
        {...props}
        onChange={value => onChange(value)}
        error={!!errorMessage}
        helperText={errorMessage}
      />
    );
  },
  autoComplete: ({ onChange, errorMessage, options = [], label, ...props }) => (
    <Autocomplete
      {...props}
      onChange={(event, newValue) => {
        if(!newValue)
          newValue = ''
        onChange(newValue)
      }}
      options={options}
      getOptionLabel={(option) => option}
      renderInput={(params) => <TextField {...params} {...props} error={!!errorMessage}
                                          helperText={errorMessage} label={label}  fullWidth/>}
    />
  ),
  select: ({ onChange, errorMessage, options = [], ...props }) => (
    <TextField
      {...props}
      onChange={e => onChange(e.target.value)}
      error={!!errorMessage}
      helperText={errorMessage}
      select
      fullWidth>
      {options.length ? (
        [
          props.value && (
            <MenuItem key="close-menu" value="">
              <Box display="flex" justifyContent="space-between" alignItems="center" flexGrow={1}>
                <Typography variant="caption" color="error">
                  Clear Selection
                </Typography>

                <Icon path={mdiClose} size={0.6} color="error" />
              </Box>
            </MenuItem>
          ),
          ...options.map(option => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))
        ]
      ) : (
        <MenuItem disabled>No option available.</MenuItem>
      )}
    </TextField>
  ),
  map: ({ onChange, errorMessage, ...props }) => (
    <MapInput
      {...props}
      onChange={value => onChange(value)}
      error={!!errorMessage}
      helperText={errorMessage}
    />
  ),
  address: ({ onChange, errorMessage, ...props }) => (
    <AddressInput
      {...props}
      onChange={value => onChange(value)}
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
    />
  ),
  shippingAddress: ({ onChange, errorMessage, ...props }) => (
    <ShippingAddressInput
      {...props}
      onChange={value => onChange(value)}
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
    />
  ),
  file: ({ errorMessage, ...props }) => (
    <FileInputBox {...props} error={!!errorMessage} helperText={errorMessage} />
  ),
  combobox: ({ errorMessage, ...props }) => (
    <Combobox {...props} error={!!errorMessage} helperText={errorMessage} />
  ),
  password: ({ errorMessage, ...props }) => {
    return <Password {...props} error={!!errorMessage} helperText={errorMessage} />;
  },

  DEFAULT: ({ onChange, errorMessage, ...props }) => (
    <TextField
      {...props}
      onChange={e => onChange(e.target.value)}
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
    />
  )
};

export default Inputs;
