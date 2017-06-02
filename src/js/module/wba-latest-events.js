export default class WbaLatestEvents {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const elm = this.elm = opts.elm;

    console.log(elm);
  }
}