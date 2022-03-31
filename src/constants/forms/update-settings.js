import * as Yup from 'yup'

const updateSettings = {
  _type: 'object',

  /*platformMarginType: {
    type: 'select',
    label: 'Platform Margin Type',
    options: [
      { label: 'Fixed', value: 'Fixed' },
      { label: 'Percentage', value: 'Percentage' },
    ],

    defaultValue: 'Percentage',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(['platformMargin'], '')
    },
    validator: Yup.string().required(),

    breakpoints: { xs: 4 },
  },
  platformMargin: {
    type: 'number',
    label: 'Platform Margin',

    defaultValue: '',
    validator: Yup.number()
      .min(0)
      .required('Required')
      .when('platformMarginType', (t, schema) => (t === 'Percentage' ? schema.max(100) : schema)),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !getValueAtPath(['platformMarginType'])
    },
    breakpoints: { xs: 5 },
  },*/

  shippingDetails: {
    _type: 'array',
    _label: 'Shipping Details',

    source: {
      type: 'text',
      label: 'Source',

      defaultValue: '',
      validator: Yup.string().label('Source').required('Required'),

      breakpoints: { xs: 6 },
    },
    destination: {
      type: 'text',
      label: 'Destination',

      defaultValue: '',
      validator: Yup.string().label('Destination').required('Required'),

      breakpoints: { xs: 6 },
    },
    shippingCharges: {
      type: 'currency',
      label: 'Shipping Charges',

      defaultValue: '',
      validator: Yup.string().label('Shipping Charges').required('Required'),

      breakpoints: { xs: 6 },
    },
    deliveryTime: {
      type: 'number',
      label: 'Delivery Time (hours)',

      defaultValue: '',
      validator: Yup.number().min(0).label('Delivery Time (hours)').required('Required'),

      breakpoints: { xs: 6 },
    },
  },

  returnHoldPeriod: {
    type: 'number',
    label: 'Return hold period (days)',

    defaultValue: '',
    validator: Yup.number().min(0).required('Required'),

    breakpoints: { xs: 6 },
    offsets: { xs: 6 },
  },
  minimumRequiredAppVersions: {
    _type: 'object',
    _label: 'Minimum required app versions',

    android: {
      variant: 'outlined',
      type: 'text',
      label: 'Android',

      defaultValue: '',
      validator: Yup.string()
        .matches(/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$/, 'Invalid app version')
        .required('Required'),

      breakpoints: { xs: 6 },
    },
    iOS: {
      variant: 'outlined',
      type: 'text',
      label: 'iOS',

      defaultValue: '',
      validator: Yup.string()
        .matches(/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$/, 'Invalid app version')
        .required('Required'),

      breakpoints: { xs: 6 },
    },
  },
}

export default updateSettings
