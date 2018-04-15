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

import './Channels.scss'

import {
  fetchChannelLists,
  fetchChannelInfo,
  collect,
  startLoading,
  finishLoading,
  failedLoading
} from '../../store/channel'


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

  componentWillReceiveProps (nextProps) {
    if (nextProps.validScope !== this.props.validScope) {
      this.fetchChannels(true, '99')
    }

    // if (nextProps.nextPublic !== this.props.nextPublic) {
    //   this.fetchChannel('public', nextProps.nextPublic, '50', false)
    // }
    //
    // if (nextProps.nextPrivate !== this.props.nextPrivate) {
    //   this.fetchChannel('private', nextProps.nextPrivate, '50', false)
    // }
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
      const lists = await this.props.fetchChannelLists(type, 'all', next, limit, firstFetch)
      lists.map((c, i) => {
        this.props.fetchChannelInfo(type, c.id)
        // .then(info => {
        //   this.props.collect(info)
        // })
        this.props.collect(c)
      })
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

  render () {
    const {classes} = this.props
    return (
      <div className='channel'>
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPublic}
          next={this.props.nextPublic}
          step='99'
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'public' && this.props.maximize}
          handleChange={this.handleChange('public')}
          fetchChannelLists={this.props.fetchChannelLists}
          fetchChannelInfo={this.props.fetchChannelInfo}
          collect={this.props.collect}
          isLoading={this.props.isLoading}
          type='public' />
        <Divider />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPrivate}
          next={this.props.nextPrivate}
          step='99'
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'private' && this.props.maximize}
          handleChange={this.handleChange('private')}
          fetchChannelLists={this.props.fetchChannelLists}
          fetchChannelInfo={this.props.fetchChannelInfo}
          collect={this.props.collect}
          isLoading={this.props.isLoading}
          type='private' />
        <Divider />
        <Hidden mdUp>
          <IconButton
            className={classes.button}
            disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
            color="primary"
            onClick={() => this.fetchChannels(false, '99')}>
            <CloudDownload />
          </IconButton>
        </Hidden>
        <Hidden smDown>
          {
            this.props.maximize
            ? (
              <Button
                className={classes.button}
                disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
                variant="raised" color="primary"
                onClick={() => this.fetchChannels(false, '99')}>
                Fetch Channels
              </Button>
            ) : (
              <IconButton
                className={classes.button}
                disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
                color="primary"
                onClick={() => this.fetchChannels(false, '99')}>
                <CloudDownload />
              </IconButton>
            )
          }
        </Hidden>
        <Divider />
        {/*<Button
          fullWidth
          disabled={!this.props.channelsPublic.length || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => this.props.collect(this.props.channelsPublic)}>
          Collect Public Channels
        </Button>
        <Divider />
        <Button
          fullWidth
          disabled={!this.props.channelsPrivate.length || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => this.props.collect(this.props.channelsPrivate)}>
          Collect Private Channels
        </Button>*/}

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
    collect,
    startLoading,
    finishLoading,
    failedLoading
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, matchDispatchToProps)
)(Channels)
