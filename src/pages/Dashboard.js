import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Grid } from '@material-ui/core'
import { getSidebarLinks } from '../constants'
import { LinkBlock } from '../components'

function Dashboard() {
  const { auth } = useSelector(state => state)

  return (
    <>
      <Box mb={6}>
        <Grid container spacing={3}>
          {getSidebarLinks(auth?.user?.permissions).map((block, idx) => (
            <Grid key={'block' + idx} item xs={12}>
              <Grid container spacing={3}>
                {block
                  .filter(i => i.label !== 'Dashboard')
                  .map(i => (
                    <Grid key={i.label} item xs={3}>
                      <LinkBlock
                        icon={i.icon}
                        label={i.label}
                        url={i.pathname}
                        containerProps={{ mb: 9, mt: 0 }}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}

export default Dashboard
