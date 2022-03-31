import * as Yup from "yup";

const updateBonuses = {
  _type: "object",

  type: {
    type: 'select',
    label: 'Bonus Type',
    defaultValue: '',
    // onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
    //   setFieldValue(backTracePath(currentPath, 'amountPercentage'), '')
    // },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  amountType: {
    type: 'select',
    label: 'Amount Type',
    defaultValue: '',
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
      setFieldValue(backTracePath(currentPath, 'amountPercentage'), '')
    },
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  amount: {
    type: 'text',
    label: 'Amount',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
  expiryDate: {
    type: 'date',
    label: 'Expiry Date',

    defaultValue: '',
    validator: Yup.string().required('Required'),

    breakpoints: { xs: 6 },
  },
};

export default updateBonuses;
