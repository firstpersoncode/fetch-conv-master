import React from 'react'
import { withStyles } from 'material-ui/styles'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Button from 'material-ui/Button'
import './Debug.scss'

const styles = theme => ({
  root: {
    flex: 1,
    position: 'fixed',
    width: '100%',
    height: '50vh',
    bottom: 0,
    zIndex: 500,
    backgroundColor: 'rgba(0,0,0,0.5)',
    overflow: 'auto',
    padding: 10
  },
  childs: {
    textAlign: 'left',
    color: '#FFF',
    fontSize: 12,
    padding: 15,
    border: '1px solid #FFF'
  },
  precode: {
    color: '#FFF'
  },
  button: {
    margin: 5
  }
})

class Debug extends React.Component {
  state = {
    overflow: false,
    display: false
  }

  render () {
    const {classes} = this.props
    return (
      <div>
        Debug {this.props.name}:
        <Button size='small' variant="raised" className={classes.button} onClick={() => this.setState({ display: !this.state.display })}>Toggle</Button>
        <Button size='small' variant="raised" className={classes.button} onClick={() => this.setState({ overflow: !this.state.overflow })}>Over Flow</Button>

        <div className={classes.root} style={{
          display: this.state.display ? 'block' : 'none',
          pointerEvents: this.state.overflow ? 'auto' : 'none'
        }}>
          <div className={classes.childs}>
            <pre>
              State:<br/>
              <code className={classes.precode}>
                {
                  JSON.stringify(this.props.state, null, '\t')
                }
              </code>
            </pre>
          </div>

          <div className={classes.childs}>
            <pre>
              Props:<br/>
              <code className={classes.precode}>
                {
                  JSON.stringify(this.props.stateProps, null, '\t')
                }
              </code>
            </pre>
          </div>

          <div className={classes.childs}>
            <pre>
              Store:<br/>
              <code className={classes.precode}>
                {
                  JSON.stringify(this.props.allState, null, '\t')
                }
              </code>
            </pre>
          </div>
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  allState: state
})

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(Debug)
