import * as Yup from 'yup'

const addCollection = {
  _type: 'object',

  collectionCode: {
    variant: 'outlined',
    type: 'text',
    label: 'Collection code',

    defaultValue: '',
    validator: Yup.string()
      .uppercase()
      .length(6)
      .matches(/^[A-Z0-9]+$/, 'Invalid code!'),

    breakpoints: { xs: 4 },
  },
  name: {
    type: 'text',
    label: 'Collection name',

    defaultValue: '',
    validator: Yup.string().min(2, 'Too short!').max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 8 },
  },
  goLiveTime: {
    type: 'date-time',
    label: 'Go live time',

    defaultValue: '',
    validator: Yup.number()
      .test(
        'is-greater-than-current-time',
        'Go live time can not be in past.',
        (v, context) => v >= +new Date() - 90000
      )
      .required('Required'),

    breakpoints: { xs: 6 },
  },
  cover: {
    type: 'file',
    label: 'Cover',

    defaultValue: '',
    validator: Yup.mixed().required('Required'),

    breakpoints: { xs: 12 },
  },

  category: {
    type: 'select',
    label: 'Category',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(['subcategory'], '')
      setFieldValue(['subSubcategory'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 4 },
  },
  subcategory: {
    type: 'select',
    label: 'Subcategory',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(['subSubcategory'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 4 },
  },
  subSubcategory: {
    type: 'select',
    label: 'Sub-Subcategory',

    defaultValue: '',
    validator: Yup.string(),

    breakpoints: { xs: 4 },
  },

  description: {
    type: 'text',
    label: 'Description',
    multiline: true,
    rows: 3,

    defaultValue: '',
    validator: Yup.mixed().required('Required'),

    breakpoints: { xs: 12 },
  },

  products: {
    type: 'combobox',
    label: 'Products',

    defaultValue: '',
    validator: Yup.array().of(Yup.string()),

    breakpoints: { xs: 12 },
  },

  tags: {
    type: 'combobox',
    label: 'Tags',
    freeSolo: true,

    defaultValue: '',
    validator: Yup.array().of(Yup.string()),

    breakpoints: { xs: 12 },
  },
}

export default addCollection
