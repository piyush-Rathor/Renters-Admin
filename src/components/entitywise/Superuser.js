import React from 'react'
import { format } from 'date-fns'
import { Box, Card, CardContent, Typography } from '@material-ui/core'

import Icons from '../../constants/icons'
import { Avatar, ContentCell, Dialog, Status } from '../index'
import { getPhoneString } from '../../utils'
import { Table } from '../Table'

export const SuperuserInfo = ({ superuser, actions, dialogActions }) => {
  return (
    <Card key={superuser._id}>
      <CardContent>
        <Box display="flex">
          <Avatar size={84} text={superuser.firstName} src={superuser.logo?.thumbnail} />
          <Box flexGrow={1} ml={2}>
            <Box display="flex" justifyContent="space-between">
              <Status status={superuser.status || 'Active'} />

              <Typography variant="caption" color="textSecondary">
                Created by {superuser.createdBy || 'anonymous'} @{' '}
                {format(new Date(superuser.createdAt), 'MMM do, yyyy')}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Box display="flex" alignItems="flex-end" mt={1}>
                  <Typography variant="h5">
                    {superuser.firstName} {superuser.lastName}
                  </Typography>

                  <Box ml={3}>
                    <Typography variant="subtitle1">{superuser.role}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2">{superuser.email}</Typography>
              </Box>

              <Box display="flex">
                <Box mr={1}>
                  <Dialog
                    title={`${superuser.firstName} ${superuser.lastName}`}
                    buttonProps={{ icon: Icons.eye }}>
                    {superuser.createdAt && (
                      <ContentCell
                        label="Date of Registration"
                        content={format(new Date(superuser.createdAt), 'dd/MM/yyyy hh:mma')}
                      />
                    )}
                    {superuser._id && <ContentCell label="Superuser ID" content={superuser._id} />}
                    {superuser.role && <ContentCell label="Role" content={superuser.role} />}

                    {superuser.email && <ContentCell label="Email" content={superuser.email} />}

                    {superuser.phone && (
                      <ContentCell label="Phone" content={getPhoneString(superuser.phone)} />
                    )}

                    <Box my={2}>
                      <Table
                        getKey={v => v.entity}
                        columns={[
                          { field: 'entity', label: 'Entity' },
                          { field: 'permissions', label: 'Permissions' },
                        ]}
                        rows={Object.entries(superuser.permissions).map(([k, v]) => ({
                          entity: k,
                          permissions: v.join(', '),
                        }))}
                        size="small"
                      />
                    </Box>

                    {!!dialogActions && <Box mt={2}>{dialogActions}</Box>}
                  </Dialog>
                </Box>
                {actions}
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
