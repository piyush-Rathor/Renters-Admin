import * as Yup from 'yup'

export { login, resetPasswordRequest, resetPassword } from './login'

export { default as addSupplier } from './add-supplier'

export { default as addReseller } from './add-reseller'

export { default as addCategory } from './add-category'

export { default as addSubcategory } from './add-subcategory'

export { default as addSubSubcategory } from './add--sub-subcategory'

export { default as addCollection } from './add-collection'

export { default as addProduct } from './add-product'

export { default as addAdvertisement } from './add-advertisement'

export { default as addAdvertisementTemplate } from './add-advertisement-template'

export const promptRemark = {
  _type: 'object',

  remark: {
    type: 'text',
    label: 'Remark',
    multiline: true,

    defaultValue: '',
    validator: Yup.string().min(2, 'Too short!').max(540, 'Too long!'),

    breakpoints: { xs: 12 },
  },
}
