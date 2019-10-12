import PropTypes from 'prop-types'
import clsx from 'clsx'
import scrollbarSize from 'dom-helpers/scrollbarSize'
import React from 'react'

import * as dates from './utils/dates'
import Header from './Header'
import ResourceHeader from './ResourceHeader'
import { notify } from './utils/helpers'

class TimeGridHeader extends React.Component {
  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCell(date, idx) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = Header },
    } = this.props

    const today = getNow()

    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, 'dayFormat')

    const { className, style } = dayProp(date)

    let header = (
      <HeaderComponent date={date} label={label} localizer={localizer} />
    )

    return (
      <div
        key={idx}
        style={style}
        className={clsx(
          'rbc-header',
          className,
          dates.eq(date, today, 'day') && 'rbc-today'
        )}
      >
        {drilldownView ? (
          <a
            href="#"
            onClick={e => this.handleHeaderClick(date, drilldownView, e)}
          >
            {header}
          </a>
        ) : (
          <span>{header}</span>
        )}
      </div>
    )
  }

  renderHeaderCells(range) {
    return range.map((date, i) => this.renderHeaderCell(date, i))
  }
  render() {
    let {
      width,
      rtl,
      resources,
      range,
      accessors,
      scrollRef,
      isOverflowing,
      components: {
        timeGutterHeader: TimeGutterHeader,
        resourceHeader: ResourceHeaderComponent = ResourceHeader,
      },
    } = this.props

    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
    }
    const resourcesPlain = resources.map(([id, resource]) => ({ id, resource }))
    return (
      <div
        style={style}
        ref={scrollRef}
        className={clsx('rbc-time-header', isOverflowing && 'rbc-overflowing')}
      >
        <div
          className="rbc-label rbc-time-header-gutter"
          style={{ width, minWidth: width, maxWidth: width }}
        >
          {TimeGutterHeader && <TimeGutterHeader />}
        </div>

        {range.map((date, ii) => (
          <div
            style={{
              flexGrow: resourcesPlain.filter(({ resource }) =>
                (resource.workingDays || [date.getDay()]).includes(
                  date.getDay()
                )
              ).length,
            }}
            className="rbc-time-header-content"
            key={ii}
          >
            <div className="rbc-row rbc-row-resource" key={`resource_${ii}`}>
              {this.renderHeaderCell(date, ii)}
            </div>

            <div className="rbc-row rbc-time-header-cell">
              {resources.map(([id, resource], idx) => {
                return (
                  resource &&
                  (resource.workingDays || [date.getDay()]).includes(
                    date.getDay()
                  ) && (
                    <div key={id} className="rbc-header">
                      <ResourceHeaderComponent
                        index={idx}
                        label={accessors.resourceTitle(resource)}
                        resource={resource}
                      />
                    </div>
                  )
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

TimeGridHeader.propTypes = {
  range: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  resources: PropTypes.object,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any,
}

export default TimeGridHeader
