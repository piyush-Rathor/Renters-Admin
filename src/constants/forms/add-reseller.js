import * as Yup from 'yup'

import { AGE_GROUPS, GENDERS, UAE_AREAS, UAE_CITIES } from "../index";

const addReseller = {
  _type: 'object',

  humanFriendlyId: {
    type:"text",
    label: "Reseller Id",
    disabled: true,
    breakpoints: { xs: 4 },
  },
  firstName: {
    type: 'text',
    label: 'First name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 4 },
  },
  lastName: {
    type: 'text',
    label: 'Last name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 4 },
  },
  gender: {
    type: 'select',
    label: 'Gender',
    options: GENDERS,

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 2 },
  },
  ageGroup: {
    type: 'select',
    label: 'Age Group',
    options: AGE_GROUPS,

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 4 },
  },
  occupation: {
    type: 'select',
    label: 'Occupation',
    options: [
      {label: 'Student', value: 'student'},
      {label: 'Job', value: 'job'},
      {label: 'Teacher', value: 'teacher'},
      {label: 'Housewife', value: 'housewife'},
      {label: 'Business', value: 'business'},
      {label: 'Other', value: 'other'},
    ],
    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 4 },
  },
  language: {
    type: 'select',
    label: 'Language',
    options: [
      { label: 'English', value: 'English' },
      { label: 'Arabic', value: 'Arabic' },
      { label: 'Hindi', value: 'Hindi' },
      { label: 'Urdu', value: 'Urdu' },
      { label: 'Tagalog', value: 'Tagalog' },
      { label: 'Malay', value: 'Malay' },
    ],

    defaultValue: 'English',
    disabled: true,
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 4 },
  },
  displayName: {
    type: 'text',
    label: 'Display/Shop name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 6 },
  },
  email: {
    type: 'email',
    label: 'Email',

    defaultValue: '',
    validator: Yup.string().email('Invalid email'),

    breakpoints: { xs: 6 },
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
  country: {
    type: 'text',
    label: 'Country',
    disabled:true,
    defaultValue: 'UAE',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 6 },
  },
  phone: {
    _type: 'object',
    _label: 'Phone',

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
    areaCode: {
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
    number: {
      type: 'number',
      label: 'Phone',

      defaultValue: '',
      validator: Yup.string().required('Required'),

      breakpoints: { xs: 6 },
    },
  },
  avatar: {
    type: 'file',
    label: 'Avatar',

    defaultValue: '',
    validator: Yup.mixed(),

    breakpoints: { xs: 12 },
  },
  shippingAddresses: {
    _type: 'array',
    _label: 'Shipping Addresses',

    address: {
      type: 'shippingAddress',
      label: 'Address',
      multiline: true,

      defaultValue: '',
      validator: Yup.object().label('Address'),

      breakpoints: { xs: 12 },
    },
  },
}

export default addReseller
