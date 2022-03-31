import React from 'react'
import { format } from 'date-fns'
import { Box, Card, CardContent, CardMedia, Typography } from '@material-ui/core'

import Icons from '../../constants/icons'
import { Button, Status } from '../index'
import { Link } from 'react-router-dom'

export const CollectionInfo = ({ collection, actions }) => {
  return (
    <Card key={collection._id} style={{ display: 'flex' }}>
      <CardMedia image={collection.cover?.thumbnail} style={{ width: 120, height: 120 }} />
      <CardContent style={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Status status={collection.status} />

          <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Typography variant="caption" color="textSecondary">
            Created by {collection.createdBy || 'anonymous'} @{' '}
            {format(new Date(collection.createdAt), 'MMM do, yyyy')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Go Live Time: {' '}{format(new Date(collection.goLiveTime), 'MMM do, yyyy')}
          </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Box display="flex" alignItems="flex-end" mt={1}>
              <Typography variant="h5">{collection.name}</Typography>

              <Box ml={3}>
                <Typography variant="subtitle1">{collection.collectionCode}</Typography>
              </Box>
            </Box>

            <Typography variant="body2">
              {[collection.category?.name, collection.subcategory?.name, collection.subSubcategory?.name]
                .filter(Boolean)
                .join(' > ')}
            </Typography>
            <Typography variant="body2">
              Tags:&nbsp;
              {[...collection?.tags]
                .filter(Boolean)
                .join(', ')}
            </Typography>
            <Typography variant="body2">
              {collection.contactPerson?.firstName} {collection.contactPerson?.email}
            </Typography>
          </Box>

          <Box display="flex">
            <Box mr={1}>{actions}</Box>
            <Button component={Link} to={`/collections/` + collection._id} icon={Icons.send} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
