import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { withStyles } from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import Divider from 'material-ui/Divider'
import Hidden from 'material-ui/Hidden'

import ChannelFrame from './ChannelFrame'

import './Channels.scss'

import {
  fetchChannelLists,
  fetchChannelInfo,
  collect
} from '../../store/channel'


const styles = theme => ({
  channelContainer: {
    fontSize: 10,
  },
  channelList: {
    maxHeight: 450,
    overflowX: 'hidden',
    overflowY: 'auto',
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
      this.fetchChannels(true)
    }
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded && panel || false,
    })
  }

  handleCollect = (data) => {
    // this.props.collect(data)
  }

  fetchChannels = (firstFetch) => {
    this.props.fetchChannelLists('public', 'all', this.props.nextPublic, '100', firstFetch)
    .then(res => {
      res.map((c, i) => {
        this.props.fetchChannelInfo('public', c.id)
        // .then(res => this.props.collect(res))
      })
    })
    .catch(err => {
      console.error(err)
    })

    this.props.fetchChannelLists('private', 'all', this.props.nextPrivate, '10', firstFetch)
    .then(res => {
      res.map((c, i) => {
        this.props.fetchChannelInfo('private', c.id)
        // .then(res => this.props.collect(res))
      })
    })
    .catch(err => {
      console.error(err)
    })

  }

  render () {
    const {classes} = this.props
    return (
      <div className='channel'>
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPublic}
          next={this.props.nextPublic}
          step='25'
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'public' && this.props.maximize}
          handleChange={this.handleChange('public')}
          fetchChannelLists={this.props.fetchChannelLists}
          fetchChannelInfo={this.props.fetchChannelInfo}
          type='public' />
        <Divider />
        <ChannelFrame
          classes={classes}
          channels={this.props.channelsPrivate}
          next={this.props.nextPrivate}
          step='25'
          maximize={this.props.maximize}
          handleMaximize={this.props.handleMaximize}
          expanded={this.state.expanded === 'private' && this.props.maximize}
          handleChange={this.handleChange('private')}
          fetchChannelLists={this.props.fetchChannelLists}
          fetchChannelInfo={this.props.fetchChannelInfo}
          type='private' />
        <Divider />
        <Hidden mdUp>
          <IconButton
            className={classes.button}
            disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
            color="primary"
            onClick={() => this.fetchChannels(false)}>
            <i className="material-icons">&#xE2C0</i>
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
                onClick={() => this.fetchChannels(false)}>
                Fetch Channels
              </Button>
            ) : (
              <IconButton
                className={classes.button}
                disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
                color="primary"
                onClick={() => this.fetchChannels(false)}>
                <i className="material-icons">&#xE2C0</i>
              </IconButton>
            )
          }
        </Hidden>
        <Divider />
        {/*<Button
          fullWidth
          disabled={!this.props.channelsPublic.length || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => this.handleCollect(this.props.channelsPublic)}>
          Collect Public Channels
        </Button>
        <Divider />
        <Button
          fullWidth
          disabled={!this.props.channelsPrivate.length || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => this.handleCollect(this.props.channelsPrivate)}>
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
    // collect
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, matchDispatchToProps)
)(Channels)
