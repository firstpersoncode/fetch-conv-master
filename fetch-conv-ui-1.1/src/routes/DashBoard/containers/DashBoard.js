import { connect } from 'react-redux'
import {
  fetchChannelLists,
  fetchChannelInfo,
  startLoading,
  finishLoading,
  failedLoading,
  fetchUsersList
} from '../../../store/channel'

import {
  fetchChannel as fetchChannelDB,
  collect
} from '../../../store/microdb/channel'
/*  This is a container component. Notice it does not contain any JSX,
    nor does it import React. This component is **only** responsible for
    wiring in the actions and state necessary to render a presentational
    component - in this case, the counter:   */

import DashBoard from '../components/DashBoard'

/*  Object of action creators (can also be function that returns object).
    Keys will be passed as props to presentational components. Here we are
    implementing our wrapper around increment; the component doesn't care   */

const mapDispatchToProps = {
  fetchChannelLists,
  fetchChannelInfo,
  startLoading,
  finishLoading,
  failedLoading,
  fetchUsersList,
  fetchChannelDB,
  collect
}

const mapStateToProps = (state) => ({
  validLogin: state.user.valid,
  validScope: state.channel.valid,
  user: state.user.user,
  channelsPublic: state.channeldb.channels.public,
  channelsPrivate: state.channeldb.channels.private,
  nextPublic: state.channeldb.next.public,
  nextPrivate: state.channeldb.next.private,
  channelOpened: state.channelDetail.channelOpened,
  messages: state.channelDetail.messages,
  members: state.channelDetail.members,
  pins: state.channelDetail.pins,
  nextMessage: state.channelDetail.nextMessage,
  nextMember: state.channelDetail.nextMember,
  isLoading: state.channel.isLoading
})

/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:

    import { createSelector } from 'reselect'
    const counter = (state) => state.counter
    const tripleCount = createSelector(counter, (count) => count * 3)
    const mapStateToProps = (state) => ({
      counter: tripleCount(state)
    })

    Selectors can compute derived data, allowing Redux to store the minimal possible state.
    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
    Selectors are composable. They can be used as input to other selectors.
    https://github.com/reactjs/reselect    */

export default connect(mapStateToProps, mapDispatchToProps)(DashBoard)
