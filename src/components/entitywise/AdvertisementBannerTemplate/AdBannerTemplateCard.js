import { Box, Card, CardActions, CardMedia, makeStyles, Tooltip, Typography } from '@material-ui/core';
import React, { useRef } from 'react'
import Inputs from '../../Form/Inputs';

const useStyles = makeStyles(theme => ({
  bottomButtons : {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: "#00000099",
    flexDirection: 'row-reverse',
    justifyContent: 'center'
  }
}));

const AdBannerTemplateCard = ({advertisement: c, actions, l, i, children, ...props}) => {

  const classes = useStyles();
  return (
    <Tooltip title={`${parseInt(l.w/12 * 414)}x${parseInt(l.h/12 * 680)}`} placement="right" interactive>
      <Card  about className={`${l.static ? "static" : ""}`} {...props}>
        <CardActions style={{ padding: 0, position: 'relative', paddingTop: 0, height: 'calc(100% - 0px)' }} >
          <CardMedia image={c?.banner?.thumbnail || 'https://via.placeholder.com/300?text=Upload Image'} style={{height: '100%', width: '100%', margin: 0}} alt="dfs" />
        </CardActions>
        <CardActions className={classes.bottomButtons}>
          <Typography gutterBottom variant="body1" noWrap title={c?.name}>
            {c?.target}
          </Typography>
          <Box flexGrow={1} />
          {actions}
        </CardActions>
        {children}
      </Card>
    </Tooltip>
  );
}

export default AdBannerTemplateCard
