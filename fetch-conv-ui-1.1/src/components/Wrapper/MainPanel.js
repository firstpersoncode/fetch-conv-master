import React from 'react'

import {
  quotes
} from '../../constants'

import {
  randomQuotes
} from '../../utils'


class DrawerItems extends React.Component {
  render() {
    const { classes, children } = this.props

    return (
      <main className={classes.content}>
        <div className={classes.toolbar}>
        </div>
        {randomQuotes(quotes)}
        {children}
      </main>
    );
  }
}

export default DrawerItems
