import lodash from 'lodash'
import moment from 'moment'

export default class WbaLatestEvents {
    constructor(opts = {}) {
        this.initialize(opts)
    }

    initialize(opts = {}) {
        const WBAWAKATE_GROUP_ID = 1838

        const elm = (this.elm = opts.elm)
        const $elm = $(elm)
        const $list = $('<ul class="list">')

        const compiled = lodash.template(`
      <li class="item">
        <div class="date"><time datetime="<%= started_at %>"><%= startedAtFormat %></time></div>
        <div class="title"><a href="<%= event_url %>"><%= title %></a></div>
        <!-- <div class="place"><%= place %></div> -->
        <!-- <div class="catch"><%= catch_ %></div> -->
      </li>
    `)

        $.ajax({
            url: 'https://connpass.com/api/v1/event/',
            method: 'GET',
            data: {
                series_id: WBAWAKATE_GROUP_ID,
            },
            dataType: 'jsonp',
        })
            .then(res => {
                const eventArr = res.events.slice().reverse()

                const displayEventArr = eventArr
                    .map(event => {
                        const startedAtMoment = moment(event.started_at)
                        const startedAtFormat =
                            startedAtMoment.format('Y年M月D日 HH:mm')

                        return {
                            ...event,
                            catch_: event.catch, // catchは予約語のため
                            startedAtMoment,
                            startedAtFormat,
                        }
                    })
                    .filter(event => {
                        const endedAtMoment = moment(event.ended_at)

                        const isPast = endedAtMoment.isBefore(moment())

                        return !isPast
                    })
                    .sort((eventA, eventB) => {
                        return eventA.startedAtMoment.isAfter(
                            eventB.startedAtMoment
                        )
                    })
                if (displayEventArr.length > 0) {
                    displayEventArr.forEach(event => {
                        $list.append(compiled(event))
                    })

                    $elm.append($list)
                } else {
                    $elm.append(
                        '<p class="no-result">直近のイベントはありません</p>'
                    )
                }
            })
            .fail(err => {
                console.log(err)
            })
    }
}
