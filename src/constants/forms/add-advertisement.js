import * as Yup from 'yup'

export const TARGET_OPTIONS = [
  { label: 'Category', value: 'Category' },
  { label: 'Subcategory', value: 'Subcategory' },
  { label: 'Sub-Subcategory', value: 'Sub-Subcategory' },
  { label: 'Collection', value: 'Collection' },
  { label: 'Collections by tags', value: 'Collection by tags' },
  { label: 'Link', value: 'Link' },
]

const addAdvertisement = {
  _type: 'object',

  displayLocation: {
    type: 'select',
    label: 'Display Location',
    options: [
      { label: 'Home', value: 'Home' },
      { label: 'Category', value: 'Category' },
    ],

    defaultValue: '',
    validator: Yup.string().label('display location').required(),

    breakpoints: { xs: 4 },
  },
  status: {
    type: 'select',
    label: 'Status',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Hidden', value: 'Hidden' },
    ],

    defaultValue: 'Active',
    validator: Yup.string().label('status').required(),

    breakpoints: { xs: 4 },
  },
  banner: {
    type: 'file',
    label: 'AD Banner',

    defaultValue: '',
    validator: Yup.mixed().required(),

    breakpoints: { xs: 12 },
  },

  target: {
    type: 'select',
    label: 'Target',
    options: TARGET_OPTIONS,

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      setFieldValue(backTracePath(currentPath, 'category'), '')
      setFieldValue(backTracePath(currentPath, 'subcategory'), '')
      setFieldValue(backTracePath(currentPath, 'subSubcategory'), '')
      setFieldValue(backTracePath(currentPath, '_collection'), '')
      setFieldValue(backTracePath(currentPath, 'tags'), '')
      setFieldValue(backTracePath(currentPath, 'link'), '')
    },
    validator: Yup.string(),

    breakpoints: { xs: 4 },
  },

  category: {
    type: 'select',
    label: 'Category',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      setFieldValue(backTracePath(currentPath, 'subcategory'), '')
      setFieldValue(backTracePath(currentPath, 'subSubcategory'), '')
      setFieldValue(backTracePath(currentPath, '_collection'), '')
    },
    validator: Yup.string()
      .required('Required')
      .when('target', (t, schema) => (t === 'Category' ? schema : schema.notRequired())),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !['Collection', 'Category', 'Subcategory', 'Sub-Subcategory'].includes(
        getValueAtPath(['target']),
      )
    },
    breakpoints: { xs: 8 },
  },
  subcategory: {
    type: 'select',
    label: 'Subcategory',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      setFieldValue(['subSubcategory'], '')
      setFieldValue(backTracePath(currentPath, '_collection'), '')
    },
    validator: Yup.string()
      .required('Required')
      .when('target', (t, schema) => (t === 'Subcategory' ? schema : schema.notRequired())),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !['Collection', 'Subcategory', 'Sub-Subcategory'].includes(getValueAtPath(['target']))
    },
    breakpoints: { xs: 6 },
  },
  subSubcategory: {
    type: 'select',
    label: 'Sub-Subcategory',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      setFieldValue(backTracePath(currentPath, '_collection'), '')
    },
    validator: Yup.string()
      .label('subSubcategory').required('Required')
      .when('target', (t, schema) => (t !== 'Sub-Subcategory' ? schema.notRequired() : schema)),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !['Collection', 'Sub-Subcategory'].includes(getValueAtPath(['target']))
    },
    breakpoints: { xs: 6 },
  },
  _collection: {
    type: 'select',
    label: 'Collection',

    defaultValue: '',
    validator: Yup.string()
      .label('collection')
      .required()
      .when('target', (t, schema) => (t === 'Collection' ? schema : schema.notRequired())),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(['target']) !== 'Collection'
    },
    breakpoints: { xs: 8 },
  },
  tags: {
    type: 'text',
    label: 'Tags',
    defaultValue: '',
    validator: Yup.string().max(128, 'Too long!').required('Required').when('target', (t, schema) => (t === 'Collection by tags' ? schema.min(1) : schema.notRequired())),
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath('target') !== 'Collection by tags'
    },
    breakpoints: { xs: 8 },
  },
  link: {
    type: 'text',
    label: 'Link',

    defaultValue: '',
    validator: Yup.string()
      .url()
      .required()
      .when('target', (t, schema) => (t === 'Link' ? schema : schema.notRequired())),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(['target']) !== 'Link'
    },
    breakpoints: { xs: 8 },
  },
}

export default addAdvertisement
