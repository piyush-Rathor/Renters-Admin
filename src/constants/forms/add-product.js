import * as Yup from 'yup'

import { UAE_CITIES } from '../index'
import { getDiscountedPrice, getErfaPrice } from '../../utils'

const getValues = getValueAtPath => {
  const supplierPrice = getValueAtPath(['supplierPrice'])
  const discountType = getValueAtPath(['discountType'])
  const discount = getValueAtPath(['discount'])
  const platformMarginType = getValueAtPath(['platformMarginType'])
  const platformMargin = getValueAtPath(['platformMargin'])
  return { supplierPrice, discountType, discount, platformMarginType, platformMargin }
}

const addProduct = {
  _type: 'object',

  productCode: {
    variant: 'outlined',
    type: 'text',
    label: 'Product code',

    defaultValue: '',
    validator: Yup.string()
      .uppercase()
      .length(6)
      .matches(/^[A-Z0-9]+$/, 'Invalid code!'),

    breakpoints: { xs: 4 },
  },
  name: {
    type: 'text',
    label: 'Product name',

    defaultValue: '',
    validator: Yup.string().max(64, 'Too long!').required('Required'),

    breakpoints: { xs: 7 },
  },

  supplier: {
    type: 'select',
    label: 'Supplier',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },

  supplierPrice: {
    type: 'currency',
    label: 'Supplier Price',

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { platformMarginType, platformMargin } = getValues(getValueAtPath)
      setFieldValue('erfaPrice', getErfaPrice(currentValue, platformMarginType, platformMargin) || '')
    },
    validator: Yup.number().positive().required('Required'),

    breakpoints: { xs: 6 },
  },

  platformMarginType: {
    type: 'select',
    label: 'Platform Margin Type',
    options: [
      { label: 'Fixed', value: 'Fixed' },
      { label: 'Percentage', value: 'Percentage' },
    ],

    defaultValue: 'Percentage',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
        const { supplierPrice, platformMargin } = getValues(getValueAtPath)
      setFieldValue('erfaPrice', getErfaPrice(supplierPrice, currentValue, platformMargin) || '')
      setFieldValue(['platformMargin'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 4 },
  },
  platformMargin: {
    type: 'number',
    label: 'Platform Margin',

    defaultValue: 0,
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType } = getValues(getValueAtPath)
      setFieldValue('erfaPrice', getErfaPrice(supplierPrice, platformMarginType, currentValue) || '')
    },
    validator: Yup.number()
      .required('Required')
      .when('platformMarginType', (t, schema) => {
        if (t === 'Percentage') return schema.positive().min(0).max(100)
        if (t === 'Fixed')
          schema.test(
            'is-less-than-supplier-price',
            'Platform Margin can not be greater than product supplier price',
            (platformMargin, context) => (platformMargin || 0) <= (context.parent.supplierPrice || 0)
          )
        return schema
      }),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !getValueAtPath(['platformMarginType'])
    },
    breakpoints: { xs: 3 },
  },
  erfaPrice: {
    type: 'currency',
    label: 'ERFA Price',
    disabled: true,

    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discountType, discount, platformMarginType, platformMargin } = getValues(
        getValueAtPath
      )
      setFieldValue(
        'discountedPrice',
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount) || ''
      )
    },
    _getInitialValue: (currentPath, expectedValue, { backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType, platformMargin } = getValues(getValueAtPath)
      return getErfaPrice(supplierPrice, platformMarginType, platformMargin) || ''
    },
    validator: Yup.number().positive().required('Required'),

    breakpoints: { xs: 5 },
  },

  discountType: {
    type: 'select',
    label: 'Discount Type',
    options: [
      { label: 'Fixed', value: 'Fixed' },
      { label: 'Percentage', value: 'Percentage' },
    ],

    defaultValue: 'Percentage',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discount, platformMarginType, platformMargin } = getValues(getValueAtPath)
      setFieldValue(
        'discountedPrice',
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, currentValue, discount) || ''
      )
      setFieldValue(['discount'], '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 4 },
  },
  discount: {
    type: 'number',
    label: 'Discount',

    defaultValue: 0,
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discountType, platformMarginType, platformMargin } = getValues(getValueAtPath)
      setFieldValue(
        'discountedPrice',
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, currentValue) ||
          ''
      )
    },
    validator: Yup.number()
      .required('Required')
      .when('discountType', (t, schema) => {
        if (t === 'Percentage') return schema.positive().min(0).max(100)
        if (t === 'Fixed')
          schema.test(
            'is-less-than-supplier-price',
            'Discount can not be greater than product supplier price',
            (discount, context) => (discount || 0) <= (context.parent.supplierPrice || 0)
          )
        return schema
      }),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !getValueAtPath(['discountType'])
    },
    breakpoints: { xs: 3 },
  },

  discountedPrice: {
    type: 'currency',
    label: 'Discounted Price',
    disabled: true,

    defaultValue: '',
    _getInitialValue: (currentPath, expectedValue, { backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType, platformMargin, discountType, discount } = getValues(
        getValueAtPath
      )
      return (
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount) || ''
      )
    },
    validator: Yup.number()
      .positive()
      .required('Required')
      .test(
        'is-less-than--supplier-price',
        'Discounted Price can not be less than supplier price',
        (v, context) => (v || 0) >= (context.parent.supplierPrice || 0)
      ),

    breakpoints: { xs: 5 },
  },
  eligibleForFreeShipping: {
    type: 'checkbox',
    label: 'Eligible for Free Shipping?',

    defaultValue: false,
    validator: Yup.boolean().required('Required'),

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

  images: {
    _type: 'array',
    _label: 'Product Images',

    image: {
      type: 'file',
      label: 'Image',

      defaultValue: '',
      validator: Yup.mixed().label('Image').required('Required'),

      breakpoints: { xs: 12 },
    },
  },
  description: {
    type: 'text',
    label: 'Description',
    multiline: true,
    rows: 4,

    defaultValue: '',
    validator: Yup.string(),

    breakpoints: { xs: 12 },
  },

  features: {
    _type: 'array',
    _label: 'Features/Product Attributes',

    label: {
      type: 'text',
      label: 'Label',

      defaultValue: '',
      validator: Yup.string().label('Label').required('Required'),

      breakpoints: { xs: 6 },
    },
    details: {
      type: 'text',
      label: 'Details',

      defaultValue: '',
      validator: Yup.string().label('Details').required('Required'),

      breakpoints: { xs: 6 },
    },
  },
  sizes: {
    _type: 'array',
    _label: 'Sizes and Availability',

    size: {
      type: 'text',
      label: 'Size',

      defaultValue: '',
      validator: Yup.string().label('Size').required(),

      breakpoints: { xs: 4 },
    },
    stock: {
      type: 'number',
      label: 'Stock',

      defaultValue: '',
      validator: Yup.number().min(0).integer().label('Stock').required('Required'),

      breakpoints: { xs: 3 },
    },
  },

  sizeChart: {
    type: 'file',
    label: 'Size Chart',

    defaultValue: '',
    validator: Yup.mixed(),

    breakpoints: { xs: 12 },
  },

  deliveryAvailability: {
    type: 'combobox',
    label: 'Delivery Availability',
    options: UAE_CITIES.map(c => ({ value: c, label: c })),

    defaultValue: '',
    validator: Yup.array().of(Yup.string()).required('Required'),

    breakpoints: { xs: 12 },
  },
}

export default addProduct
