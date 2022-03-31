import React from 'react'
import { Box, Card, CardActions, CardMedia, Chip, Typography } from '@material-ui/core'

import Icons from '../../constants/icons'
import { Icon } from '../../components'

export const SubSubcategoryCard = ({ category: c, subcategory: sc, subSubcategory: ssc, actions }) => {
  return (
    <Card style={{ position: 'relative' }}>
      <Box position="absolute" top={8} left={8}>
        <Chip label={ssc.status} color="primary" size="small" />
      </Box>
      <CardMedia image={ssc.cover?.thumbnail} style={{ paddingTop: '100%' }} />
      <CardActions style={{ flexDirection: 'column', alignItems: 'initial' }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" mb={0.5}>
          <Typography variant="body2" noWrap title={c?.name || ''}>
            {c?.name || ''}
          </Typography>1
          <Icon path={Icons.rightArrow} size={0.8} />
          <Typography variant="body2" noWrap title={sc?.name || ''}>
            {sc?.name || ''}
          </Typography>
        </Box>
        <Typography gutterBottom variant="body1" noWrap title={ssc?.name || ''}>
          {ssc?.name || ''}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          {actions}
        </Box>
      </CardActions>
    </Card>
  )
}
