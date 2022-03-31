import React from 'react'
import { Box, Card, CardActions, CardMedia, Chip, Typography } from '@material-ui/core'

export const AdvertisementCard = ({ advertisement: c, actions }) => {
  return (
    <Card style={{ position: 'relative' }}>
      <Box position="absolute" top={8} left={8}>
        <Chip label={(c.status) + ` @${c.displayLocation}`} color="primary" size="small" />
      </Box>
      <CardMedia image={c.banner?.thumbnail} style={{ paddingTop: '66.6666%' }} />
      <CardActions>
        <Typography gutterBottom variant="body1" noWrap title={c.name}>
          {c.target}
        </Typography>
        <Box flexGrow={1} />
        {actions}
      </CardActions>
    </Card>
  )
}
