import * as Yup from 'yup'

export const login = {
  _type: 'object',

  email: {
    variant: 'outlined',
    type: 'email',
    label: 'Email',

    defaultValue: '',
    validator: Yup.string().email('Invalid email').required('Required'),

    breakpoints: { xs: 12 },
  },
  password: {
    variant: 'outlined',
    type: 'password',
    label: 'Password',

    defaultValue: '',
    validator: Yup.string().min(8).max(64).required('Required'),

    breakpoints: { xs: 12 },
  },
  rememberMe: {
    type: 'checkbox',
    label: 'Remember me',

    defaultValue: false,
    validator: Yup.bool(),

    breakpoints: { xs: 12 },
  },
}

export const resetPasswordRequest = {
  _type: 'object',

  email: {
    variant: 'outlined',
    type: 'email',
    label: 'Email',

    defaultValue: '',
    validator: Yup.string().email('Invalid email').required('Required'),

    breakpoints: { xs: 12 },
  },
}

export const resetPassword = {
  _type: 'object',

  password: {
    variant: 'outlined',
    type: 'password',
    label: 'New Password',

    defaultValue: '',
    validator: Yup.string().min(8).max(64).required('Required'),

    breakpoints: { xs: 12 },
  },
  passwordConfirmation: {
    variant: 'outlined',
    type: 'password',
    label: 'New Password',

    defaultValue: '',
    validator: Yup.string()
      .min(8)
      .max(64)
      .required('Required')
      .test('password-test', 'Password do not match', function (value) {
        let { password } = this.parent
        return value === password
      }),

    breakpoints: { xs: 12 },
  },
}
