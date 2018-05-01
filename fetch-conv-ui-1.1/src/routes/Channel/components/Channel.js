import React from 'react'
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'
import Card, { CardActions, CardContent } from 'material-ui/Card'
import TabContainer from './TabContainer'
import MainChart from './MainChart'
import Grid from 'material-ui/Grid'

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
    padding: 15
  },
  codeContainer: {
    backgroundColor: '#000',
    color: '#FFF',
    textAlign: 'left',
    maxHeight: '30vh',
    overflow: 'auto',
    padding: 15
  },
  card: {
    minWidth: 100,
    maxWidth: 500,
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  grid: {
    wordWrap: 'break-word'
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
    this.props.setChannelOpened(channel)
    this.props.setChannelInfo(props.params.idRoom)
    // this.props.openChat(channel, props.params.idRoom, null, 1000, false)
    // this.props.openMember(channel, props.params.idRoom, null, 1000, false)
    // this.props.openPins(channel, props.params.idRoom)
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

  renderCard = (attr, value) => {
    const {classes} = this.props
    return (
      <Grid className={classes.grid} item>
        <Card className={classes.card}>
          <CardContent>
            <h2 className={classes.title} color="textSecondary">
              {attr}
            </h2>
            {value}
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
    )
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
            <Tab label="Summary" />
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
              {
                (this.props.channelOpened && this.props.channelInfo) && (
                  <Grid item xs={12}>
                    <h2>{this.props.channelOpened.detail.name}</h2>
                    <Grid container justify="flex-start" spacing={16}>
                      {this.renderCard('ID', this.props.channelOpened.id)}
                      {this.renderCard('Name', this.props.channelOpened.detail.name)}
                      {this.renderCard('Creator', this.props.channelOpened.detail.creator)}
                      {this.renderCard('Messages', this.props.channelInfo.total_messages)}
                      {this.renderCard('Members', this.props.channelInfo.total_members)}
                      {this.renderCard('Topic', this.props.channelOpened.detail.topic.value)}
                      {this.renderCard('Purpose', this.props.channelOpened.detail.purpose.value)}
                    </Grid>
                  </Grid>
                ) || ''
              }
              <h4>JSON Structure</h4>
              <div className={classes.codeContainer}>
                <pre style={{color: '#FFF'}}>
                  <code>
                    {
                      JSON.stringify(this.props.channelOpened, null, '\t')
                    }
                  </code>
                </pre>
              </div>
            </Paper>
          </TabContainer>
          <TabContainer dir={theme.direction}>
            Dummy chart
            <MainChart channelInfo={this.props.channelInfo} />
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
