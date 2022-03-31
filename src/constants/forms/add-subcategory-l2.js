import * as Yup from 'yup'

export default {
  _type: 'object',

  name: {
    type: 'text',
    label: 'Subcategory name',

    defaultValue: '',
    validator: Yup.string().min(2, 'Too short!').max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 12 },
  },
  image: {
    type: 'file',
    label: 'Image',

    defaultValue: '',
    validator: Yup.mixed().required(),

    breakpoints: { xs: 12 },
  },

  category: {
    type: 'select',
    label: 'Category',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(backTracePath(currentPath, 'subcategory'), '')
    },
    validator: Yup.string().required(),

    breakpoints: { xs: 5 },
  },
  subcategory: {
    type: 'select',
    label: 'Subcategory',

    defaultValue: '',
    validator: Yup.string().required(),

    breakpoints: { xs: 7 },
  },
}
