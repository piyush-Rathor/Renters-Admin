import cloneDeep from 'lodash/cloneDeep'

const entities = ['categories:category', 'subcategories:subcategory', 'sub-subcategories:sub-subcategory']

export const getEntity = index => entities[index].split(':')[0]

const getType = (entity, type) => {
  const action = ['SET', entity]
  if (type === 'updateItem') action[0] = 'UPDATE'
  if (type === 'deleteItem') action[0] = 'DELETE'
  if (type !== 'setArray') action[1] = entities.filter(e => e.includes(entity))[0].split(':')[1]
  return action.join('_').toUpperCase()
}

export const setArray = (entity, payload) => ({ type: getType(entity, 'setArray'), payload })
export const setItem = (entity, payload) => ({ type: getType(entity, 'setItem'), payload })
export const updateItem = (entity, payload) => ({ type: getType(entity, 'updateItem'), payload })
export const deleteItem = (entity, payload) => ({ type: getType(entity, 'deleteItem'), payload })

const getReducer = entity => (state = null, action) => {
  switch (action.type) {
    case getType(entity, 'setArray'): {
      return cloneDeep(action.payload)
    }
    case getType(entity, 'setItem'): {
      const clonedState = cloneDeep(state)
      return [action.payload, ...clonedState]
    }
    case getType(entity, 'updateItem'): {
      const clonedState = cloneDeep(state)
      const itemIndex = clonedState.findIndex(c => c._id === action.payload._id)
      if (itemIndex !== -1) clonedState[itemIndex] = { ...clonedState[itemIndex], ...action.payload }
      return clonedState
    }
    case getType(entity, 'deleteItem'): {
      const clonedState = cloneDeep(state)
      return clonedState.filter(c => c._id !== action.payload._id)
    }

    default: {
      return cloneDeep(state)
    }
  }
}

const arrayReducers = {}
entities.forEach(e => {
  const entity = e.split(':')[0]
  arrayReducers[entity] = getReducer(entity)
})

export default arrayReducers
