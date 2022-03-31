import * as Yup from 'yup'

const addSupplier = {
  _type: 'object',

  firstName: {
    type: 'text',
    label: 'First name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 6 },
  },
  lastName: {
    type: 'text',
    label: 'Last name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!'),

    breakpoints: { xs: 6 },
  },
  email: {
    type: 'email',
    label: 'Email',

    defaultValue: '',
    validator: Yup.string().email('Invalid email').required('Required'),

    breakpoints: { xs: 6 },
  },
  role: {
    type: 'select',
    label: 'Role',
    options: [
      { label: 'Super Admin', value: 'Super Admin' },
      { label: 'Admin', value: 'Admin' },
      { label: 'Category Manager', value: 'Category Manager' },
    ],

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
}

export default addSupplier
