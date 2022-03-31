import * as Yup from 'yup'

import { UAE_AREAS, UAE_CITIES } from '../../../constants'

const addressConfig = {
  _type: 'object',

  country: {
    type: 'text',
    label: 'Country',
    disabled: true,

    defaultValue: 'UAE',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 12 },
  },
  city: {
    type: 'autoComplete',
    label: 'City',
    options: UAE_CITIES,

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(['area'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  area: {
    type: 'autoComplete',
    label: 'Area',
    options: (path, { getValueAtPath }) => {
      const city = getValueAtPath(['city'])
      return city && UAE_AREAS[city] ? UAE_AREAS[city] : []
    },

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  line1: {
    type: 'text',
    label: 'Building Name/Road',
    multiline: true,

    defaultValue: '',
    validator: Yup.string().max(128, 'Too Long!').required('Required'),

    breakpoints: { xs: 12 },
  },
  buildingNumber: {
    type: 'text',
    label: 'Building Number',
    multiline: true,

    defaultValue: '',
    validator: Yup.string().max(128, 'Too Long!'),

    breakpoints: { xs: 4 },
  },
  floorNumber: {
    type: 'text',
    label: 'Floor Number',
    multiline: true,

    defaultValue: '',
    validator: Yup.string().max(128, 'Too Long!'),

    breakpoints: { xs: 4 },
  },
  flatNumber: {
    type: 'text',
    label: 'Flat No./Villa No.',
    multiline: true,

    defaultValue: '',
    validator: Yup.string().max(128, 'Too Long!'),

    breakpoints: { xs: 4 },
  },
  addressType: {
    type: 'select',
    label: 'Address Type',
    options: [
      { value: 'Home', label: 'Home' },
      { value: 'Office', label: 'Office' },
    ],

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 12 },
  },
}

export default addressConfig
