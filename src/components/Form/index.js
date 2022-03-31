import React, { useState, createContext, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import _get from 'lodash/get'
import _set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import { Formik, FieldArray } from 'formik'
import DateFnsUtils from '@date-io/date-fns'
import { toast } from 'react-toastify'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import { Grid, Typography, Box, makeStyles } from '@material-ui/core'

import Icons from '../../constants/icons'
import FormSchema from './form.schema'
import { uploadFile } from '../../services/api'

import { Button, Dialog, Loader } from '../index'
import Inputs from './Inputs'

export const removeFalsyFieldsRecursive = (incomingVal, action = 'SET_NULL') => {
  if (incomingVal && typeof incomingVal === 'object' && !Array.isArray(incomingVal)) {
    Object.entries(incomingVal).forEach(([key, value]) => {
      const val = removeFalsyFieldsRecursive(value, action)
      if (
        val === null ||
        val === undefined ||
        (typeof val === 'object' && !Array.isArray(val) && !Object.keys(val).length)
      ) {
        if (action === 'SET_NULL') incomingVal[key] = null
        if (action === 'DELETE') delete incomingVal[key]
      } else incomingVal[key] = val
    })
  }
  if (typeof incomingVal === 'object' && Array.isArray(incomingVal)) {
    const newVal = incomingVal
      .map(v => removeFalsyFieldsRecursive(v, action))
      .filter(val => !(typeof val === 'object' && !Array.isArray(val) && !Object.keys(val).length))
    incomingVal = newVal.length ? newVal : null
  }
  if (typeof incomingVal === 'number') return incomingVal

  return incomingVal ? incomingVal : null
}

const FormikBagContext = createContext({})
const Form = props => {
  const { formConfig: formSchema, incomingValue, selfDisabled } = props
  const { mode = 'EDIT', setMode, submitHandler, uiProps = {} } = props
  let { cancelHandler, renderPosition = 'TOP', render, actionButtons } = props

  const [formConfig, setFormConfig] = useState(null)
  useEffect(() => {
    const formConfig = new FormSchema(formSchema, incomingValue)
    setFormConfig(formConfig)
  }, [formSchema, incomingValue])

  const [errMsg, setErrMsg] = useState(null)
  useEffect(() => {
    if (errMsg) toast.error(errMsg)
    const timeoutId = setTimeout(() => errMsg && setErrMsg(null), 5000)

    return () => clearTimeout(timeoutId)
  }, [errMsg])

  if (!formConfig) return <Loader />

  if (!cancelHandler && incomingValue && mode === 'EDIT') cancelHandler = () => setMode('DISABLED')
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Formik
        initialValues={formConfig._initialValue}
        validationSchema={formConfig._validationSchema}
        onSubmit={async (values, { setErrors }) => {
          const formObj = cloneDeep(values)
          formObj['date'] = formObj['date'] ? (new Date(formObj['date'])).getTime() : undefined
          if (!formObj['date']) {
            delete formObj['date']
          }
          try {
            const fileInputPaths = formConfig.getFileInputs(values)
            if (fileInputPaths.length) {
              await Promise.all(
                fileInputPaths.map(async path => {
                  const file = _get(values, path)
                  if (file instanceof File) {
                    const imgMeta = await uploadFile(file)
                    _set(formObj, path, imgMeta)
                  }
                })
              )
            }

            if (submitHandler)
              await submitHandler(removeFalsyFieldsRecursive(formObj, incomingValue ? 'SET_NULL' : 'DELETE'))
          } catch (e) {
            const data = e?.response?.data
            if (data && typeof data === 'object') setErrors(data)
            else {
              if (data) setErrMsg(data)
              else toast.error(data || e.message)
            }
          }
        }}>
        {({ handleSubmit, handleReset, dirty, isSubmitting, ...FormikProps }) => (
          <FormikBagContext.Provider
            value={{
              ...FormikProps,
              getValidationSchema: formConfig.getValidationSchema,
              getDefaultValue: formConfig.getDefaultValue,
              backTracePath: formConfig.backTracePath,
              getValueInObject: formConfig.getValueInObject,
              mode,
              isSubmitting,
            }}>
            <form onSubmit={handleSubmit} onReset={handleReset} noValidate>
              <Box p={0.5}>
                <Grid container spacing={3}>
                  {renderPosition === 'TOP' && render && (
                    <Grid item {...{ xs: 12, ...uiProps.renderAreaBreakpoints }}>
                      {render(FormikProps.values, isSubmitting, { setFieldValue: FormikProps.setFieldValue })}
                    </Grid>
                  )}

                  {uiProps.showRootError && (
                    <Grid
                      item
                      {...{ xs: 12 }}
                      style={{
                        height: errMsg ? 45 : 0,
                        padding: `${errMsg ? 12 : 0}px 12px`,
                        transition: 'height 340ms',
                      }}>
                      <Typography variant="caption" color="error">
                        {errMsg}
                      </Typography>
                    </Grid>
                  )}

                  <Builder schema={formConfig._formConfig} />

                  {renderPosition === 'CENTER' && render && (
                    <Grid item {...{ xs: 12, ...uiProps.renderAreaBreakpoints }}>
                      {render(FormikProps.values, isSubmitting, { setFieldValue: FormikProps.setFieldValue })}
                    </Grid>
                  )}

                  <Grid item {...{ xs: 12, ...uiProps.ctaAreaBreakpoints }} className="Form-actions">
                    <Box display="flex" alignItems="flex-end" {...{ pt: 4, ...uiProps.ctaAreaBoxProps }}>
                      {renderPosition === 'ACTION_BUTTON_AREA' &&
                        render &&
                        render(FormikProps.values, isSubmitting, {
                          setFieldValue: FormikProps.setFieldValue,
                        })}
                      {actionButtons}
                      {mode !== 'READ' && (
                        <>
                          <Box flexGrow={1} />

                          {Object.keys(FormikProps.touched).length || dirty ? (
                            <Box mr={1}>
                              <Button
                                type="reset"
                                icon={Icons.reset}
                                color="warning"
                                disabled={isSubmitting}
                              />
                            </Box>
                          ) : cancelHandler ? (
                            <Box mr={1}>
                              <Button
                                color="error"
                                variant="outlined"
                                type="button"
                                onClick={cancelHandler}
                                disabled={isSubmitting}>
                                Cancel
                              </Button>
                            </Box>
                          ) : null}
                          <Box>
                            {mode === 'DISABLED' ? (
                              <Button key="set-mode-button" type="button" onClick={() => setMode('EDIT')}>
                                {uiProps.editButtonText || 'Edit'}
                              </Button>
                            ) : (
                              <Button
                                key="submit-button"
                                type="submit"
                                disabled={(!dirty && !selfDisabled) || isSubmitting}
                                loading={isSubmitting}>
                                {uiProps.submitButtonText || 'Submit'}
                              </Button>
                            )}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Grid>

                  {renderPosition === 'BOTTOM' && render && (
                    <Grid item {...{ xs: 12, ...uiProps.renderAreaBreakpoints }}>
                      {render(FormikProps.values, isSubmitting, { setFieldValue: FormikProps.setFieldValue })}
                    </Grid>
                  )}
                </Grid>
              </Box>
            </form>
          </FormikBagContext.Provider>
        )}
      </Formik>
    </MuiPickersUtilsProvider>
  )
}
Form.propTypes = {
  formConfig: PropTypes.object.isRequired,
  incomingValue: PropTypes.object,
  submitHandler: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['EDIT', 'DISABLED', 'READ']),
  setMode: PropTypes.func,
  uiProps: PropTypes.shape({
    showRootError: PropTypes.bool,
  }),
  renderPosition: PropTypes.oneOf(['TOP', 'CENTER', 'ACTION_BUTTON_AREA', 'BOTTOM']),
  render: PropTypes.func,
}

export default Form

const Builder = ({ schema, path = [] }) => {
  const { values, getDefaultValue, backTracePath, getValueInObject, isSubmitting, mode } = useContext(
    FormikBagContext
  )
  const { _type, _label, _description, _hide, ...inputConfig } = schema

  const disabled = isSubmitting || ['DISABLED', 'READ'].includes(mode)
  const getValueAtPath = (path, defaultValue) => getValueInObject(values, path, defaultValue)
  return (
    <>
      {_label && !shouldHide(_hide, path, { backTracePath, getValueAtPath }) && (
        <Grid item xs={12}>
          <Box pb={1.5} mt={2.5} mb={-2.5}>
            <Typography
              variant="subtitle2"
              style={{ fontSize: '1rem' }}
              color={disabled ? 'textSecondary' : 'textPrimary'}>
              {_label}
            </Typography>
          </Box>
        </Grid>
      )}
      {_type === 'object' && !shouldHide(_hide, path, { backTracePath, getValueAtPath }) && (
        <Grid item xs={true}>
          <Box pl={path.length ? 1 : 0}>
            <Grid container spacing={3}>
              <BaseBuilder inputs={inputConfig} path={path} />
            </Grid>
          </Box>
        </Grid>
      )}
      {_type === 'array' && !shouldHide(_hide, path, { backTracePath, getValueAtPath }) && (
        <>
          <Grid item xs={12}>
            <FieldArray
              name={path.join('.')}
              render={({ remove, insert, push }) => {
                const rows = _get(values, path, [])

                if (!rows.length)
                  return (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => push(getDefaultValue([...path, 0]))}
                      disabled={disabled}>
                      Add Row
                    </Button>
                  )
                return rows.map((value, index, { length }) => {
                  const pathArr = [...path, index]
                  return (
                    <Box key={pathArr.join('.')} display="flex" p={1.5} m={-1.5} pb={4}>
                      <Box flexGrow={1} borderLeft="2px solid #cbcbcb" pl={2} borderRadius={4}>
                        <Grid container spacing={3}>
                          <BaseBuilder inputs={inputConfig} path={pathArr} />
                        </Grid>
                      </Box>
                      <Box display="flex" flexDirection="column" justifyContent="flex-end" pl={1.5}>
                        {index === length - 1 && (
                          <Button
                            icon={Icons.addCircleOutline}
                            onClick={() => push(getDefaultValue(pathArr))}
                            disabled={disabled}
                          />
                        )}
                        {length > 1 && (
                          <Button
                            icon={Icons.delete}
                            color="error"
                            onClick={() => remove(index)}
                            disabled={disabled}
                          />
                        )}
                      </Box>
                    </Box>
                  )
                })
              }}
            />
          </Grid>
        </>
      )}
    </>
  )
}

const shouldHide = (_hide, path, { backTracePath, getValueAtPath }) => {
  return _hide && _hide(path, { backTracePath, getValueAtPath })
}

const BaseBuilder = ({ inputs, path }) => {
  const classes = useStyles()
  const {
    isSubmitting,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    backTracePath,
    getValueInObject,
    getDefaultValue,
    mode,
  } = useContext(FormikBagContext)

  return Object.entries(inputs).map(([key, schema]) => {
    const { _type, ...inputConfig } = schema
    const pathArr = [...path, key]
    if (_type) return <Builder key={key} schema={schema} path={pathArr} />
    else {
      const {
        _hide,
        onChange,
        breakpoints,
        offsets,
        validator,
        _getInitialValue,
        disabled,
        options,
        ...restInputConfig
      } = inputConfig

      const Input = Inputs[restInputConfig.type] ? Inputs[restInputConfig.type] : Inputs.DEFAULT

      const getValueAtPath = (path, defaultValue) => getValueInObject(values, path, defaultValue)

      if (options)
        restInputConfig.options =
          typeof options === 'function'
            ? options(pathArr, { backTracePath, getValueAtPath, getDefaultValue })
            : options

      if (validator) restInputConfig.required = validator.tests.some(t => t.OPTIONS.name === 'required')
      restInputConfig.disabled = disabled || isSubmitting || ['DISABLED', 'READ'].includes(mode)
      if (shouldHide(_hide, path, { backTracePath, getValueAtPath })) return null
      return (
        <React.Fragment key={key}>
          <Grid
            item
            {...(breakpoints || { xs: 4 })}
            className={clsx(restInputConfig.type === 'checkbox' && classes.checkboxContainer)}>
            <Input
              {...restInputConfig}
              value={_get(values, pathArr)}
              onChange={value => {
                if (value && validator) value = validator.cast(value)
                setFieldValue(pathArr, value)
                onChange &&
                  onChange(pathArr, value, { setFieldValue, backTracePath, getValueAtPath, getDefaultValue })
              }}
              onBlur={() => {
                setFieldTouched(pathArr, true)
              }}
              errorMessage={_get(touched, pathArr) && _get(errors, pathArr)}
            />
          </Grid>
          {offsets && Object.keys(offsets).length && <Grid item {...offsets} />}
        </React.Fragment>
      )
    }
  })
}

const useStyles = makeStyles(theme => ({
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
}))

export const FormDialog = ({ formProps: fp, ...props }) => {
  const { submitHandler, ...formProps } = fp

  return (
    <Dialog dialogProps={{ className: 'Form-dialog' }} {...props}>
      {({ handleClose }) => (
        <Form
          {...formProps}
          submitHandler={async values => {
            if (submitHandler) await submitHandler(values)
            handleClose()
          }}
          cancelHandler={handleClose}
        />
      )}
    </Dialog>
  )
}
FormDialog.propTypes = {
  formProps: PropTypes.shape({
    submitHandler: PropTypes.func.isRequired,
  }).isRequired,
}
