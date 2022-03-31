import React, { createContext, useState } from 'react'
import { Dialog, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import Form from './Form'

export const PromptContext = createContext({})
function PromptProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [state, _setState] = useState({ title: '', subtitle: '', formConfig: null, callback: null })
  const setState = values => _setState({ ...state, ...values })

  const handleOpen = (title, subtitle, formConfig, callback) => {
    setOpen(true)
    setState({ title, subtitle, formConfig, callback })
  }

  const handleClose = () => {
    setState({ title: '', subtitle: '', formConfig: null })
    setOpen(false)
  }

  const submitHandler = values => {
    const callback = state.callback
    handleClose()
    if (callback) callback(values)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        {state.title && <DialogTitle>{state.title}</DialogTitle>}
        <DialogContent>
          {state.subtitle && <DialogContentText>{state.subtitle}</DialogContentText>}

          {state.formConfig && <Form formConfig={state.formConfig} submitHandler={submitHandler} cancelHandler={handleClose} />}
        </DialogContent>
      </Dialog>

      <PromptContext.Provider value={{ Prompt: handleOpen }}>{children}</PromptContext.Provider>
    </>
  )
}

export default PromptProvider
