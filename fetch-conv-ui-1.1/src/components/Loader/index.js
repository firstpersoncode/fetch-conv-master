import React from "react"
import { withStyles } from 'material-ui/styles'
import classNames from "classnames"
import {CircularProgress} from 'material-ui/Progress'

import './Loader.scss'

const styles = theme => ({
  center: {
    textAlign: "center",
    lineHeight: 20,
  },
  overlay: {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: "translateX(-50%)"
  },
  field: {
    position: "absolute",
    right: 0,
    top: 15,
    transform: "translateX(-50%)",
  },
})

class Loader extends React.Component {
  render() {
    if (!this.props.loading) {
      return null
    }

    const style = {
      width: 40,
      height: 40,
    }

    if (this.props.field) {
      style.width = 20
      style.height = 20
    }

    const { classes } = this.props

    return (
      <div className={classNames({[classes.center]: !this.props.field, [classes.field]: !!this.props.field, [classes.overlay]: this.props.overlay})} style={this.props.style}>
        <CircularProgress style={style} />
      </div>
    )
  }
}

export default withStyles(styles)(Loader)
