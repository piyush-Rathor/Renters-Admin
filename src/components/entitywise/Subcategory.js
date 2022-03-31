import React from 'react'
import { Box, Card, CardActions, CardMedia, Chip, Typography } from '@material-ui/core'

export const SubcategoryCard = ({ category: c, subcategory: sc, actions }) => {
  return (
    <Card style={{ position: 'relative' }}>
      <Box position="absolute" top={8} left={8}>
        <Chip label={sc.status} color="primary" size="small" />
      </Box>
      <CardMedia image={sc.cover?.thumbnail} style={{ paddingTop: '100%' }} />
      <CardActions style={{ flexDirection: 'column', alignItems: 'initial' }}>
        <Typography gutterBottom variant="body2" noWrap title={c?.name || ''}>
          {c?.name || ''}
        </Typography>
        <Typography gutterBottom variant="body1" noWrap title={sc?.name || ''}>
          {sc?.name || ''}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          {actions}
        </Box>
      </CardActions>
    </Card>
  )
}
