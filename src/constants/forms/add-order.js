import * as Yup from "yup";
import { getDiscountedPrice, getErfaPrice } from "../../utils";
import { toast } from "react-toastify";

const getValues = getValueAtPath => {
  const sizes = getValueAtPath(["allSize"]);
  const supplierPrice = getValueAtPath(["supplierPrice"]);
  const discountType = getValueAtPath(["discountType"]);
  const discount = getValueAtPath(["discount"]);
  const platformMarginType = getValueAtPath(["platformMarginType"]);
  const platformMargin = getValueAtPath(["platformMargin"]);
  const shippingFee = getValueAtPath(["shippingFee"]);
  const resellerMargin = getValueAtPath(["resellerMargin"]);
  const quantity = getValueAtPath(["quantity"]);
  return {
    quantity,
    supplierPrice,
    sizes,
    shippingFee,
    discountType,
    discount,
    platformMarginType,
    platformMargin,
    resellerMargin
  };
};

const saveAtLocalStorage = (data) => {
  let lastData = JSON.parse(localStorage.getItem("add-order-admin"));
  localStorage.setItem("add-order-admin", JSON.stringify({
    ...lastData,
    customer: { phone: { countryCode: "+971" } ,...lastData?.customer || {} }, ...data
  }));
};

const addOrder = {
  _type: "object",

  productCode: {
    variant: "outlined",
    type: "text",
    label: "Product Id",

    defaultValue: "",
    validator: Yup.string()
      .uppercase()
      .length(6)
      .matches(/^[A-Z0-9]+$/, "Invalid code!"),
    disabled: true,
    breakpoints: { xs: 4 }
  },
  name: {
    type: "text",
    label: "Product name",
    disabled: true,
    defaultValue: "",
    validator: Yup.string().max(64, "Too long!").required("Required"),

    breakpoints: { xs: 7 }
  },
  supplierPrice: {
    type: "currency",
    label: "Supplier Price",
    disabled: true,
    defaultValue: "",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { platformMarginType, platformMargin } = getValues(getValueAtPath);
      setFieldValue("erfaPrice", getErfaPrice(currentValue, platformMarginType, platformMargin) || "");
    },
    validator: Yup.number().positive().required("Required"),

    breakpoints: { xs: 6 }
  },

  platformMarginType: {
    type: "select",
    label: "Platform Margin Type",
    options: [
      { label: "Fixed", value: "Fixed" },
      { label: "Percentage", value: "Percentage" }
    ],
    disabled: true,
    defaultValue: "Percentage",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMargin } = getValues(getValueAtPath);
      setFieldValue("erfaPrice", getErfaPrice(supplierPrice, currentValue, platformMargin) || "");
      setFieldValue(["platformMargin"], "");
    },
    validator: Yup.string().required("Required"),

    breakpoints: { xs: 4 }
  },
  platformMargin: {
    type: "number",
    label: "Platform Margin",
    disabled: true,
    defaultValue: 0,
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType } = getValues(getValueAtPath);
      setFieldValue("erfaPrice", getErfaPrice(supplierPrice, platformMarginType, currentValue) || "");
    },
    validator: Yup.number()
      .required("Required")
      .when("platformMarginType", (t, schema) => {
        if (t === "Percentage") return schema.positive().min(0).max(100);
        if (t === "Fixed")
          schema.test(
            "is-less-than-supplier-price",
            "Platform Margin can not be greater than product supplier price",
            (platformMargin, context) => (platformMargin || 0) <= (context.parent.supplierPrice || 0)
          );
        return schema;
      }),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !getValueAtPath(["platformMarginType"]);
    },
    breakpoints: { xs: 3 }
  },
  erfaPrice: {
    type: "currency",
    label: "ERFA Price",
    disabled: true,

    defaultValue: "",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discountType, discount, platformMarginType, platformMargin } = getValues(
        getValueAtPath
      );
      setFieldValue(
        "discountedPrice",
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount) || ""
      );
    },
    _getInitialValue: (currentPath, expectedValue, { backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType, platformMargin } = getValues(getValueAtPath);
      return getErfaPrice(supplierPrice, platformMarginType, platformMargin) || "";
    },
    validator: Yup.number().positive().required("Required"),

    breakpoints: { xs: 5 }
  },

  discountType: {
    type: "select",
    label: "Discount Type",
    options: [
      { label: "Fixed", value: "Fixed" },
      { label: "Percentage", value: "Percentage" }
    ],
    disabled: true,
    defaultValue: "Percentage",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discount, platformMarginType, platformMargin } = getValues(getValueAtPath);
      setFieldValue(
        "discountedPrice",
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, currentValue, discount) || ""
      );
      setFieldValue(["discount"], "");
    },
    validator: Yup.string().required("Required"),

    breakpoints: { xs: 4 }
  },
  discount: {
    type: "number",
    label: "Discount",
    disabled: true,
    defaultValue: 0,
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      const { supplierPrice, discountType, platformMarginType, platformMargin } = getValues(getValueAtPath);
      setFieldValue(
        "discountedPrice",
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, currentValue) ||
        ""
      );
    },
    validator: Yup.number()
      .required("Required")
      .when("discountType", (t, schema) => {
        if (t === "Percentage") return schema.positive().min(0).max(100);
        if (t === "Fixed")
          schema.test(
            "is-less-than-supplier-price",
            "Discount can not be greater than product supplier price",
            (discount, context) => (discount || 0) <= (context.parent.supplierPrice || 0)
          );
        return schema;
      }),

    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return !getValueAtPath(["discountType"]);
    },
    breakpoints: { xs: 3 }
  },

  discountedPrice: {
    type: "currency",
    label: "Discounted Price",
    disabled: true,

    defaultValue: "",
    _getInitialValue: (currentPath, expectedValue, { backTracePath, getValueAtPath }) => {
      const { supplierPrice, platformMarginType, platformMargin, discountType, discount } = getValues(
        getValueAtPath
      );
      return (
        getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount) || ""
      );
    },
    validator: Yup.number()
      .positive()
      .required("Required")
      .test(
        "is-less-than--supplier-price",
        "Discounted Price can not be less than supplier price",
        (v, context) => (v || 0) >= (context.parent.supplierPrice || 0)
      ),

    breakpoints: { xs: 5 }
  },
  eligibleForFreeShipping: {
    type: "checkbox",
    label: "Eligible for Free Shipping?",
    disabled: true,
    defaultValue: false,
    validator: Yup.boolean().required("Required"),

    breakpoints: { xs: 12 }
  },
  sizes: {
    _type: "array",
    _label: "Sizes and Availability",
    _hide: () => true,
    size: {
      type: "text",
      label: "Size",

      defaultValue: "",
      validator: Yup.string().label("Size").required(),

      breakpoints: { xs: 4 }
    },
    stock: {
      type: "number",
      label: "Stock",

      defaultValue: "",
      validator: Yup.number().min(0).integer().label("Stock").required("Required"),

      breakpoints: { xs: 3 }
    }
  },

  size: {
    type: "select",
    label: "Size",
    defaultValue: "",
    options: (currentPath, { backTracePath, getValueAtPath }) => {
      let sizes = getValueAtPath(["sizes"]);
      return sizes && sizes.length ? sizes.filter(s => s.stock > 0).map(s => {
        return { label: s.size, value: s.size };
      }) : [];
    },
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ size: currentValue });
      setFieldValue("quantity", 0);
      setFieldValue("shippingFee", 0);
      setFieldValue("resellerMargin", 0);
    },
    validator: Yup.string().label("Size").required(),
    breakpoints: { xs: 6 }
  },
  quantity: {
    type: "number",
    label: "Quantity",
    defaultValue: 0,
    validator: Yup.number().min(1).integer().label("Quantity").required("Required"),
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ quantity: currentValue });
      let size = getValueAtPath(["size"]);
      let sizes = getValueAtPath(["sizes"]);
      setFieldValue("shippingFee", 0);
      setFieldValue("resellerMargin", 0);
      let s = sizes.find(s => s.size === size);
      const {
        discountType,
        shippingFee,
        resellerMargin,
        platformMargin,
        supplierPrice,
        discount,
        platformMarginType
      } = getValues(getValueAtPath);
      let discountedPrice = getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount);
      if (s && currentValue > s.stock) {
        toast.error(`Sorry we have only ${s.stock} item left!!`);
        setFieldValue("quantity", s.stock);
        setFieldValue(
          "orderTotal",
          Number(((discountedPrice) * (s.stock)) + (resellerMargin || 0) + (shippingFee || 0)).toFixed(2).toString().replace(/\.00$/, "") ||
          ""
        );
      } else {
        setFieldValue(
          "orderTotal",
          Number(((discountedPrice) * (currentValue)) + (resellerMargin || 0) + (shippingFee || 0)).toFixed(2).toString().replace(/\.00$/, "") ||
          ""
        );
      }

    },
    breakpoints: { xs: 6 }
  },
  shippingFee: {
    type: "number",
    label: "Shipping Fee",
    defaultValue: 0,
    validator: Yup.number().min(0).integer().label("Shipping Fee").required("Required"),
    _hide: (currentPath, { backTracePath, getValueAtPath }) => {
      return getValueAtPath(["eligibleForFreeShipping"]);
    },
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ shippingFee: currentValue });
      setFieldValue("resellerMargin", 0);
      const {
        discountType,
        resellerMargin,
        platformMargin,
        supplierPrice,
        quantity,
        discount,
        platformMarginType
      } = getValues(getValueAtPath);
      let discountedPrice = getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount);
      setFieldValue(
        "orderTotal",
        Number(((discountedPrice) * (quantity)) + (resellerMargin || 0) + (currentValue)).toFixed(2).toString().replace(/\.00$/, "") ||
        ""
      );
    },
    breakpoints: { xs: 6 }
  },
  resellerMargin: {
    type: "number",
    label: "Reseller Margin",
    defaultValue: 0,
    validator: Yup.number().min(0).integer().label("Reseller Margin").required("Required"),
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ resellerMargin: currentValue });
      const {
        discountType,
        resellerMargin,
        platformMargin,
        supplierPrice,
        quantity,
        discount,
        shippingFee,
        platformMarginType
      } = getValues(getValueAtPath);
      let discountedPrice = getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount);
      setFieldValue(
        "orderTotal",
        Number((discountedPrice) * (quantity) + (shippingFee || 0) + (currentValue)).toFixed(2).toString().replace(/\.00$/, "") ||
        ""
      );
    },
    breakpoints: { xs: 6 }
  },
  orderTotal: {
    type: "number",
    label: "Order Total",
    disabled: true,
    defaultValue: "",
    breakpoints: { xs: 6 }
  },
  lastOrder: {
    type: "text",
    label: "Previous Order Id",
    defaultValue: "",
    validator: Yup.string().required("Required"),
    breakpoints: { xs: 6 },
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ lastOrder: currentValue });
    }
  },
  reseller: {
    type: "text",
    label: "Reseller Id",
    defaultValue: "",
    validator: Yup.string().max(64, "Too long!").required("Required"),
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ reseller: currentValue });
    },
    breakpoints: { xs: 12 }
  },
  customer: {
    _type: "object",
    _label: "Customer Details",
    name: {
      type: "text",
      label: "Customer name",

      defaultValue: "",
      validator: Yup.string().max(64, "Too long!").required("Required"),
      onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
        let lastData = JSON.parse(localStorage.getItem("add-order-admin"));
        saveAtLocalStorage({ customer: { ...lastData?.customer, name: currentValue } });
      },
      breakpoints: { xs: 12 }
    },
    phone: {
      _type: "object",
      _label: "Phone",

      countryCode: {
        type: "select",
        label: "Country Code",
        options: [
          { label: "+971 UAE", value: "+971" },
          { label: "+91 India", value: "+91" }
        ],
        disabled: true,

        defaultValue: "+971",
        onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
          let lastData = JSON.parse(localStorage.getItem("add-order-admin"));
          saveAtLocalStorage({
            customer: {
              ...lastData?.customer,
              phone: { ...lastData.customer.phone, countryCode: currentValue }
            }
          });
          setFieldValue(backTracePath(currentPath, "areaCode"), "");
        },
        validator: Yup.string().label("Country code").required("Required"),

        breakpoints: { xs: 3 }
      },
      areaCode: {
        type: "number",
        label: "Area Code",

        defaultValue: "",
        validator: Yup.string()
          .required("Required")
          .when("countryCode", (v, s) => (v === "+91" ? s.notRequired() : s)),
        onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
          let lastData = JSON.parse(localStorage.getItem("add-order-admin"));
          saveAtLocalStorage({
            customer: {
              ...lastData?.customer,
              phone: { ...lastData.customer.phone, areaCode: currentValue }
            }
          });
        },
        /*_hide: (currentPath, { backTracePath, getValueAtPath }) => {
          return getValueAtPath(backTracePath(currentPath)).countryCode !== "+971";
        },*/
        breakpoints: { xs: 3 }
      },
      number: {
        type: "number",
        label: "Phone",

        defaultValue: "",
        validator: Yup.string().min(7, "Must be exactly 7 digits").max(7, "Must be exactly 7 digits").required("Required"),
        onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
          let lastData = JSON.parse(localStorage.getItem("add-order-admin"));
          saveAtLocalStorage({
            customer: {
              ...lastData?.customer,
              phone: { ...lastData.customer.phone, number: currentValue }
            }
          });
        },
        breakpoints: { xs: 6 }
      }
    }
  },
  shippingAddress: {
    type: "address",
    label: "Address",
    onChange: (currentPath, currentValue, { setFieldValue, backTracePath, getValueAtPath }) => {
      saveAtLocalStorage({ shippingAddress: currentValue });
    },
    defaultValue: "",
    validator: Yup.object().required("Required"),

    breakpoints: { xs: 12 }
  }
};

export default addOrder;
