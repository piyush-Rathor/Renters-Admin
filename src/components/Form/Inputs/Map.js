import React, { useEffect, useRef } from 'react'
import throttle from 'lodash/throttle'
import parse from 'autosuggest-highlight/parse'
import GoogleMapReact from 'google-map-react'
import { Box, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Icon from '@mdi/react'
import { mdiMapMarker } from '@mdi/js'

import config from '../../../constants/config'
import { useCallback } from 'react'

const MapInput = ({ onChange, onBlur, value, ...props }) => {
  const theme = useTheme()
  const MapRef = useRef(null)
  const GeocoderRef = useRef(null)
  const AutoCompleteRef = useRef(null)

  const { lat, lng } = value
  const defaultCenter = useRef({ lat: lat || 23.4241, lng: lng || 53.8478 })

  useEffect(() => {
    const { lat, lng } = value
    if (lat && lng && MapRef.current && MapRef.current.map_) MapRef.current.map_.panTo({ lat, lng })
  }, [value])

  const [_value, setValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState('')
  const [options, setOptions] = React.useState([])

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        AutoCompleteRef.current.getPlacePredictions(request, callback)
      }, 200),
    []
  )

  React.useEffect(() => {
    let active = true
    if (!AutoCompleteRef.current) return undefined

    if (inputValue === '') {
      setOptions(_value ? [_value] : [])
      return undefined
    }

    fetch({ input: inputValue }, results => {
      if (active) {
        let newOptions = []

        if (_value) newOptions = [_value]
        if (results) newOptions = [...newOptions, ...results]
        setOptions(newOptions)
      }
    })

    return () => (active = false)
  }, [_value, inputValue, fetch])

  const geocodeIt = useCallback(
    input => {
      if (GeocoderRef.current)
        GeocoderRef.current.geocode(input, (results, status) => {
          if (status === 'OK') {
            const result = results[0]
            onChange(
              prettyAddress(result.address_components, {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              })
            )
          } else alert('Geocode was unsuccessful : ' + status)
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (_value)
      geocodeIt({
        placeId: _value.place_id,
      })
  }, [_value, geocodeIt])

  return (
    <>
      <Autocomplete
        getOptionLabel={option => (typeof option === 'string' ? option : option.description)}
        filterOptions={x => x}
        options={options}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={_value}
        onChange={(event, newValue) => {
          setOptions(newValue ? [newValue, ...options] : options)
          setValue(newValue)
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue)
        }}
        renderInput={params => (
          <TextField {...params} label="Search location" variant="outlined" margin="dense" fullWidth />
        )}
        renderOption={option => {
          const matches = option.structured_formatting.main_text_matched_substrings
          const parts = parse(
            option.structured_formatting.main_text,
            matches.map(match => [match.offset, match.offset + match.length])
          )

          return (
            <Grid container alignItems="center">
              <Grid item>
                <Icon path={mdiMapMarker} size={1} />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <Typography
                    key={index}
                    component="span"
                    variant="body2"
                    style={{ fontWeight: part.highlight ? 600 : 400 }}>
                    {part.text}
                  </Typography>
                ))}

                <Typography variant="body2" color="textSecondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          )
        }}
        clearOnBlur={false}
      />
      <FormControl component="fieldset" error={!!props.error} fullWidth>
        <Box position="relative" height={200}>
          <GoogleMapReact
            ref={MapRef}
            bootstrapURLKeys={{ key: config.GOOGLE_MAP_KEY, libraries: 'places' }}
            defaultCenter={defaultCenter.current}
            defaultZoom={7}
            onDragEnd={e => geocodeIt({ location: e.getCenter() })}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              GeocoderRef.current = new maps.Geocoder()
              AutoCompleteRef.current = new maps.places.AutocompleteService()
            }}
            options={{ fullscreenControl: false }}
          />

          <Box
            position="absolute"
            width={2}
            height={2}
            borderRadius={2}
            bgcolor={theme.palette.error.main}
            top="50%"
            left="50%"
            style={{ transform: 'translate(-50%, -50%)' }}>
            <Icon
              path={mdiMapMarker}
              size={1.5}
              color={theme.palette.error.main}
              style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, -100%)' }}
            />
          </Box>
        </Box>
        <FormHelperText>{props.helperText}</FormHelperText>
      </FormControl>
    </>
  )
}

export default MapInput

const prettyAddress = (components, { lat, lng }) => {
  const address = {
    lat,
    lng,
    line1: [],
    line2: [],
    city: [],
    country: [],
  }
  components.forEach(c => {
    if (c.types.includes('premise')) address.line1.push(c.long_name)
    if (c.types.includes('street_number')) address.line1.push(c.long_name)
    if (c.types.includes('route')) address.line1.push(c.long_name)
    if (c.types.includes('sublocality')) address.line2.push(c.long_name)
    if (c.types.includes('locality')) address.line2.push(c.long_name)
    if (c.types.includes('administrative_area_level_2')) address.line2.push(c.long_name)
    if (c.types.includes('administrative_area_level_1')) address.city.push(c.long_name)
    if (c.types.includes('country')) address.country.push(c.long_name)
    if (c.types.includes('postal_code')) address.PIN.push(c.long_name)
  })
  for (const i in address) {
    address[i] = Array.isArray(address[i]) ? address[i].join(', ') : address[i]
  }
  return address
}
