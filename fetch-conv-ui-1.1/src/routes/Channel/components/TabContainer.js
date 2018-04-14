import React from 'react'
import Paper from 'material-ui/Paper'

const TabContainer = ({ children, dir }) => {
  return (
    <Paper dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Paper>
  )
}

export default TabContainer
