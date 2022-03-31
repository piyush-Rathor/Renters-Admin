import React from 'react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Box, Card, CardContent, Typography } from '@material-ui/core'

import Icons from '../../constants/icons'
import { Avatar, Button, Status } from '../index'

function getPhoneNumber({countryCode, areaCode, number}) {
  return `${countryCode || ''}-${areaCode || ''}-${number || ''}`
}

export const SupplierInfo = ({ supplier, actions }) => {
  return (
    <Card key={supplier._id}>
      <CardContent>
        <Box display="flex">
          <Avatar size={84} text={supplier.name} src={supplier.logo?.thumbnail} />
          <Box flexGrow={1} ml={2}>
            <Box display="flex" justifyContent="space-between">
              <Status status={supplier.status || '-'} />

              <Typography variant="caption" color="textSecondary">
                Created by {supplier.createdBy || 'anonymous'} @{' '}
                {format(new Date(supplier.createdAt), 'MMM do, yyyy')}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Box display="flex" alignItems="flex-end" mt={1}>
                  <Typography variant="h5">{supplier.name}</Typography>

                  <Box ml={3}>
                    <Typography variant="subtitle1">{supplier.humanFriendlyId||supplier._id}</Typography>
                  </Box>

                  <Box ml={3}>
                    <Typography variant="subtitle1">{supplier.contactPerson.phone ? getPhoneNumber(supplier.contactPerson.phone) : 'N/A'}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  {supplier.contactPerson?.firstName} {supplier.contactPerson?.email}
                </Typography>
              </Box>

              <Box display="flex">
                {actions}
                <Button component={Link} to={`/suppliers/` + supplier._id} icon={Icons.send} />
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
