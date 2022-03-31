import React, { useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'

import Form from './Form'
import { Button } from './index'

const INITIAL_PROPS = {
  open: false,
  title: '',
  subtitle: '',
  formProps: null,
  callback: null,
}
let setState = null
export const prompt = (title, subtitle, arg3) => {
  const state = { open: true, title, subtitle }
  if (typeof arg3 === 'function') state.callback = arg3
  if (typeof arg3 === 'object' && arg3) state.formProps = arg3
  setState(state)

  return { close: () => setState(cloneDeep(INITIAL_PROPS)) }
}

function Prompt() {
  const [state, _setState] = useState(cloneDeep(INITIAL_PROPS))
  setState = values => _setState({ ...state, ...values })

  const handleClose = () => setState(cloneDeep(INITIAL_PROPS))

  const submitHandler = async values => {
    const submitHandler = state.formProps?.submitHandler
    if (submitHandler) await submitHandler(values)
    handleClose()
  }

  const actionHandler = async intent => {
    const callback = state.callback
    if (callback) await callback(intent)
    handleClose()
  }

  return (
    <>
      <Dialog open={state.open} onClose={handleClose}>
        {state.title && <DialogTitle>{state.title}</DialogTitle>}
        <DialogContent>
          {state.subtitle && <DialogContentText>{state.subtitle}</DialogContentText>}

          {state.formProps && (
            <Form
              selfDisabled={state?.formProps?.selfDisabled || true}
              formConfig={state.formProps.formConfig}
              incomingValue={state.formProps.incomingValue}
              submitHandler={submitHandler}
              cancelHandler={handleClose}
            />
          )}
        </DialogContent>
        {!state.formProps && (
          <DialogActions>
            <Box display="flex" justifyContent="flex-end">
              <Box mr={2}>
                <Button size="small" color="error"  variant='outlined' onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
              <Box>
                <Button variant='outlined' size="small" onClick={() => actionHandler(true)}>
                  OK
                </Button>
              </Box>
            </Box>
          </DialogActions>
        )}
      </Dialog>
    </>
  )
}

export default Prompt
