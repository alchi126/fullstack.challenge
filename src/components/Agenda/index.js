// @flow

import React, { Component } from 'react'
import { computed, action, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
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
  account: Account,
  greeting: string
}

@inject('account')
@inject('greeting')
@observer
class Agenda extends Component<tProps> {
  /**
   * Return events from all calendars, sorted by date-time.
   * Returned objects contain both Event and corresponding Calendar
   */
  @computed
  get events(): Array<{ calendar: Calendar, event: Event }> {
    const id = this.props.account.filterId

    // filter for calendar with specific id matching current filteredId, otherwise return all calendars
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
  /**
   * @returns Array of event objects (organized in date-time ascending) separated by department
   */
  @computed
  get eventsByDepartment(): Array<{ calendar: Calendar, event: Event }> {
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

    // create a map of all departments and corresponding events
    const departmentMap = events.reduce((acc, eventObj) => {
      const departmentName = (!eventObj.event.department) ? 'Unnamed' : eventObj.event.department
      if (acc.hasOwnProperty(departmentName)) {
        acc[departmentName].events.push(eventObj)
      }
      else {
        acc[departmentName] = {
          name: departmentName,
          events: [eventObj],
        }
      }
      return acc
    }, {})

    // Sort events by date-time, ascending, and convert map to an array of events
    return Object.keys(departmentMap).reduce((acc, department) => {
      departmentMap[department].events.sort((a, b) => (a.event.date.diff(b.event.date).valueOf()))
      acc.push(departmentMap[department])
      return acc
    }, [])
  }

  @computed
  /**
   * @param none;
   * @return array of all calendar id's of current account
   */
  get filterOptions(): Array<string> {
    const id = this.props.account.calendars
      .map((calendar) => (
        calendar.id
      ))
    return id
  }

  @action.bound
  /**
   * @param {*} event
   * @description event handler to handle user selection of dropdown, or clicks on an Event Cell.
   */
  filter(e) {
    // if event id is anything but 'all' and is strictly equals to current filteredId, indicates that user is on a filtered view and clicked again -- return to 'all' view
    if (e.id === this.props.account.filterId && this.props.account.filterId !== 'all') {
      this.props.account.filterId = 'all'
    }
    else {
      // if e.target is not undefined, indicates that user has clicked. Otherwise, user is using the dropdown
      this.props.account.filterId = (e.target) ? e.target.value : e.id
    }
  }

  // local state to determine current view (department or all)
  @observable departmentView = 'all';
  /**
   * 
   * @param {*} e
   * @description event handler to change current view between department or all.
   */
  @action.bound
  changeView(e) {
    this.departmentView = (e.target.id === 'department') ? 'all' : 'department'
  }

  render() {
    return (
      <div className={style.outer}>
        <div className={style.container}>
          <div className={style.header}>
            <span className={style.title}>
              {this.props.greeting.name}
            </span>
            <div className={style.menu}>
              <select className={style.filterDropdown} value={this.props.account.filterId} onChange={this.filter}>
                <option value='all'>all</option>
                {this.filterOptions.map(id => (
                  <option value={id} key={id} >{id}</option>
                ),
                )}
              </select>
              <button className={style.departmentView} id={(this.departmentView === 'department') ? 'department' : 'all'} onClick={this.changeView}>{(this.departmentView === 'department') ? 'Unsorted View' : 'Department View'}</button>
            </div>
          </div>
          <List>
            {this.departmentView === 'department'
              ? this.eventsByDepartment.map(department => (
                <div key={department.name} className={style.departmentSection}>
                  <h2 className={style.departmentTitle}>{department.name}</h2>
                  {department.events.map(({ calendar, event }) => (
                    <EventCell key={event.id} calendar={calendar} event={event} handleClick={this.filter} />
                  ))
                  }
                  <hr />
                </div>
              ))
              : this.events.map(({ calendar, event }) => (
                <EventCell key={event.id} calendar={calendar} event={event} handleClick={this.filter} />
              ))
            }
          </List>
        </div>
      </div>
    )
  }
}

export default Agenda
