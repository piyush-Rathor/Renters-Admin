import * as Yup from 'yup'

const addCategory = {
  _type: 'object',

  name: {
    type: 'text',
    label: 'Category name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 12 },
  },

  cover: {
    type: 'file',
    label: 'Cover',

    defaultValue: '',
    validator: Yup.mixed().required('Required'),

    breakpoints: { xs: 12 },
  },
}

export default addCategory
