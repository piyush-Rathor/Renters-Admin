const LOGIN = 'LOGIN'
const UPDATE_USER = 'UPDATE_USER'
const LOGOUT = 'LOGOUT'

export const login = payload => ({ type: LOGIN, payload })
export const updateUser = payload => ({ type: UPDATE_USER, payload })
export const logout = () => ({ type: LOGOUT })

const INITIAL_AUTH_STATE = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  user: JSON.parse(localStorage.getItem('user')),
}

const authReducer = (state = INITIAL_AUTH_STATE, action) => {
  switch (action.type) {
    case LOGIN:
      localStorage.setItem('isLoggedIn', true)
      localStorage.setItem('user', JSON.stringify(action.payload))
      return { ...state, isLoggedIn: true, user: action.payload }
    case UPDATE_USER:
      localStorage.setItem('isLoggedIn', true)
      const user = { ...action.payload, token: state.user.token }
      localStorage.setItem('user', JSON.stringify(user))
      return { ...state, isLoggedIn: true, user }
    case LOGOUT:
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      return { ...state, isLoggedIn: false, user: null }
    default:
      return { ...state }
  }
}

export default authReducer
