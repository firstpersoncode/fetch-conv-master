import React from 'react'
import axios from 'axios'
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

import { miner_endpoint } from '../../constants'

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

  fetchUsers = async () => {
    this.props.startLoading()
    try {
      await this.props.fetchUsersList()
      this.props.finishLoading()
    } catch (e) {
      console.error(e)
      this.props.failedLoading()
    }
  }

  updateDB = async (v) => {
    try {
      await axios.get(miner_endpoint + '/channels/update-' + v)
    } catch (e) {
      console.error(e)
    } finally {
      console.info('finish', v)
    }
  }

  render () {
    const {classes} = this.props
    return (
      <div className='channel'>
        {/* <Debug name='Component/Channels' state={this.state} stateProps={this.props} /> */}
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
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  channelsPublic: state.channeldb.channels.public,
  channelsPrivate: state.channeldb.channels.private,
  nextPublic: state.channeldb.next.public,
  nextPrivate: state.channeldb.next.private,
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
