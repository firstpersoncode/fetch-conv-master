import React from 'react'
import IconButton from 'material-ui/IconButton'
import Hidden from 'material-ui/Hidden'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import Channels from '../Channels'
import Nav from '../Nav'


class DrawerItems extends React.Component {
  render() {
    const { classes, theme, handleMaximize, toggleMiniMaxi, maximize } = this.props

    return (
      <div>
        <Hidden smDown>
          <div className={classes.toolbar}>
            <IconButton onClick={toggleMiniMaxi}>
              {!maximize ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
        </Hidden>
        <Hidden mdUp>
          <Nav />
        </Hidden>
        <Channels handleMaximize={handleMaximize} maximize={maximize} />
      </div>
    )
  }
}

export default DrawerItems
