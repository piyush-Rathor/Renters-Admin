import React from 'react'
import { Box, Card, CardActions, CardMedia, Chip, makeStyles, Typography } from '@material-ui/core'


const useStyles = makeStyles(theme => ({
  fullImage : {
    width: '100%',
    paddingTop: '66%'
  },
  halfImage : {
    width: '50%',
    paddingTop: '66%',

    '&:nth-child(2)': {
      marginLeft: '50%',
      marginTop: '-66%'
    }
  },
  moreImage: {
    width: '50%',
    paddingTop: '33%',

    '&:nth-child(1)': {
      paddingTop: '66%'
    },
    '&:nth-child(2)': {
      marginLeft: '50%',
      marginTop: '-66%'
    },
    '&:nth-child(3)': {
      marginLeft: '50%',
      marginTop: '0%'
    }
  }
}));


export const AdvertisementBannerCard = ({ advertisement: c, actions }) => {

  const classes = useStyles();
  const locationName = c.subcategory ? c.subcategory.name : c.category ? c.category.name : c.displayLocation 
  return (
    <Card style={{ position: 'relative' }}>
      <Box position="absolute" top={8} left={8}>
        <Chip label={(c.status) + ` @${locationName}`} color="primary" size="small" />
      </Box>
      <Box>
        {c?.bannerData.map((e, i) => {
          if(i>2) return<></>
          return (
          <CardMedia key={i} image={e?.data?.banner.thumbnail} 
          className={
            c?.bannerData.length === 1 ? classes.fullImage :
            c?.bannerData.length === 2 ? classes.halfImage :
            c?.bannerData.length > 2 ? classes.moreImage :
            classes.moreImage
          } 
          />
        )})}
      </Box>
      <CardActions>
        <Typography gutterBottom variant="body1" noWrap title={c.name}>
          {c?.bannerData[0]?.data?.target}
        </Typography>
        <Box flexGrow={1} />
        {actions}
      </CardActions>
    </Card>
  )
}
