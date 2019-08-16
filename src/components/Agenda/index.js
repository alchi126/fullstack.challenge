// @flow

import React, { Component } from 'react'
import { DateTime } from 'luxon'
import { computed, action } from 'mobx'
import { observer, inject } from 'mobx-react'

import greeting from 'lib/greeting'

import type Account from 'src/models/Account'

import List from './List'
import EventCell from './EventCell'

import style from './style'
import { filter } from 'minimatch';

/**
 * Agenda component
 * Displays greeting (depending on time of day)
 * and list of calendar events
 */

type tProps = {
  account: Account
}

@inject('account')
@observer
class Agenda extends Component<tProps> {
  /**
   * Return events from all calendars, sorted by date-time.
   * Returned objects contain both Event and corresponding Calendar
   */
  @computed
  get events(): Array<{ calendar: Calendar, event: Event }> {
    const id = this.props.account.filterId
    const events = this.props.account.calendars
      .filter(calendar => {
        if (id === 'all') {
          return true
        }
        else {
          return calendar.id === id
        }
      })
      .map(calendar => {
        return calendar.events.map((event) => (
          { calendar, event }
        ))
      })
      .flat()

    // Sort events by date-time, ascending
    events.sort((a, b) => (a.event.date.diff(b.event.date).valueOf()))

    return events
  }

  @computed
  get filterOptions(): Array<string> {
    const id = this.props.account.calendars
      .map((calendar) => (
        calendar.id
      ))
    return id
  }

  @action.bound
  filter(e) {
    this.props.account.filterId = (e.target) ? e.target.value : e.id
  }

  render() {
    return (
      <div className={style.outer}>
        <div className={style.container}>

          <div className={style.header}>
            <span className={style.title}>
              {greeting(DateTime.local().hour)}
            </span>
            <div className={style.menu}>
              <select value={this.props.account.filterId} onChange={this.filter}>
                <option value='all'>all</option>
                {this.filterOptions.map(id => (
                  <option value={id}>{id}</option>
                ),
                )}
              </select>
            </div>
          </div>

          <List>
            {this.events.map(({ calendar, event }) => (
              <EventCell key={event.id} calendar={calendar} event={event} handleClick={this.filter} />
            ))}
          </List>

        </div>
      </div>
    )
  }
}

export default Agenda
