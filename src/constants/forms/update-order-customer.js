import * as Yup from 'yup'

const updateOrderCustomer = {
  _type: 'object',

  name: {
    type: 'text',
    label: 'Customer name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 12 },
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
      validator: Yup.string().max(7, 'Please provide valid phone number').required('Required'),

      breakpoints: { xs: 6 },
    },
  },
  address: {
    type: 'address',
    label: 'Address',

    defaultValue: '',
    validator: Yup.object().required('Required'),

    breakpoints: { xs: 12 },
  },
  trackingLink: {
    type: 'text',
    label: 'Tracking Link',

    defaultValue: '',
    validator: Yup.string().url(),

    breakpoints: { xs: 12 },
  },
}

export default updateOrderCustomer
