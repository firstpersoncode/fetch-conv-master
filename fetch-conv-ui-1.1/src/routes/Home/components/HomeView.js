import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import './HomeView.scss'


class HomeView extends React.Component {

  render () {
    return (
      <div>
        Home
      </div>
    )
  }
}

// '/api/channels/<string:channel_id>/<string:cursor>/<string:limit>'

const mapStateToProps = (state) => ({
})

const matchDispatchToProps = dispatch => {
  const actions = {
  }
  return bindActionCreators(actions, dispatch);
};

export default connect(mapStateToProps, matchDispatchToProps)(HomeView)
