import React from 'react'
import { browserHistory } from 'react-router'

import List, {
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'

class ListChannel extends React.Component {

  render () {
    const {classes, channel, type} = this.props
    return (
      <ListItem
        button
        className={classes.channelContainer}
        onClick={() => browserHistory.push('/channel/' + type + '/' + channel.id)}
        disabled={channel.info && channel.info.is_archived || false}>
        <ListItemAvatar>
          <Avatar>
            {
              channel.is_archived
              ? <i className="material-icons">&#xE14B;</i>
              : (channel.unread_count_display && channel.unread_count_display > 0)
              ? <i className="material-icons">&#xE0B7;</i>
              : <i className="material-icons">&#xE0CB;</i>
            }

          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={channel.name}
          secondary={channel.purpose.value ? <span style={{"word-wrap":"break-word"}}>{channel.purpose.value}</span> : null}
        />
        <ListItemSecondaryAction onClick={() => {
          this.handleGetChannelDetail(channel.id, type)
        }}>
          <IconButton aria-label="notification">
            {
              channel.is_archived
              ? null
              : channel.unread_count_display && channel.unread_count_display > 0 || false
                ? (
                  <span className="notification">
                    <i className="material-icons">&#xE7F7;</i>
                    <small>{channel.unread_count_display && channel.unread_count_display || ''}</small>
                  </span>
                )
                : <i className="material-icons">&#xE7F5;</i>
            }

          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}

export default ListChannel
