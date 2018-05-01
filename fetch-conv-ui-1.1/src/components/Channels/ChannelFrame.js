import React from 'react'
import { withStyles } from 'material-ui/styles'
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions
} from 'material-ui/ExpansionPanel'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import List from 'material-ui/List'
import Button from 'material-ui/Button'
import Hidden from 'material-ui/Hidden'

import ListChannel from './ListChannel'
import Loader from '../Loader'

class ChannelFrame extends React.Component {

  render () {
    const { classes, channels, expanded, handleChange, handleMaximize, maximize, type, next, isLoading, fetchChannel, validLogin, validScope } = this.props
    return (
      <ExpansionPanel expanded={expanded} onChange={handleChange}>
        <ExpansionPanelSummary onClick={handleMaximize} expandIcon={<ExpandMoreIcon />}>
          <Hidden mdUp>
            <h4>
              {
                type === 'public'
                ? <i className="material-icons">&#xE80B;</i>
                : <i className="material-icons">&#xE897;</i>
              }
            </h4>
          </Hidden>
          <Hidden smDown>
            <h4>
              {
                this.props.maximize
                ? type
                : type === 'public'
                ? <i className="material-icons">&#xE80B;</i>
                : <i className="material-icons">&#xE897;</i>
              }
            </h4>
          </Hidden>

        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List className={classes.channelList}>
            {
              isLoading
              ? <Loader loading={true} />
              : channels.length && channels.map((channel, i) => {
                return (
                  <ListChannel key={i} type={type} classes={classes} channel={channel.detail} />
                )
              }) || []
            }
          </List>
        </ExpansionPanelDetails>
        <ExpansionPanelActions>
          <Button
            variant="raised" color="primary" disabled={!(validLogin && validScope) || isLoading}
            onClick={fetchChannel}>
            More ...
          </Button>
        </ExpansionPanelActions>
      </ExpansionPanel>
    )
  }
}

export default ChannelFrame
