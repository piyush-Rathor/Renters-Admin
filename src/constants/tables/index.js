import * as Yup from 'yup'
import cloneDeep from 'lodash/cloneDeep'
import unset from 'lodash/unset'
import { mdiTruck } from '@mdi/js'

import { formatCurrency } from '../../utils'

const shippingDetails = {
  _type: 'object',
  _icon: mdiTruck,
  _label: 'Shipping Details',

  source: {
    type: 'text',
    label: 'Source',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
    tableCellProps: { width: '25%' },
  },
  destination: {
    type: 'text',
    label: 'Destination',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
    tableCellProps: { width: '25%' },
  },
  shippingCharges: {
    type: 'currency',
    label: 'Shipping Charges',

    defaultValue: '',
    validator: Yup.string().required(),

    breakpoints: { xs: 6 },
    tableCellProps: { width: '25%' },
    formatter: v => formatCurrency(v),
  },
  deliveryTime: {
    type: 'number',
    label: 'Delivery Time (hours)',

    defaultValue: '',
    validator: Yup.number().required('Required'),

    breakpoints: { xs: 6 },
    tableCellProps: { width: '25%' },
  },
}

const getFormAndColumnConfigs = table => {
  const formConfig = cloneDeep(table)
  const { _type, _icon: icon, _label: label, _getKey: getKey, ...inputs } = formConfig
  unset(formConfig, ['_icon'])
  unset(formConfig, ['_label'])
  unset(formConfig, ['_getKey'])

  const columns = Object.entries(inputs).map(([key, { label, tableCellProps, formatter }]) => {
    unset(formConfig, [key, 'tableCellProps'])
    unset(formConfig, [key, 'formatter'])
    return { field: key, label: label, props: tableCellProps, formatter }
  })

  return { icon, label, formConfig, columns, getKey }
}

const tables = {
  shippingDetails: getFormAndColumnConfigs(shippingDetails),
}

export default tables
