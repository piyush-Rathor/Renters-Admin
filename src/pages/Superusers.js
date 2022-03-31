import React, { useEffect, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'react-toastify'
import { Box, Grid, Typography } from '@material-ui/core'

import Icons from '../constants/icons'
import addSuperuser from '../constants/forms/add-superuser'
import { resetPassword as resetPasswordForm } from '../constants/forms'
import { createSuperuser, updateSuperuser, resetPassword } from '../services/api'
import usePageData from '../services/PageData'

import { FormDialog } from '../components/Form'
import { Button, Loader, SectionHeader, StatCard } from '../components'
import { SuperuserInfo } from '../components/entitywise/Superuser'
import { getSuperuserStatusToBeUpdated, SUPERUSER_STATUS_CHANGE_BUTTON_TEXTS } from '../constants'
import { logout } from '../store/reducers/auth'
import { useDispatch } from 'react-redux'

const addSuperuserForm = cloneDeep(addSuperuser)
const updateSuperuserForm = cloneDeep(addSuperuser)
const resetPasswordFormConfig = cloneDeep(resetPasswordForm)

function Superusers() {
  const { superusers, totalItems, containerRef, Pagination, refresh } = usePageData('superusers')
  const [users, setUsers] = useState([])
  // const dispatch = useDispatch()
  // const _createSuperuser = async values => {
  //   await createSuperuser(values).then(resp => refresh())
  //   toast.success('Superuser added successfully.')
  // }

  // const _updateSuperuser = async (_id, values) => {
  //   await updateSuperuser(_id, values).then(resp => refresh())
  //   let currentUser = JSON.parse(localStorage.getItem('user'))
  //   if(values.status === 'Blocked' && currentUser._id === _id)
  //     dispatch(logout())
  //   toast.success('Superuser updated successfully.')
  // }
  useEffect(() => {
    getUsers()
  }, [])
  const getUsers = async () => {
    try {
      
    } catch (error) {}
  }
  return (
    <Box ref={containerRef}>
      {!superusers ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Superusers" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.superuser}
              label="Superusers"
              rightComponent={
                <FormDialog
                  title="Add Superuser"
                  // formProps={{
                  //   formConfig: addSuperuserForm,
                  //   submitHandler: _createSuperuser,
                  // }}
                />
              }
            />
            <Box mb={2} />

            {superusers.length ? (
              superusers.map(s => (
                <Box key={s._id} mb={1.5}>
                  <SuperuserInfo
                    superuser={s}
                    actions={
                      <FormDialog
                        title="Update Superuser"
                        buttonProps={{ icon: Icons.edit }}
                        formProps={{
                          formConfig: updateSuperuserForm,
                          // submitHandler: val => _updateSuperuser(s._id, val),
                          incomingValue: s,
                          renderPosition: 'ACTION_BUTTON_AREA',
                          render: () => (
                            <Box display="flex">
                              <Box mr={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  // onClick={() =>
                                  //   _updateSuperuser(s._id, {
                                  //     status: getSuperuserStatusToBeUpdated(s.status),
                                  //   })
                                  // }
                                  color={{ Block: 'warning' }[SUPERUSER_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                                  style={{ marginRight: 8 }}
                                  text={SUPERUSER_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                                />
                              </Box>

                              <ResetPasswordButton email={s.email} />
                            </Box>
                          ),
                        }}
                      />
                    }
                  />
                </Box>
              ))
            ) : (
              <Box mt={4}>
                <Typography variant="body2">No superusers in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  )
}

export default Superusers

const ResetPasswordButton = ({ email }) => {
  const handleResetPassword = async ({ password }) => {
    const response = await resetPassword({ email, password, isSuperAdmin: true })
    if (response) toast.success(response)
  }

  return (
    <FormDialog
      title="Update Password"
      formProps={{
        formConfig: resetPasswordFormConfig,
        submitHandler: handleResetPassword,
        uiProps: { ctaAreaBoxProps: { pt: 2 }, showRootError: true },
      }}
      buttonProps={{
        startIcon: Icons.edit,
      }}
    />
  )
}
