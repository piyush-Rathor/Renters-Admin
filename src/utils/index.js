
export const formatCurrency = currency =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
  }).format(currency)

export const getPhoneString = phone =>
  [phone?.countryCode, phone?.areaCode, phone?.number].filter(Boolean).join(' ')

/* cSpell:disable */
export const getShippingFee = (from = 'default', to = 'default') => {
  const feeStructure = {
    dubai: {
      dubai: 15,
      sharjah: 15,
      ajman: 20,
      'abu dhabi': 20,
      default: 25,
    },
    'abu dhabi': {
      'abu dhabi': 15,
      default: 25,
    },
    sharjah: {
      dubai: 15,
      sharjah: 15,
      ajman: 15,
      default: 25,
    },
    ajman: {
      dubai: 20,
      sharjah: 15,
      ajman: 15,
      default: 25,
    },
    default: {
      default: 25,
    },
  }

  const _from = feeStructure[from.toLowerCase()] || feeStructure['default']
  return _from[to.toLowerCase()] || _from['default']
}

export const getErfaPrice = (supplierPrice, platformMarginType, platformMargin) => {
  return (
    supplierPrice +
    (platformMarginType === 'Percentage' ? (supplierPrice * platformMargin) / 100 : platformMargin)
  )
}

export const getDiscountedPrice = (
  supplierPrice,
  platformMarginType,
  platformMargin,
  discountType,
  discount
) => {
  const erfaPrice = getErfaPrice(supplierPrice, platformMarginType, platformMargin)
  return erfaPrice - (discountType === 'Percentage' ? (erfaPrice * discount) / 100 : discount)
}

export const getCouponDiscountedPrice = (price, coupons = null) => {
  if (coupons) {
    let coupontDiscount = (coupons.discountType === 'Percentage' ? (price * coupons.discount) / 100 : coupons.discount)
    if (coupontDiscount >= price) {
      coupontDiscount = price
    }
    return coupontDiscount
  }
  return 0
}

const blobToBase64 = blob => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};

export const downloadPDFBlob = async blob => {
  // It is necessary to create a new blob object with mime-type explicitly set
  // otherwise only Chrome works like it should
  // const base64 = await blobToBase64(blob)
  var newBlob = new Blob([blob], { type: "application/pdf" })

  // IE doesn't allow using a blob object directly as link href
  // instead it is necessary to use msSaveOrOpenBlob
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(newBlob);
    return;
  }

  // For other browsers: 
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(newBlob);
  var link = document.createElement('a');
  link.href = data;
  link.download = "file.pdf";
  link.click();
  setTimeout(function () {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
  }, 100);
}

export const isValidateDateRange = (startDate, endDate) => {
  if(!startDate || !endDate) return true
  if (new Date(startDate) > new Date(endDate)) {
    return false
  }
  return true
}
