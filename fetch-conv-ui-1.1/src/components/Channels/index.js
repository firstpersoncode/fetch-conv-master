import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { withStyles } from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import Divider from 'material-ui/Divider'
import Hidden from 'material-ui/Hidden'
import CloudDownload from '@material-ui/icons/CloudDownload'

import ChannelFrame from './ChannelFrame'

import Debug from '../Debug'

import './Channels.scss'

import {
  fetchChannelLists,
  fetchChannelInfo,
  startLoading,
  finishLoading,
  failedLoading,
  fetchUsersList
} from '../../store/channel'

import {
  fetchChannel as fetchChannelDB,
  collect
} from '../../store/microdb/channel'

import {
  openChat
} from '../../routes/Channel/modules/channelDetail'


const styles = theme => ({
  channelContainer: {
    fontSize: 10,
  },
  channelList: {
    maxHeight: 450,
    overflowX: 'hidden',
    overflowY: 'auto',
    width: '100%',
    backgroundColor: '#EEE'
  },
  button: {
    margin: theme.spacing.unit,
  }
})

class Channels extends React.Component {
  state = {
    expanded: null
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded && panel || false,
    })
  }

  fetchChannel = async (type, next, limit, firstFetch) => {
    if (firstFetch) {
      next = null
    }

    this.props.startLoading()
    try {
      await this.props.fetchChannelLists(type, 'all', next, limit, firstFetch)
      // const lists = await this.props.fetchChannelLists(type, 'all', next, limit, firstFetch)

      // lists.map((c, i) => {
      //   this.props.collect(c)
      // })

      // lists.map((c, i) => {
      //   setTimeout(() => this.props.fetchChannelInfo(type, c.id)
      //   .then(info => {
      //     this.props.collect(info)
      //   }), 1000)
      // })

      // lists.map((c, i) => {
      //   setTimeout(() => this.props.openChat(c, c.id, null, '1000', false), 1000)
      // })

      this.props.finishLoading()
    } catch (e) {
      console.error(e)
      this.props.failedLoading()
    }
  }

  fetchChannels = async (firstFetch, limit) => {
    await this.fetchChannel('public', this.props.nextPublic, limit, firstFetch)

    await this.fetchChannel('private', this.props.nextPrivate, limit, firstFetch)
  }

  fetchUsers = () => {
    this.props.fetchUsersList()
  }

  render () {
    const {classes} = this.props
    return (
      <div className='channel'>
        <Debug name='Component/Channels' state={this.state} stateProps={this.props} />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPublic}
          next={this.props.nextPublic}
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'public' && this.props.maximize}
          handleChange={this.handleChange('public')}
          isLoading={this.props.isLoading}
          fetchChannel={() => this.fetchChannel('public', this.props.nextPublic, '25', false)}
          type='public' />
        <Divider />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPrivate}
          next={this.props.nextPrivate}
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'private' && this.props.maximize}
          handleChange={this.handleChange('private')}
          isLoading={this.props.isLoading}
          fetchChannel={() => this.fetchChannel('private', this.props.nextPrivate, '25', false)}
          type='private' />
        <Divider />
        <Button
          className={classes.button}
          disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="primary"
          onClick={() => {
            this.fetchChannels(true, '1000')
          }}>
          Fetch Channels
        </Button>
        <Button
          className={classes.button}
          disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="primary"
          onClick={() => {
            this.fetchUsers()
          }}>
          Fetch Users
        </Button>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  channelsPublic: state.channel.channels.public,
  channelsPrivate: state.channel.channels.private,
  nextPublic: state.channel.next.public,
  nextPrivate: state.channel.next.private,
  isLoading: state.channel.isLoading,
  validLogin: state.user.valid,
  validScope: state.channel.valid
})

const matchDispatchToProps = dispatch => {
  const actions = {
    fetchChannelLists,
    fetchChannelInfo,
    startLoading,
    finishLoading,
    failedLoading,
    openChat,
    collect,
    fetchChannelDB,
    fetchUsersList
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, matchDispatchToProps)
)(Channels)
