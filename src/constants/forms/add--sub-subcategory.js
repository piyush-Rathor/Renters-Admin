import * as Yup from 'yup'

const addSubcategory = {
  _type: 'object',

  name: {
    type: 'text',
    label: 'Sub-Subcategory name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 7 },
    offsets: { xs: 5 },
  },
  category: {
    type: 'select',
    label: 'Categories',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(['subcategory'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  subcategory: {
    type: 'select',
    label: 'Subcategories',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
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
