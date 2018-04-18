import React from 'react'
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'

import { miner_endpoint } from '../../../constants'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  }
})

class DashBoard extends React.Component {

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
    const { classes, theme } = this.props;

    return (
      <div>
        DB Updaters
        <br/>
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

        <Button
          className={classes.button}
          // disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => {
            this.updateDB('0')
          }}>
          updateDB thread 0
        </Button>
        <Button
          className={classes.button}
          // disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => {
            this.updateDB('1')
          }}>
          updateDB thread 1
        </Button>
        <Button
          className={classes.button}
          // disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => {
            this.updateDB('2')
          }}>
          updateDB thread 2
        </Button>
        <Button
          className={classes.button}
          // disabled={(!this.props.validLogin && !this.props.validScope) || this.props.isLoading}
          variant="raised" color="secondary"
          onClick={() => {
            this.updateDB('3')
          }}>
          updateDB thread 3
        </Button>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(DashBoard)
