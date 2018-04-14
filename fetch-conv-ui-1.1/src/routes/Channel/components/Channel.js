import React from 'react'
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'

import TabContainer from './TabContainer'
import MainChart from './MainChart'

const styles = theme => ({
  container: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto'
  }),
  textField: {
    margin: '7px 0',
  },
  preContainer: {
    textAlign: 'left',
    maxHeight: '30vh',
    overflow: 'auto',
    padding: 15
  }
})

class Channel extends React.Component {
  state = {
    value: 0,
  }

  componentDidMount () {
    if (this.props.params.idRoom) {
      if (this.props.channelOpened) {
        if (this.props.params.idRoom !== this.props.channelOpened.id) {
          this.initialChannel(this.props)
        }
      } else {
        this.initialChannel(this.props)
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.idRoom && nextProps.params.idRoom !== this.props.params.idRoom) {
      if (this.props.channelOpened) {
        if (nextProps.params.idRoom !== this.props.channelOpened.id) {
          this.initialChannel(nextProps)
        }
      } else {
        this.initialChannel(nextProps)
      }
    }
  }

  initialChannel = (props) => {
    const channel = this.mapRenderChannelDetail(props.params.type, props.params.idRoom)
    this.props.openChat(channel, props.params.idRoom, null, 15, false)
    this.props.openMember(props.params.idRoom, null, 1000, false)
    this.props.openPins(props.params.idRoom)
  }

  handleChange = (event, value) => {
    this.setState({ value });
  }

  handleChangeIndex = index => {
    this.setState({ value: index });
  }

  mapRenderChannelDetail = (type, id) => {
    const res = {
      'private': this.props.channelsPrivate.find(c => c.id == id),
      'public': this.props.channelsPublic.find(c => c.id == id),
    }

    return res[type]
  }

  render () {
    const { classes, theme } = this.props;

    return (
      <div>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            <Paper className={classes.preContainer} elevation={4}>
              <pre>
                # from channelDetail reducer
                <code>
                  {
                    JSON.stringify(this.props.channelOpened, null, '\t')
                  }
                </code>
              </pre>
            </Paper>
            <Paper className={classes.preContainer} elevation={4}>
              <pre>
                # Fresh fetched from server and merged in channelDetail reducer (Messages)
                <code>
                  {
                    JSON.stringify(this.props.messages, null, '\t')
                  }
                </code>
              </pre>
              <Button onClick={() => this.props.openChat({}, this.props.params.idRoom, this.props.nextMessage, 15, true)} variant="raised" color="primary">
                More Message
              </Button>
            </Paper>
            <Paper className={classes.preContainer} elevation={4}>
              <pre>
                # Fresh fetched from server and merged in channelDetail reducer (Members)
                <code>
                  {
                    JSON.stringify(this.props.members, null, '\t')
                  }
                </code>
              </pre>
              <Button onClick={() => this.props.openMember(this.props.params.idRoom, this.props.nextMember, 15, true)} variant="raised" color="primary">
                More Members
              </Button>
            </Paper>
            <Paper className={classes.preContainer} elevation={4}>
              <pre>
                # Fresh fetched from server and merged in channelDetail reducer (Pins)
                <code>
                  {
                    JSON.stringify(this.props.pins, null, '\t')
                  }
                </code>
              </pre>
            </Paper>
            <Paper className={classes.preContainer} elevation={4}>
              <pre>
                # Mapping from channel reducer
                <code>
                  {
                    JSON.stringify(this.mapRenderChannelDetail(this.props.params.type, this.props.params.idRoom), null, '\t')
                  }
                </code>
              </pre>
            </Paper>
          </TabContainer>
          <TabContainer dir={theme.direction}>
            Dummy chart
            <MainChart />
          </TabContainer>
          <TabContainer dir={theme.direction}>
            item 3
          </TabContainer>
        </SwipeableViews>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(Channel)
