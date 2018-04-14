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
  state = {
    idRoom: '',
    type: ''
  }

  handleGetChannelDetail = (id, type) => {
    this.setState({
      idRoom: id,
      type
    }, () => browserHistory.push('/channel/' + this.state.type + '/' + this.state.idRoom))
  }

  render () {
    const {classes, channel, type} = this.props
    return (
      <ListItem className={classes.channelContainer} button onClick={() => {
        this.handleGetChannelDetail(channel.id, type)
      }} disabled={channel.info && channel.info.is_archived || false}>
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
          secondary={channel.purpose.value ? channel.purpose.value : null}
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
