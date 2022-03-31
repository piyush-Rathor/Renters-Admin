import * as Yup from 'yup'

const addSubcategory = {
  _type: 'object',

  name: {
    type: 'text',
    label: 'Subcategory name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 7 },
  },
  category: {
    type: 'select',
    label: 'Categories',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 5 },
  },

  cover: {
    type: 'file',
    label: 'Cover',

    defaultValue: '',
    validator: Yup.mixed().required('Required'),

    breakpoints: { xs: 12 },
  },
}

export default addSubcategory
