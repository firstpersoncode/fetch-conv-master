import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { browserHistory } from 'react-router'
import { withStyles } from 'material-ui/styles'
import Menu, { MenuItem } from 'material-ui/Menu'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Home from '@material-ui/icons/Home'
import PieChart from '@material-ui/icons/PieChart'
import Hidden from 'material-ui/Hidden'

import './Nav.scss'

import {
  revoke,
} from '../../store/user'


const styles = theme => ({
  flex: {
    flex: 1,
  },
  button: {
    margin: theme.spacing.unit,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

class Nav extends React.Component {
  state = {
    anchorEl: null,
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  handleLogout = () => {
    this.props.revoke()
    .then(res => {
      window.location.href = window.location.origin + '/'
    })
    .catch(err => {
      console.error('failed logout:', err)
    })
  }

  render () {
    const { classes, maximize } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)
    const redirect = "https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=3297565907.340417399520&state=identity"

    return (
      <div>
        <Hidden smDown>
          <div>
            <Button variant="raised" className={classes.button} onClick={() => browserHistory.push('/')}>Home</Button>
            <Button variant="raised" className={classes.button} onClick={() => browserHistory.push('/channel')} disabled={!this.props.validLogin && !this.props.validScope}>Channel</Button>
            {
              !this.props.validLogin && !this.props.validScope
              ? (
                <Button variant="raised" className={classes.button} onClick={() => {
                  window.location.href = __DEV__ ? '/miner/auth/signin?redirect='+encodeURIComponent(window.location.origin) : redirect
                }}>Sign In</Button>
              ) : (
                <IconButton
                  className={classes.button}
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit">
                  <AccountCircle />
                </IconButton>
              )
            }
          </div>
        </Hidden>
        <Hidden mdUp>
          <div>
            <IconButton color="inherit" onClick={() => browserHistory.push('/')}><Home /></IconButton>
            <IconButton color="inherit" onClick={() => browserHistory.push('/channel')} disabled={!this.props.validLogin && !this.props.validScope}><PieChart /></IconButton>
            {
              !this.props.validLogin && !this.props.validScope
              ? (
                <Button size='small' variant="raised" className={classes.button} onClick={() => {
                  window.location.href = __DEV__ ? '/miner/auth/signin?redirect='+encodeURIComponent(window.location.origin) : redirect
                }}>Sign In</Button>
              ) : (
                <IconButton
                  className={classes.button}
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit">
                  <AccountCircle />
                </IconButton>
              )
            }
          </div>
        </Hidden>


        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={this.handleClose}
        >
          <MenuItem onClick={() => browserHistory.push('/')}>Profile</MenuItem>
          <MenuItem onClick={this.handleLogout}>Log Out</MenuItem>
        </Menu>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  validLogin: state.user.valid,
  validScope: state.channel.valid
})

const matchDispatchToProps = dispatch => {
  const actions = {
    revoke
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, matchDispatchToProps)
)(Nav)
