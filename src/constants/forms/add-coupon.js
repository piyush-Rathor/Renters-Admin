import * as Yup from "yup";
import * as moment from "moment"

const addCoupon = {
  _type: "object",
  couponCode: {
    type: 'text',
    label: 'Coupon Code',
    defaultValue: '',
    validator: Yup.string().required('Required'),
    breakpoints: { xs: 4 },
  },
  discountType: {
    type: 'select',
    label: 'Discount Type',
    options: [
      { label: 'Fixed', value: 'Fixed' },
      { label: 'Percentage', value: 'Percentage' },
    ],

    defaultValue: 'Percentage',
    validator: Yup.string().required('Required'),
    breakpoints: { xs: 4 },
  },
  discount: {
    type: 'number',
    label: 'Discount',
    defaultValue: '',
    validator: Yup.number().positive().required('Required'),
    breakpoints: { xs: 4 },
  },
  date: {
    type: 'date',
    label: 'Validity',
    defaultValue: '',
    validator: Yup.date().min(new Date(moment().startOf('day').valueOf()), `Date can't be in past`),
    breakpoints: { xs: 4 },
  },
  totalUsage: {
    type: 'number',
    label: 'Total Usage',
    defaultValue: '',
    validator: Yup.number().positive(),
    breakpoints: { xs: 4 },
  },
  perUserUsage: {
    type: 'number',
    label: 'Per User Usage',
    defaultValue: '',
    validator: Yup.number().positive(),
    breakpoints: { xs: 4 },
  },
  description: {
    type: 'text',
    label: 'Description',
    defaultValue: '',
    validator: Yup.string().max(12).required('Required'),
    breakpoints: { xs: 12 },
  },
};

export default addCoupon;
