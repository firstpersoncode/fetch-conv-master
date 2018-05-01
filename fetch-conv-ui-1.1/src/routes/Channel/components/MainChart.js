import React from 'react'
import { withStyles } from 'material-ui/styles'
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalBarSeriesCanvas
} from 'react-vis'

const styles = theme => ({
  chart: {
    width: '100%',
    height: 400,
    overflow: 'auto',
    padding: 15
  }
})

class MainChart extends React.Component {
  mapData = (data) => {
    return data.length && data.map((d, i) => {
      return {
        x: d.year || d.date,
        y: d.total_messages,
        rotation: 60
      }
    })
  }

  render () {
    const {classes} = this.props
    const {by_year, by_day, by_month} = this.props.channelInfo.messages
    let byYear = this.mapData(by_year)
    let byMonth = this.mapData(by_month)
    let byDay = this.mapData(by_day)
    return (
      <div>
        <div className={classes.chart}>
          {
            byYear.length
            ? (
              <XYPlot
                xType="ordinal"
                width={byYear.length * 100}
                height={300}
                xDistance={byYear.length * 50}
                >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalBarSeries
                  data={byYear}/>
              </XYPlot>
            )
            : null
          }
        </div>

        <div className={classes.chart}>
          {
            byMonth.length
            ? (
              <XYPlot
                xType="ordinal"
                width={byMonth.length * 50}
                height={300}
                xDistance={byMonth.length * 50}
                >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalBarSeries
                  data={byMonth}/>
              </XYPlot>
            )
            : null
          }
        </div>
        <div className={classes.chart}>
          {
            byDay.length
            ? (
              <XYPlot
                xType="ordinal"
                width={byDay.length * 50}
                height={300}
                xDistance={byDay.length * 50}
                >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalBarSeries
                  data={byDay}/>
              </XYPlot>
            )
            : null
          }
        </div>

      </div>

    )
  }
}

export default withStyles(styles, { withTheme: true })(MainChart)
