import React, { useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Box, Typography } from '@material-ui/core'
import { mdiLockQuestion } from '@mdi/js'

import { resetPassword as resetPasswordForm } from '../constants/forms'
import { resetPassword as resetPasswordAPI } from '../services/api'

import Form from '../components/Form'
import { Button, Logo, Section } from '../components'

const resetPasswordFormConfig = cloneDeep(resetPasswordForm)

function ResetPassword() {
  const history = useHistory()
  const { search } = useLocation()

  const [successMsg, setSuccessMsg] = useState(false)
  const handleResetPassword = async ({ password }) => {
    const queryParams = new URLSearchParams(search)
    const email = queryParams.get('email')
    const resetPasswordRequestId = queryParams.get('resetPasswordRequestId')

    if (!email || !resetPasswordRequestId) {
      setTimeout(() => history.replace('/'), 2400)
      return toast.error('Invalid Request! Redirecting to home.', { autoClose: 2400 })
    }

    const response = await resetPasswordAPI({ email, resetPasswordRequestId, password })
    if (response) {
      toast.success(response)
      setSuccessMsg(response)
    }
  }

  return (
    <Box display="flex" minHeight="100vh" flexDirection="column" alignItems="center" justifyContent="center">
      <Box component={Link} to="/" mb={6} height={90}>
        <Logo />
      </Box>

      <Box width="90%" maxWidth={400}>
        <Section
          icon={mdiLockQuestion}
          label="Set New Password"
          cardContent={
            <Box pt={4}>
              <Form
                formConfig={resetPasswordFormConfig}
                submitHandler={handleResetPassword}
                mode={successMsg ? 'READ' : 'EDIT'}
                renderPosition="CENTER"
                render={() =>
                  successMsg ? (
                    <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
                      <Box mr={2}>
                        <Typography variant="caption" color="success">
                          {successMsg}
                        </Typography>
                      </Box>
                      <Button variant="outlined" component={Link} to="/login">
                        Go to Login
                      </Button>
                    </Box>
                  ) : null
                }
                uiProps={{ ctaAreaBoxProps: { pt: 2 }, showRootError: true }}
              />
            </Box>
          }
        />
      </Box>
    </Box>
  )
}

export default ResetPassword
