import React from 'react'
import { format } from 'date-fns'
import { Box, Card, CardContent, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

import Icons from '../../constants/icons'
import { Avatar, ContentCell, Dialog, Status } from '../index'
import { getAddressString } from '../Form/Inputs/Address'
import { getPhoneString } from '../../utils'
import { Button } from '../../components'

export const ResellerInfo = ({ reseller: r, actions }) => {
  return (
    <Card key={r.id}>
      <CardContent>
        <Box display="flex">
          <Avatar size={84} text={r?.name} src={r?.avatar?.thumbnail} />
          <Box flexGrow={1} ml={2}>
            <Box display="flex" justifyContent="flex-end">
              {/* <Status status={r?.status || 'Active'} /> */}
              <Typography variant="caption" color="textSecondary">
                Created by {r?.createdBy || 'anonymous'} @{' '}
                {r?.createdAt ? format(new Date(r?.createdAt), 'MMM do, yyyy') : ''}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Box display="flex" alignItems="flex-end" mt={1}>
                  <Typography variant="h5">{`User ${r?.lastName || `${r?.id}`}`.trim()}</Typography>

                  {/* <Box ml={3}>
                    <Typography variant="subtitle1">{r?.humanFriendlyId || r.id}</Typography>
                  </Box> */}
                </Box>
                <Typography variant="body2">{r?.mobileNumber}</Typography>
              </Box>

              <Box display="flex">
                <Box mr={1}>
                  <Button component={Link} to={`/tenant/` + r.id} icon={Icons.eye} />
                  {/* <Dialog title={r.displayName || r.firstName} buttonProps={{ icon: Icons.eye }}>
                    {r.createdAt && (
                      <ContentCell
                        label="Date of Registration"
                        content={format(new Date(r.createdAt), 'dd/MM/yyyy hh:mma')}
                      />
                    )}
                    {r._id && <ContentCell label="Reseller ID" content={r.humanFriendlyId || r._id} />}
                    {r.gender && <ContentCell label="Gender" content={r.gender} />}
                    {r.displayName && <ContentCell label="Display Name" content={r.displayName} />}
                    {r.email && <ContentCell label="Email" content={r.email} />}

                    {r.ageGroup && <ContentCell label="Age Group" content={r.ageGroup} />}
                    {r.occupation && <ContentCell label="Occupation" content={r.occupation} />}
                    {r.language && <ContentCell label="Language" content={r.language} />}

                    {r.address && (
                      <ContentCell label="Address" inline={false}>
                        <Box pl={1}>
                          <Typography variant="body1">• {getAddressString(r.address)}</Typography>
                        </Box>
                      </ContentCell>
                    )}

                    {r.shippingAddresses && (
                      <ContentCell label="Shipping Addresses" inline={false}>
                        <Box pl={1}>
                          {r.shippingAddresses.map((a, i) => (
                            <Typography key={`address-${i}`} variant="body1">
                              • {getAddressString(a.address)}
                            </Typography>
                          ))}
                        </Box>
                      </ContentCell>
                    )}
                  </Dialog> */}
                </Box>
                {/* {actions} */}
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
