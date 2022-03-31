import * as Yup from 'yup'

const addReferral = {
  _type: 'object',

  reseller: {
    type: 'select',
    label: 'Reseller',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },

}

export default addReferral
