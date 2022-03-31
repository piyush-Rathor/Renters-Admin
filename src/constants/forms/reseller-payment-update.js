import { RS_PAYMENT_STATUS } from "../index";
import * as Yup from "yup";
import * as moment from "moment"

const resellerPaymentUpdate = {
  _type: "object",

  date: {
    variant: "outlined",
    type: "date",
    defaultValue: "",
    label: "Date",
    breakpoints: { xs: 4 },
    // validator: Yup.date().required("Required").max(new Date(moment().endOf('day').valueOf()), `Date can't be in future`)
  },
  notes: {
    type: "text",
    label: "Notes",
    validator: Yup.string(),
    defaultValue: "",
    breakpoints: { xs: 6 }
  },
  entity: {
    _hide: () => true,
    type: "text"
  },
  payments: {
    _hide: () => true,
    type: "object"
  },
  bonus: {
    _hide: () => true,
    type: "object"
  },
  orderIds: {
    type: "combobox",
    label: "Order Ids",
    validator: Yup.array().of(Yup.string()),
    defaultValue: "",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      let payments = getValueAtPath(["payments"]);
      const bonusIds = getValueAtPath(["bonusIds"]);
      payments = payments.filter(p => currentValue?.includes(p?.orderSystemId) || currentValue?.includes(p?.order?._id) || bonusIds?.includes(p?.bonusId));
      const entity = getValueAtPath(["entity"]);
      const amountToPay = payments.reduce((total, next) => {
        let value = entity === "reseller" ? next.resellerMargin : (next.supplierPrice * next.order?.items[0].quantity);
        return total+value
      }, 0);
      setFieldValue("amountToPay", amountToPay);
    },
    breakpoints: { xs: 6 }
  },
  bonusIds: {
    _hide: () => true,
    type: "combobox",
    label: "Bonus Ids",
    validator: Yup.array().of(Yup.string()),
    defaultValue: "",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      let payments = getValueAtPath(["payments"]);
      const orderIds = getValueAtPath(["orderIds"]);
      payments = payments.filter(p => orderIds?.includes(p?.orderSystemId) || orderIds?.includes(p.orderId) || currentValue?.includes(p.bonusId));
      const entity = getValueAtPath(["entity"]);
      const amountToPay = payments.reduce((total, next) => {
        let value = entity === "reseller" ? next.resellerMargin : next.supplierPrice;
        return total+value
      }, 0);
      setFieldValue("amountToPay", amountToPay);
    },
    breakpoints: { xs: 6 }
  },
  amountToPay: {
    type: "text",
    label: "Amount to pay",
    defaultValue: 0,
    disabled: true,
    breakpoints: { xs: 6 }
  },
  status: {
    type: "select",
    label: "Status",
    options: [
      ...RS_PAYMENT_STATUS.map(s => ({ label: s, value: s }))
    ],
    defaultValue: RS_PAYMENT_STATUS[1],
    breakpoints: { xs: 4 },
    validator: Yup.string().required("Required")
  },
  mode: {
    type: "select",
    label: "Payment Mode",
    options: [
      { label: "Cash", value: "cash" },
      { label: "Card", value: "card" },
      { label: "Bank", value: "bank" },
      { label: "Wallet", value: "wallet" },
      { label: "ATM", value: "atm" }
    ],
    defaultValue: "cash",
    breakpoints: { xs: 4 },
    validator: Yup.string().required("Required").when("status", (v, s) => (v !== RS_PAYMENT_STATUS[2] && v !== RS_PAYMENT_STATUS[3] ? s.notRequired() : s)),
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(backTracePath(currentPath)).status !== RS_PAYMENT_STATUS[3] && getValueAtPath(backTracePath(currentPath)).status !== RS_PAYMENT_STATUS[2];
    }
  },
  transactionId: {
    type: "text",
    label: "Transaction Id",
    breakpoints: { xs: 4 },
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return false && (getValueAtPath(backTracePath(currentPath)).mode === "cash" || getValueAtPath(backTracePath(currentPath)).status !== RS_PAYMENT_STATUS[3] && getValueAtPath(backTracePath(currentPath)).status !== RS_PAYMENT_STATUS[2]);
    },
    // validator: Yup.string().required("Required").when("mode", (v, s) => (v === "cash" ? s.notRequired() : s)).when("status", (v, s) => (v !== RS_PAYMENT_STATUS[3] && v !== RS_PAYMENT_STATUS[2] ? s.notRequired() : s))
    validator: Yup.string()
  },

  bankDetails: {
    _type: "object",
    _label: "Bank Details",
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return false && !(getValueAtPath(backTracePath(["mode"])) === "bank" && (getValueAtPath(backTracePath(["status"])) === RS_PAYMENT_STATUS[3] || getValueAtPath(backTracePath(["status"])) === RS_PAYMENT_STATUS[2]));
    },
    beneficiaryName: {
      type: "text",
      label: "Beneficiary Name",
      validator: Yup.string().matches(/^[a-zA-Z ]*$/, "Please enter valid name").required("Required").when("mode", (v, s) => (v !== "bank" ? s.notRequired() : s)).when("status", (v, s) => (v !== RS_PAYMENT_STATUS[3] ? s.notRequired() : s)),
      breakpoints: { xs: 6 }
    },
    bankName: {
      type: "text",
      label: "Receiver Bank Name",
      defaultValue: "",
      validator: Yup.string().matches(/^[a-zA-Z ]*$/, "Please enter valid name").required("Required").when("mode", (v, s) => (v !== "bank" ? s.notRequired() : s)).when("status", (v, s) => (v !== RS_PAYMENT_STATUS[3] ? s.notRequired() : s)),
      breakpoints: { xs: 6 }
    },
    iban: {
      type: "text",
      label: "Receiver IBAN",
      defaultValue: "",
      validator: Yup.string().min(5).max(23).required("Required").when("mode", (v, s) => (v !== "bank" ? s.notRequired() : s)).when("status", (v, s) => (v !== RS_PAYMENT_STATUS[3] ? s.notRequired() : s)),
      breakpoints: { xs: 6 }
    }
  }


};

export default resellerPaymentUpdate;
