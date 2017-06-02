import moment from 'moment';

export default class WbaLatestEvents {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const elm = this.elm = opts.elm;
    const $elm = $(elm);
    const $list = $('<div class="list">');

    $elm.append($list);

    const compiled = _.template(`
      <div class="item">
        <div class="date"><time datetime="<%= started_at %>"><%= startedAtFormat %></time></div>
        <div class="title"><a href="<%= event_url %>"><%= title %></a></div>
        <div class="place"><%= place %></div>
        <div class="catch"><%= catch_ %></div>
      </div>
    `);

    $.ajax({
      url: '//connpass.com/api/v1/event/',
      method: 'GET',
      data: {
        series_id: 1838,
      },
      dataType: 'jsonp',
    })
      .success((res) => {
        const eventArr = res.events;

        const displayEventArr = [];

        eventArr.forEach((event) => {
          const startedAtMoment = moment(event.started_at)
          const startedAtFormat = startedAtMoment.format('Y年M月D日 HH:mm');

          const endedAtMoment = moment(event.ended_at)

          // const isPast = endedAtMoment.isBefore(moment());
          const isPast = false;

          if (isPast) {
          } else {
            displayEventArr.push({
              ...event,
              catch_: event.catch, // catchは予約語のため
              startedAtFormat,
            });
          }

        });

        if (displayEventArr.length > 0) {
          displayEventArr.forEach((event) => {
            $list.append(compiled(event));
          });
        } else {
          $list.append('<p>直近のイベントはありません</p>');
        }
      })
      .fail((err) => {
        console.log(err);
      });
  }
}