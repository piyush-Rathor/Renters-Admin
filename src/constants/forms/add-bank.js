import * as Yup from "yup";
const addBank = {
  _type: "object",
  entityId:{
    type:"text",
    disabled:'true',
    validator: Yup.string().required("Required"),
    breakpoints: { xs: 6},
    variant: "outlined",
    label:'Reseller Id'
  },
  beneficiaryName:{
    type:"text",
    label:'Beneficiary name',
    default: '',
    validator: Yup.string().matches(/^[a-zA-Z ]*$/,'Please enter valid name').required("Required"),
    breakpoints: { xs: 6 },
    variant: "outlined",
  },
  bankName:{
    type:"text",
    label:'Receiver Bank Name',
    default: '',
    validator: Yup.string().matches(/^[a-zA-Z ]*$/,'Please enter valid name').required("Required"),
    breakpoints: { xs: 6 },
    variant: "outlined",
  },
  iban:{
    type:"text",
    label:'Receiver IBAN',
    default: '',
    validator: Yup.string().min(5).max(23).required("Required"),
    breakpoints: { xs: 6 },
    variant: "outlined",
  },

};

export default addBank;
