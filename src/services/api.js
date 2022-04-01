import Axios from 'axios'
import { toast } from 'react-toastify'
import config from '../constants/config'

Axios.defaults.baseURL = config.API_URL

export const uploadFile = file => {
  var formData = new FormData()
  formData.append('asset', file)
  return Axios.post('/assets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`,
    },
  }).then(response => response.data)
}

const request = async({ method = 'get', url, data, params, extra }) => {
    try{
      const config = { url, method, ...extra }
      const token = localStorage.getItem('token')
      if (token) config.headers = { Authorization: `${token}` }
      if (!['GET', 'get'].includes(method) && data) config.data = data
      if (params) config.params = params
      const resp=await Axios({ ...config })
      return resp.data
    }catch(e){
throw e.response.data
    }
}

export const login = async ({ email, password }) => {
  return request({
    method: 'post',
    url: '/admin/auth',
    data: { email, password },
  })
}

export const getUsers = async () => {
  return request({
    url: '/admin/tenats',
  })
}

export const getTanent=async(id)=>{
  return request({
    url: `/admin/${id}/tenant`,
  })
}

export const resetPasswordRequest = ({ email }) => {
  return request({
    method: 'post',
    url: '/superusers/reset-password-request',
    data: { email },
  })
}

export const resetPassword = ({ email, resetPasswordRequestId, password, isSuperAdmin }) => {
  return request({
    method: 'post',
    url: '/superusers/reset-password',
    data: { email, resetPasswordRequestId, password, isSuperAdmin },
  })
}

export const checkLogin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return request({ url: '/superusers/' + user._id })
}

export const createSupplier = data => {
  return request({ method: 'post', url: '/suppliers', data })
}

export const updateSupplier = (_id, data) => {
  return request({ method: 'patch', url: '/suppliers/' + _id, data })
}

export const updateReseller = (_id, data) => {
  const { phone, ...payload } = data
  return request({ method: 'patch', url: '/resellers/' + _id, data: payload })
}

export const createCategory = data => {
  return request({ method: 'post', url: '/categories', data })
}

export const updateCategory = (_id, data) => {
  return request({ method: 'patch', url: '/categories/' + _id, data })
}

export const createSubcategory = data => {
  return request({ method: 'post', url: '/subcategories', data })
}

export const updateSubcategory = (_id, data) => {
  return request({ method: 'patch', url: '/subcategories/' + _id, data })
}

export const createSubSubcategory = data => {
  return request({ method: 'post', url: '/sub-subcategories', data })
}

export const updateSubSubcategory = (_id, data) => {
  return request({ method: 'patch', url: '/sub-subcategories/' + _id, data })
}

export const createCollection = data => {
  return request({ method: 'post', url: '/collections', data })
}

export const updateCollection = (_id, data) => {
  return request({ method: 'patch', url: '/collections/' + _id, data })
}

export const createProduct = data => {
  return request({ method: 'post', url: '/products', data })
}

export const updateProduct = (_id, data) => {
  return request({ method: 'patch', url: '/products/' + _id, data })
}

export const createAdvertisement = data => {
  return request({ method: 'post', url: '/advertisements', data })
}

export const updateAdvertisement = (_id, data) => {
  return request({ method: 'patch', url: '/advertisements/' + _id, data })
}

export const deleteAdvertisement = _id => {
  return request({ method: 'delete', url: '/advertisements/' + _id })
}

export const deleteCoupon = _id => {
  return request({ method: 'delete', url: '/coupons/' + _id })
}

export const createAdvertisementBanner = data => {
  return request({ method: 'post', url: '/advertisement-banners', data })
}

export const updateAdvertisementBanner = (_id, data) => {
  return request({ method: 'patch', url: '/advertisement-banners/' + _id, data })
}

export const deleteAdvertisementBanner = _id => {
  return request({ method: 'delete', url: '/advertisement-banners/' + _id })
}

export const deleteReferral = _id => {
  return request({ method: 'delete', url: '/referral-network/' + _id })
}

export const addReferralNetwork = (_id, data) => {
  return request({ method: 'patch', url: '/referral-network/' + _id, data })
}

export const createOrder = data => {
  return request({ method: 'post', url: '/orders', data })
}
export const updateOrder = (_id, data) => {
  return request({ method: 'patch', url: '/orders/' + _id, data })
}

export const updatePayment = (_id, data) => {
  return request({ method: 'patch', url: '/payments/' + _id, data })
}

export const createSuperuser = data => {
  return request({ method: 'post', url: '/superusers', data })
}

export const updateSuperuser = (_id, data) => {
  return request({ method: 'patch', url: '/superusers/' + _id, data })
}

export const updateSettings = data => {
  return request({ method: 'patch', url: '/cms/settings', data })
}

export const updateResellerPayment = (ids, values) => {
  return request({ method: 'patch', url: '/payments/reseller', data: { ids, ...values } })
}

export const updateSupplierPayment = (ids, values) => {
  return request({ method: 'patch', url: '/payments/supplier', data: { ids, ...values } })
}

export const createResellerBank = (resellerId, values) =>
  request({ method: 'post', url: `/resellers/bank/${resellerId}`, data: { ...values } })

export const updateResellerBank = (resellerId, bankId, values) =>
  request({ method: 'patch', url: `/resellers/bank/${resellerId}/${bankId}`, data: { ...values } })

export const createSupplierBank = (supplierId, values) =>
  request({ method: 'post', url: `/suppliers/bank/${supplierId}`, data: { ...values } })

export const updateSupplierBank = (supplierId, bankId, values) =>
  request({ method: 'patch', url: `/suppliers/bank/${supplierId}/${bankId}`, data: { ...values } })

export const updateBonus = data => {
  return request({ method: 'post', url: '/bonus-settings/', data })
}

export const createCoupon = data => {
  return request({ method: 'post', url: '/coupons', data })
}
export const updateCoupon = (_id, data) => {
  return request({ method: 'patch', url: '/coupons/' + _id, data })
}

export const get = {
  allSuppliers: ({ params }) => {
    return request({ url: '/allSuppliers', params })
  },
  suppliers: ({ params }) => {
    return request({ url: '/suppliers', params })
  },
  supplier: _id => {
    return request({ url: '/suppliers/' + _id })
  },
  resellers: ({ params }) => {
    return request({ url: '/resellers', params })
  },
  reseller: _id => {
    return request({ url: '/resellers/' + _id })
  },
  referralNetwork: ({ params }) => {
    return request({ url: '/referral-network/' + params.id, params })
  },
  categories: (params = {}) => {
    return request({ url: '/categories', params })
  },
  subcategories: (params = {}) => {
    return request({ url: '/subcategories', params })
  },
  subSubcategories: (params = {}) => {
    return request({ url: '/sub-subcategories', params })
  },
  allCollections: ({ params }) => {
    return request({ url: '/allCollections', params })
  },
  allCategories: ({ params }) => {
    return request({ url: '/allCategories', params })
  },
  allSubcategories: ({ params }) => {
    return request({ url: '/allSubcategories', params })
  },
  collections: ({ params }) => {
    return request({ url: '/collections', params })
  },
  collection: _id => {
    return request({ url: '/collections/' + _id })
  },
  allProducts: ({ params }) => {
    return request({ url: '/allProducts', params })
  },
  products: ({ params }, extra) => {
    return request({ url: '/products', params, extra })
  },
  product: _id => {
    return request({ url: '/products/' + _id })
  },
  advertisements: ({ params }) => {
    return request({ url: '/advertisements', params })
  },
  advertisementBanners: ({ params }) => {
    return request({ url: '/advertisement-banners', params })
  },
  orders: ({ params }) => {
    return request({ url: '/orders', params })
  },
  orderReport: ({ params }) => {
    return request({ url: '/reports/order', params })
  },
  order: _id => {
    return request({ url: '/orders/' + _id })
  },
  superusers: ({ params }) => {
    return request({ url: '/superusers', params })
  },
  superuser: _id => {
    return request({ url: '/superusers/' + _id })
  },
  settings: () => {
    return request({ url: '/cms/settings' })
  },
  supplierProfile: _id => {
    return request({ url: '/website/pages/supplier?supplierId=' + _id })
  },
  resellerPayment: ({ params }) => request({ url: '/payments/reseller', params }),
  supplierPayment: ({ params }) => request({ url: '/payments/supplier', params }),
  bonus: _id => {
    return request({ url: '/bonus/' + _id })
  },
  bonuses: ({ params }) => request({ url: '/bonus-details', params }),

  bonusSettings: ({ params }) => request({ url: '/bonus-settings', params }),

  coupon: _id => {
    return request({ url: '/coupons/' + _id })
  },
  coupons: ({ params }) => request({ url: '/coupons', params }),

  resellerPaymentDetail: (_id, status, transactionDate) =>
    request({ url: `/payments/reseller/${_id}/${status}${transactionDate ? `/${transactionDate}` : ''}` }),
  sendEmail: (_id, status, transactionId, isReferralBonus, transactionDate) =>
    request({
      url: `/payments/reseller/${_id}/${status}${
        transactionId ? `/${transactionId}` : ''
      }/${transactionDate}?shouldSendMail=true${isReferralBonus ? `&referralBonus=true` : ''}`,
    }),
  supplierPaymentDetail: (_id, status, transactionDate) =>
    request({ url: `/payments/supplier/${_id}/${status}${transactionDate ? `/${transactionDate}` : ''}` }),

  allowedReferralReseller: _id => request({ url: '/allowed-referral-resellers/' + _id }),
}
