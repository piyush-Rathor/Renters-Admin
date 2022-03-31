import * as Yup from 'yup'

import { UAE_AREAS, UAE_CITIES } from '../../../constants'

const shippingAddressConfig = {
  _type: 'object',

  name:{
    type: 'text',
    label: 'Name',
    validator: Yup.string().max(128, 'Too Long!').required("Required"),
    breakpoints: { xs: 6 },
  },
  email: {
    type: 'email',
    label: 'Email',

    defaultValue: '',
    validator: Yup.string().email('Invalid email'),

    breakpoints: { xs: 6 },
  },
  countryCode: {
    type: 'select',
    label: 'Country Code',
    options: [
      { label: '+971 UAE', value: '+971' },
      { label: '+91 India', value: '+91' },
    ],
    disabled: true,

    defaultValue: '+971',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      setFieldValue(backTracePath(currentPath, 'areaCode'), '')
    },
    validator: Yup.string().label('Country code').required('Required'),

    breakpoints: { xs: 3 },
  },
  cityCode: {
    type: 'number',
    label: 'Area Code',

    defaultValue: '',
    validator: Yup.string()
      .required('Required')
      .when('countryCode', (v, s) => (v === '+91' ? s.notRequired() : s)),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(backTracePath(currentPath)).countryCode !== '+971'
    },
    breakpoints: { xs: 3 },
  },
  contactNumber: {
    type: 'number',
    label: 'Contact Number',

    defaultValue: '',
    validator: Yup.string().required('Required').max(7,'Must be of 7 digit').min(7,'must be of 7 digit'),

    breakpoints: { xs: 6 },
  },
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

export default shippingAddressConfig
