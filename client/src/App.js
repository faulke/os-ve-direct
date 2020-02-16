import React, { Component } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'

const client = new W3CWebSocket('ws://127.0.0.1:8765')

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
        <h1>Battery voltage: {data.V / 1000}V </h1>
        <h1>Battery load: {data.I / 1000}A</h1>
        <h1>Panel voltage: {data.VPV / 1000}V</h1>
        <h1>Panel power: {data.PPV} W</h1>
        <h1>Current state: {getCurrentState(data.CS)}</h1>
        <h1>Yield today: {data.H20} kWh</h1>
        <h1>Max power today: {data.H21} W</h1>
      </div>
    )
  }
}

export default App
