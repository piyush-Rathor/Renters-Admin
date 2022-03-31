import * as Yup from "yup";

const addSupplier = {
  _type: "object",

  cover: {
    type: "file",
    label: "Cover",

    defaultValue: "",
    validator: Yup.mixed(),

    breakpoints: { xs: 7 }
  },
  logo: {
    type: "file",
    label: "Logo",

    defaultValue: "",
    validator: Yup.mixed(),

    breakpoints: { xs: 5 }
  },
  humanFriendlyId: {
    type:"text",
    label: "Supplier Id",
    disabled: true,
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(backTracePath(currentPath)).name === ''
    },
    breakpoints: { xs: 12 },
  },
  name: {
    type: "text",
    label: "Supplier name",

    defaultValue: "",
    validator: Yup.string().max(64, "Too long!").required("Required"),

    breakpoints: { xs: 6 }
  },
  email: {
    type: "email",
    label: "Email",

    defaultValue: "",
    validator: Yup.string().email("Invalid email").required("Required"),

    breakpoints: { xs: 6 }
  },
  contactPerson: {
    _type: "object",
    _label: "Contact Person",

    firstName: {
      type: "text",
      label: "First Name",

      defaultValue: "",
      validator: Yup.string().max(64, "Too long!").required("Required"),

      breakpoints: { xs: 4 }
    },
    lastName: {
      type: "text",
      label: "Last Name",

      defaultValue: "",
      validator: Yup.string().max(64, "Too long!"),

      breakpoints: { xs: 3 }
    },
    email: {
      type: "email",
      label: "Email",

      defaultValue: "",
      validator: Yup.string().email("Invalid email"),

      breakpoints: { xs: 5 }
    },
    phone: {
      _type: "object",
      _label: "Phone",
      countryCode: {
        type: "select",
        label: "Country Code",
        options: [
          { label: "+971 UAE", value: "+971" },
          // { label: "+91 India", value: "+91" }
        ],
        disabled: true,
        defaultValue: "+971",
        onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
          setFieldValue(backTracePath(currentPath, "areaCode"), "");
        },
        validator: Yup.string().label("Country code"),
        breakpoints: { xs: 3 }
      },
      areaCode: {
        type: 'text',
        label: 'Area Code',
        defaultValue: '',
        validator: Yup.string().matches(/^[0-9]/g,'Please provide valid phone number'),
        _hide: (currentPath, { backTracePath, getValueAtPath }) => {
          return getValueAtPath(backTracePath(currentPath)).countryCode !== '+971'
        },
        breakpoints: { xs: 3 },
      },
      number: {
        type: 'text',
        label: 'Phone',
        defaultValue: '',
        validator: Yup.string().matches(/^[0-9]/g,'Please provide valid phone number').min(7,"Please provide valid phone number").max(7, 'Please provide valid phone number'),
        breakpoints: { xs: 6 },
      }
    }
  },
  address: {
    type: "address",
    label: "Address",

    defaultValue: "",
    validator: Yup.object().required("Required"),

    breakpoints: { xs: 12 }
  }

  // TODO bank details
};

export default addSupplier;
