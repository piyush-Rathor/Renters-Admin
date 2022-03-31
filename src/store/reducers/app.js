const TOGGLE_PROCESS_INDICATOR = 'TOGGLE_PROCESS_INDICATOR'

export const toggleProcessIndicator = (show = false) => ({ type: TOGGLE_PROCESS_INDICATOR, payload: show })

const INITIAL_APP_STATE = { showProcessIndicator: false }

const appReducer = (state = INITIAL_APP_STATE, action) => {
  switch (action.type) {
    case TOGGLE_PROCESS_INDICATOR:
      return { ...state, showProcessIndicator: action.payload }
    default:
      return { ...state }
  }
}

export default appReducer
