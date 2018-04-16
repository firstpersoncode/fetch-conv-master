import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import classNames from 'classnames'
import { withStyles } from 'material-ui/styles'
import Drawer from 'material-ui/Drawer'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import Hidden from 'material-ui/Hidden'
import MenuIcon from '@material-ui/icons/Menu'

import DrawerItems from './DrawerItems'
import MainPanel from './MainPanel'
import Nav from '../Nav'

import './Wrapper.scss'

import {
  getInfo
} from '../../store/user'

import {
  statusCheck as statusCheckLogin
} from '../../store/user'

import {
  statusCheck as statusCheckScope
} from '../../store/channel'

const drawerWidth = 450

const styles = theme => ({
  root: {
    flexGrow: 1,
    // height: 430,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    // zIndex: theme.zIndex.drawer + 1,
    marginLeft: 100,
    width: `calc(100% - 150px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      width: '100%',
    },
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  flex: {
    flex: 1,
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      width: 300,
      textAlign: 'right'
    },
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: 150,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflowX: 'hidden',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
})


class WrapperLayout extends React.Component {
  state = {
    mobileOpen: false,
    maximize: false
  }

  componentWillMount () {
    this.props.statusCheckLogin()
    this.props.statusCheckScope()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.handleClose()
    }
    if (nextProps.validLogin !== this.props.validLogin) {
      this.props.getInfo()
    }

    if (nextProps.validScope !== this.props.validScope) {
      // this.props.connectRTM()
      // this.props.startRTM()
      if (__DEV__) console.log('validScope')
    }
  }

  toggleDrawer = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }

  toggleMiniMaxi = () => {
    this.setState({ maximize: !this.state.maximize })
  }

  handleClose = () => {
    this.setState({ mobileOpen: false, maximize: false })
  }

  handleMaximize = () => {
    this.setState({ maximize: true })
  }


  render() {
    const { classes, theme } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classNames(classes.appBar, this.state.maximize && classes.appBarShift)}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.toggleDrawer}
              className={classes.navIconHide}
            >
              <MenuIcon />
            </IconButton>
            <h2 className={classes.flex} style={{ textAlign: 'left' }}># Conv 1.0</h2>
            <Hidden smDown>
              <Nav />
            </Hidden>
          </Toolbar>
        </AppBar>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.toggleDrawer}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <DrawerItems
              classes={classes}
              theme={theme}
              handleMaximize={this.handleMaximize}
              toggleMiniMaxi={this.toggleMiniMaxi}
              maximize={this.state.maximize} />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(classes.drawerPaper, !this.state.maximize && classes.drawerPaperClose),
            }}
            open={this.state.maximize}
          >
            <DrawerItems
              classes={classes}
              theme={theme}
              handleMaximize={this.handleMaximize}
              toggleMiniMaxi={this.toggleMiniMaxi}
              maximize={this.state.maximize} />
          </Drawer>
        </Hidden>
        <MainPanel classes={classes} children={this.props.children} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  validLogin: state.user.valid,
  validScope: state.channel.valid,
  location: state.location
})

const matchDispatchToProps = dispatch => {
  const actions = {
    getInfo,
    statusCheckLogin,
    statusCheckScope
  }
  return bindActionCreators(actions, dispatch)
}

export default compose(
  withStyles(styles, { withTheme: true }),
  connect(mapStateToProps, matchDispatchToProps)
)(WrapperLayout)
