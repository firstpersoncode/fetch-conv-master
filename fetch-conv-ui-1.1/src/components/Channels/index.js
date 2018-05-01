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
  fetchChannel,
  startLoading,
  finishLoading,
  failedLoading,
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
    expanded: null,
    skipPublic: 0,
    skipPrivate: 0
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded && panel || false,
    })
  }

  fetchChannel = async (type, next, firstFetch) => {
    let limit = 25
    if (firstFetch) {
      next = null
    }

    this.props.startLoading()
    try {
      await this.props.fetchChannel({
        'detail.is_private': (type === 'private')
      }, {'_id': 0, 'updated': 0}, (type === 'private' ? this.state.skipPrivate : this.state.skipPublic), limit)
      this.props.finishLoading()
      if (type === 'private') {
        this.setState({ skipPrivate: this.state.skipPrivate + limit })
      } else {
        this.setState({ skipPublic: this.state.skipPublic + limit })
      }
    } catch (e) {
      console.error(e)
      this.props.failedLoading()
    }
  }

  fetchChannels = async (firstFetch) => {
    await this.fetchChannel('public', this.props.nextPublic, firstFetch)
    await this.fetchChannel('private', this.props.nextPrivate, firstFetch)
  }

  render () {
    const {classes} = this.props
    return (
      <div className='channel'>
        <Debug name='Component/Channels' state={this.state} stateProps={this.props} />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPublic}
          validLogin={this.props.validLogin}
          validScope={this.props.validScope}
          next={this.props.nextPublic}
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'public' && this.props.maximize}
          handleChange={this.handleChange('public')}
          isLoading={this.props.isLoading}
          fetchChannel={() => this.fetchChannel('public', this.props.nextPublic, false)}
          type='public' />
        <Divider />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPrivate}
          validLogin={this.props.validLogin}
          validScope={this.props.validScope}
          next={this.props.nextPrivate}
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'private' && this.props.maximize}
          handleChange={this.handleChange('private')}
          isLoading={this.props.isLoading}
          fetchChannel={() => this.fetchChannel('private', this.props.nextPrivate, false)}
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
  isLoading: state.channeldb.isLoading,
  validLogin: state.user.valid.identity,
  validScope: state.user.valid.workspace
})

const matchDispatchToProps = dispatch => {
  const actions = {
    fetchChannel,
    startLoading,
    finishLoading,
    failedLoading,
    collect
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, matchDispatchToProps)
)(Channels)
