import React, { useEffect, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { useDispatch } from 'react-redux'
import { Box } from '@material-ui/core'
import { mdiLogin } from '@mdi/js'
import { toast } from "react-toastify";

import { login as loginForm } from '../constants/forms'

import { login as loginAPI } from '../services/api'
import { login as loginAction } from '../store/reducers/auth'

import Form from '../components/Form'
import { Button, Loader, Logo, Section } from '../components'

function Login() {
  const dispatch = useDispatch()

  const [formConfig, setFormConfig] = useState(null)
  useEffect(() => {
    const _formConfig = cloneDeep(loginForm)
    _formConfig.email.defaultValue = localStorage.getItem('lastUsedEmail') || ''
    _formConfig.rememberMe.defaultValue = !!localStorage.getItem('lastUsedEmail')
    setFormConfig(_formConfig)
  }, [])

  const handleLogin = async ({ email, password, rememberMe }) => {
    try{
      const { data } = await loginAPI({ email, password })
      if (rememberMe) localStorage.setItem('lastUsedEmail', email)
      else localStorage.removeItem('lastUsedEmail')
      localStorage.setItem('token',data?.token)
      dispatch(loginAction(data))
    }catch(error){
      return toast.error(error.message)
    }
  }

  if (!formConfig) return <Loader />
  return (
    <Box display="flex" minHeight="100vh" flexDirection="column" alignItems="center" justifyContent="center">
      <Box mb={6} height={90}>
        <Logo />
      </Box>

      <Box width="90%" maxWidth={400}>
        <Section
          icon={mdiLogin}
          label="Login"
          cardContent={
            <Box pt={4}>
              <Form
                formConfig={formConfig}
                submitHandler={handleLogin}
                renderPosition="CENTER"
                render={() => (
                  <Box display="flex" justifyContent="flex-end" m={-2} mt={-4}>
                    <Button size="small" variant="text" href="/reset-password-request" routerLink>
                      forgot password?
                    </Button>
                  </Box>
                )}
                uiProps={{ ctaAreaBoxProps: { pt: 2 }, submitButtonText: 'Login', showRootError: true }}
              />
            </Box>
          }
        />
      </Box>
    </Box>
  )
}

export default Login
