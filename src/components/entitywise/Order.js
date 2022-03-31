import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Box, Card, CardContent, Typography } from '@material-ui/core'

import Icons from '../../constants/icons'
import { Button, Status } from '../index'
import { getAddressString } from '../Form/Inputs/Address'
import { getPhoneString } from '../../utils'

export const OrderCard = ({ order: r, actions }) => {
  return (
    <Card key={r._id}>
      <CardContent>
        <Box display="flex">
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex">
                <Status status={r.status} />
                <Box ml={1}>
                  <Typography variant="subtitle1">{r._id}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="textSecondary">
                Created by {r.createdBy || 'anonymous'} @ {format(new Date(r.createdAt), 'MMM do, yyyy')}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Box mt={1}>
                  <Typography variant="subtitle1">
                    {r.customer.name} {getPhoneString(r.customer?.phone)}
                  </Typography>
                </Box>
                <Typography variant="body2">{getAddressString(r.shippingAddress)}</Typography>
              </Box>

              <Box display="flex">
                {actions}
                <Button component={Link} to={`/orders/` + r._id} icon={Icons.send} />
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
