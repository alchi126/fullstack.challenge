// @flow

import React, { Component } from 'react'
import { Provider, disposeOnUnmount } from 'mobx-react'

import updateAccount from 'lib/updateAccount'
import createAccount from 'lib/createAccount'
import greeting from 'lib/greeting'
import runEvery from 'lib/runEvery'
import { DateTime } from 'luxon'

import Agenda from './Agenda'
import { observable } from 'mobx';

const REAL_TIME_UPDATES_INTERVAL = 3000

class Application extends Component {
  // Initialize an Account populated with random values
  account = createAccount()
  // Bring greeting to Application component to update inside existing setInterval
  greeting = {
    name: greeting(DateTime.local().hour)
  }
  // Simulate real-time updates by updating random events properties
  // at pre-defined intervals
  cancelRealTimeUpdates = disposeOnUnmount(this,
    runEvery(REAL_TIME_UPDATES_INTERVAL, () => {
      try {
        updateAccount(this.account)
        this.greeting.name = greeting(DateTime.local().hour)
      }
      catch (e) {
        console.error(e)
      }
    }),
  )

  render() {
    return (
      <Provider account={this.account} greeting={this.greeting}>
        <Agenda />
      </Provider>
    )
  }
}

export default Application
