import ns from '../module/ns';

export default class Common {
  constructor(opts = {}) {
    this.initialize();
  }

  initialize() {
    console.log('page common');

    this.setEnvClass();
  }

  setEnvClass() {
    const $html = $('html');

    ns.isSp = false;
    ns.isPc = false;
    ns.isTab = false;

    if($html.hasClass('is-sp')) {
      ns.isSp = true;
    }
    if($html.hasClass('is-pc')) {
      ns.isPc = true;
    }
    if($html.hasClass('is-tab')) {
      ns.isTab = true;
    }
  }
}