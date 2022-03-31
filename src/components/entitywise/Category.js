import React from 'react'
import { Box, Card, CardActions, CardMedia, Chip, Typography } from '@material-ui/core'

export const CategoryCard = ({ category: c, actions }) => {
  return (
    <Card style={{ position: 'relative' }}>
      <Box position="absolute" top={8} left={8}>
        <Chip label={c.status} color="primary" size="small" />
      </Box>
      <CardMedia image={c.cover?.thumbnail} style={{ paddingTop: '100%' }} />
      <CardActions style={{ flexDirection: 'column', alignItems: 'initial' }}>
        <Typography gutterBottom variant="body1" noWrap title={c.name}>
          {c.name}
        </Typography>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          {actions}
        </Box>
      </CardActions>
    </Card>
  )
}
