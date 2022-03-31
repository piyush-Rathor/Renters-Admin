import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'react-toastify'
import { Box, Typography } from '@material-ui/core'
import { mdiLockReset } from '@mdi/js'

import { resetPasswordRequest as resetPasswordRequestForm } from '../constants/forms'
import { resetPasswordRequest as resetPasswordRequestAPI } from '../services/api'

import Form from '../components/Form'
import { Button, Logo, Section } from '../components'

const resetPasswordRequestFormConfig = cloneDeep(resetPasswordRequestForm)

function ResetPasswordRequest() {
  const [successMsg, setSuccessMsg] = useState(false)
  const handlePasswordResetRequest = async ({ email }) => {
    const response = await resetPasswordRequestAPI({ email })
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
          icon={mdiLockReset}
          label="Reset Password"
          cardContent={
            <Box pt={4}>
              <Form
                formConfig={resetPasswordRequestFormConfig}
                submitHandler={handlePasswordResetRequest}
                mode={successMsg ? 'READ' : 'EDIT'}
                renderPosition="CENTER"
                render={(value, isSubmitting) =>
                  successMsg ? (
                    <Box>
                      <Typography variant="caption" color="success">
                        {successMsg}
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        <Button size="small" variant="text" type="submit" loading={isSubmitting}>
                          didn't get email? Resend
                        </Button>
                      </Box>
                    </Box>
                  ) : null
                }
                uiProps={{
                  ctaAreaBoxProps: { pt: 2 },
                  submitButtonText: 'Send Request',
                  showRootError: true,
                }}
              />
            </Box>
          }
        />
      </Box>
    </Box>
  )
}

export default ResetPasswordRequest
