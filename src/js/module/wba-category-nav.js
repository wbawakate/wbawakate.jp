export default class WbaCategoryNav {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const elm = this.elm = opts.elm;
    const $elm = $(elm);

    $(window).on('hashchange', (_evt) => {
      const category = location.hash.slice(1);

      if (category === 'All' || category === '') {
        $('.event-item')
          .show()
        ;
      } else {
        $('.event-item')
          .hide()
          .filter(`[data-type="${category}"]`)
          .show()
        ;
      }
    }).trigger('hashchange');

    // $elm.on('click', '.elm-a', (evt) => {
    //   const href = evt.target.getAttribute('href');
    //   console.log(href);
    // });
  }
}