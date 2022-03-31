import cloneDeep from 'lodash/cloneDeep'

const entities = [
  'suppliers',
  'resellers',
  'collections',
  'products',
  'advertisements',
  'advertisementBanners',
  'orders',
  'superusers',
  'settings',
  'resellerPayment',
  'supplierPayment',
  'bonuses',
  'coupons',
  'referralNetwork',
]

const getType = (entity, type) => {
  const action = ['SET', entity]
  if (type === 'updateObject') action[0] = 'UPDATE'
  if (type === 'resetObject') action[0] = 'RESET'
  return action.join('_').toUpperCase()
}

export const setObject = (entity, payload) => ({ type: getType(entity, 'setObject'), payload })
export const updateObject = (entity, payload) => ({ type: getType(entity, 'updateObject'), payload })
export const resetObject = (entity, payload) => ({ type: getType(entity, 'resetObject'), payload })

const INITIAL_STATE = {
  items: null,
  limit: 10,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  refreshCount: 0,
  filters: {},
}
const getReducer = entity => (state = cloneDeep(INITIAL_STATE), action) => {
  switch (action.type) {
    case getType(entity, 'setObject'): {
      return cloneDeep(action.payload)
    }
    case getType(entity, 'updateObject'): {
      const newState = { ...cloneDeep(state), ...action.payload };
      newState.items = action.payload.items;
      return newState;
    }
    case getType(entity, 'resetObject'): {
      return cloneDeep(INITIAL_STATE)
    }

    default: {
      return cloneDeep(state)
    }
  }
}

const objectReducers = {}
entities.forEach(entity => {
  objectReducers[entity] = getReducer(entity)
})

export default objectReducers
