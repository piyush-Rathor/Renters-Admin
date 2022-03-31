import { createStore, combineReducers } from 'redux'

import appReducer from './reducers/app'
import authReducer from './reducers/auth'
import arrayReducers from './reducers/arrayReducers'
import objectReducers from './reducers/objectReducers'

const store = createStore(
  combineReducers({
    app: appReducer,
    auth: authReducer,
    ...arrayReducers,
    ...objectReducers,
  }),
  process.env.NODE_ENV === 'development' &&
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store
