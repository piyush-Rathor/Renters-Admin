import get from 'lodash/get'

export const PERMISSION_CODES = {
  supplier: ['VIEW', 'CREATE', 'UPDATE'],
  reseller: ['VIEW', 'UPDATE'],
  category: ['VIEW', 'CREATE', 'UPDATE'],
  subcategory: ['VIEW', 'CREATE', 'UPDATE'],
  subSubcategory: ['VIEW', 'CREATE', 'UPDATE'],
  collection: ['VIEW', 'CREATE', 'UPDATE'],
  product: ['VIEW', 'CREATE', 'UPDATE'],
  advertisement: ['VIEW', 'CREATE', 'UPDATE'],
  advertisementBanners: ['VIEW', 'CREATE', 'UPDATE'],
  order: ['VIEW', 'UPDATE','CREATE'],
  settings: ['VIEW', 'UPDATE'],
  superuser: ['VIEW', 'CREATE', 'UPDATE'],
  resellerPayment: ['VIEW', 'CREATE', 'UPDATE'],
  supplierPayment: ['VIEW', 'CREATE', 'UPDATE'],
  bonus: ['VIEW', 'CREATE', 'UPDATE'],
  coupon: ['VIEW', 'CREATE', 'UPDATE'],
}

export const getPermissions = (PERMISSIONS, entity) => {
  return get(PERMISSIONS, entity, [])
}
