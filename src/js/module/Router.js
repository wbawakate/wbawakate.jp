import ns from './ns';
import PageCommon from '../page/Common';
import PageIndex from '../page/Index';

export default class Router {
  constructor() {
    this.initialize();
  }

  initialize() {
    const $body = $('body');

    this.pageCommon = new PageCommon();

    if($body.hasClass('page-index')) {
      this.pageIndex = new PageIndex();
    }
  }
}
