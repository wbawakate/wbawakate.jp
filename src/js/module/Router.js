import ns from './ns';
import common from '../page/common';
import home from '../page/home';
import about from '../page/about';

function page(pageId, callback) {
  if(document.querySelector(`body[data-page-id="${pageId}"]`)) {
    callback();
  }
};

export default class Router {
  constructor() {
    this.initialize();
  }

  initialize() {
    ns.page = ns.page || {};

    common();

    page('home', home);
    page('about', about);
  }
}
