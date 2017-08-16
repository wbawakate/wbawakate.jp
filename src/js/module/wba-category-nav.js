export default class WbaCategoryNav {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const elm = this.elm = opts.elm;
    const $elm = $(elm);

    let timer;

    $(window).on('hashchange', (_evt) => {
      const category = decodeURIComponent(location.hash.slice(1));

      clearTimeout(timer);

      $('.event-item')
        .attr('data-is-show', false)
        .removeClass('anim');

      setTimeout(() => {
        if (category === 'All' || category === '') {
          $('.event-item')
            .attr('data-is-show', true)
            .addClass('anim')
          ;
        } else {
          $('.event-item')
            .filter(`[data-type="${category}"]`)
            .attr('data-is-show', true)
            .addClass('anim')
          ;
        }
      }, 100);

      timer = setTimeout(() => {
        $('.event-item').removeClass('anim');
      }, 1000);
    }).trigger('hashchange');

    // $elm.on('click', '.elm-a', (evt) => {
    //   const href = evt.target.getAttribute('href');
    //   console.log(href);
    // });
  }
}