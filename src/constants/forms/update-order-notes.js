import * as Yup from 'yup'

const updateOrderCustomer = {
  _type: 'object',

  message: {
    type: 'text',
    label: 'Note',

    defaultValue: '',
    validator: Yup.string().max(256, 'Too long!').required('Required'),

    breakpoints: { xs: 12 },
  },
}

export default updateOrderCustomer
