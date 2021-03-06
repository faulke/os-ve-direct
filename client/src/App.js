import React, { Component } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { Grid, Statistic } from 'semantic-ui-react'

const isDev = process.env.NODE_ENV === 'development'
const host = isDev ? 'localhost' : window.location.hostname
const client = new W3CWebSocket(`ws://${host}:8765`)

const getCurrentState = id => {
  switch (id) {
    case '0':
      return 'Off'
    case '1':
      return 'Low power'
    case '2':
      return 'Fault'
    case '3':
      return 'Bulk'
    case '4':
      return 'Absorption'
    case '5':
      return 'Float'
    case '6':
      return 'Inverting'
    default:
      return 'Unknown'
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null
    }
  }

  componentDidMount = () => {
    client.onopen = () => {
      console.log('Websocket client connected')
    }

    client.onmessage = message => {
      this.setState({ data: JSON.parse(message.data) })
    }
  };

  render() {
    const { data } = this.state

    if (!data) {
      return null
    }

    return (
      <div>
        <Grid columns={4} padded stackable verticalAlign="middle">
          <Grid.Column color="yellow" textAlign="center" tablet={4}>
            <Statistic>
              <Statistic.Label>Battery Voltage</Statistic.Label>
              <Statistic.Value>{data.V / 1000}V</Statistic.Value>
            </Statistic>
          </Grid.Column>
          <Grid.Column color="blue" textAlign="center" tablet={4}>
            <Statistic>
              <Statistic.Label>Battery Load</Statistic.Label>
              <Statistic.Value>{data.I / 1000}A</Statistic.Value>
            </Statistic>
          </Grid.Column>
          <Grid.Column color="orange" textAlign="center" tablet={4}>
            <Statistic>
              <Statistic.Label>Panel Voltage</Statistic.Label>
              <Statistic.Value>{data.VPV / 1000}V</Statistic.Value>
            </Statistic>
          </Grid.Column>
          <Grid.Column color="violet" textAlign="center" tablet={4}>
            <Statistic>
              <Statistic.Label>Panel Power</Statistic.Label>
              <Statistic.Value>{data.PPV}W</Statistic.Value>
            </Statistic>
          </Grid.Column>
          <Grid.Column color="grey" textAlign="center" tablet={16} stretched>
            <Statistic>
              <Statistic.Label>State</Statistic.Label>
              <Statistic.Value>{getCurrentState(data.CS)}</Statistic.Value>
            </Statistic>
          </Grid.Column>
        </Grid>
        {/* <h1>Yield today: {data.H20} kWh</h1>
        <h1>Max power today: {data.H21} W</h1> */}
      </div>
    )
  }
}

export default App
