import Router from './Router';

export default class Main {
  constructor(opts = {}) {
    console.log('Hello, world!');

    this.initialize();

    console.log('Thanks, world!');
  }

  initialize() {
    $(() => {
      this.router = new Router();
    });
  }
}
