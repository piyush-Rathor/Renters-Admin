import _set from 'lodash/set'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import _pick from 'lodash/pick'
import * as Yup from 'yup'

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

class FormSchema {
  constructor(schema, incomingValue) {
    this._schema = schema
    this._incomingValue = incomingValue

    this._formConfig = this.getConfig()
    this._validationSchema = this.getValidationSchema()
    this._initialValue = incomingValue ? this.getMergedValue() : this.getDefaultValue()
  }

  getConfig = () => {
    const func = ({ _type, _label, _description, _hide, _getInitialValue, validator, ...rest }) => {
      let schema = {}
      if (_type) schema._type = _type
      if (_label) schema._label = _label
      if (_description) schema._description = _description
      if (_hide) schema._hide = _hide
      Object.entries(rest).forEach(([key, config]) => {
        if (config._type) schema[key] = func(config)
        else {
          const { defaultValue, ...rest } = config
          schema[key] = rest
        }
      })
      return schema
    }

    return func(this._schema)
  }

  getDefaultValue = (path = []) => {
    const schema = this.getValueInObject(this._schema, this.getPathInSchema(path))
    if (!schema) return null

    let defaultValue = schema._type ? {} : null
    const func = (schema, path = []) => {
      const { _type, _label, _description, _hide, _getInitialValue, validator, ...rest } = schema

      if (_type) {
        Object.entries(rest).forEach(([key, schema]) => {
          func(schema, schema._type === 'array' ? [...path, key, 0] : [...path, key])
        })
      } else {
        defaultValue = isObject(defaultValue)
          ? _set(defaultValue, path, rest.defaultValue)
          : rest.defaultValue
      }

      if (_getInitialValue) {
        const initialValue = _getInitialValue(path, this.getValueInObject(defaultValue, path), {
          backTracePath: this.backTracePath,
          getValueAtPath: (path, _defaultValue) => this.getValueInObject(defaultValue, path, _defaultValue),
        })
        isObject(defaultValue) ? _set(defaultValue, path, initialValue) : (defaultValue = initialValue)
      }
    }
    func(schema)

    return schema._type === 'array' && typeof _last(path) !== 'number' ? [defaultValue] : defaultValue
  }

  getValidationSchema = (path = []) => {
    const schema = this.getValueInObject(this._schema, this.getPathInSchema(path))

    const func = ({ _type, _label, _description, _hide, _getInitialValue, ...schema }) => {
      let validationSchema = _type ? {} : null

      if (_type) {
        const { validator = s => s, ...rest } = schema
        Object.entries(rest).forEach(([key, schema]) => (validationSchema[key] = func(schema)))
        validationSchema =
          _type === 'array'
            ? validator(Yup.array().of(Yup.object().shape(validationSchema)))
            : validator(Yup.object().shape(validationSchema))
      } else {
        validationSchema = schema.validator
      }
      return validationSchema
    }
    return func(schema)
  }

  getFileInputs = values => {
    const fileInputs = []

    const func = (value, path = []) => {
      if (value instanceof File) {
        fileInputs.push(path)
      } else if (Array.isArray(value)) {
        value.forEach((val, idx) => func(val, [...path, idx]))
      } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([key, value]) => func(value, [...path, key]))
      }
    }
    func(values)

    return fileInputs
  }

  getMergedValue = () => {
    const mergedValue = {}
    const func = (path = []) => {
      const _getInitialValue = this.getValueInObject(
        this._schema,
        this.getPathInSchema([...path, '_getInitialValue'])
      )
      const defaultValue = _getInitialValue
        ? _getInitialValue(path, this.getDefaultValue(path), {
            backTracePath: this.backTracePath,
            getValueAtPath: (path, defaultValue) => this.getValueInObject(mergedValue, path, defaultValue),
          })
        : this.getDefaultValue(path)
      const incomingValue = this.getValueInObject(this._incomingValue, path)

      let type = null
      const validator = this.getValueInObject(this._formConfig, this.getPathInSchema([...path, 'validator']))
      if (validator) {
        const description = validator.describe()
        type = description.type
      }
      const _type = this.getValueInObject(this._formConfig, this.getPathInSchema([...path, '_type']))
      if (_type) type = _type

      if (['array', 'object'].includes(type) && isObject(incomingValue)) {
        if (isObject(defaultValue)) {
          const tempObj = _pick({ ...defaultValue, ...incomingValue }, Object.keys(defaultValue))
          Object.entries(tempObj).forEach(([key, value]) => func([...path, key]))
        } else _set(mergedValue, path, incomingValue)
      } else if (['array'].includes(type) && Array.isArray(incomingValue)) {
        incomingValue.forEach((value, idx) => {
          func([...path, idx])
        })
      } else {
        _set(mergedValue, path, [null, undefined].includes(incomingValue) ? defaultValue : incomingValue)
      }
    }
    func()

    return mergedValue
  }

  getPathInSchema = path => {
    return path.filter(i => typeof i !== 'number')
  }

  getValueInObject = (obj, path, defaultValue) => {
    return path && path.length ? _get(obj, path, defaultValue) : obj
  }

  backTracePath = (path, ...args) => {
    const clone = _cloneDeep(path)
    clone.splice(clone.length - args.length, args.length, ...args.reverse())
    return clone.filter(i => i !== null)
  }
}

export default FormSchema
