import ns from '../module/ns';
import WbaLatestEvents from '../module/wba-latest-events';

export default () => {
  console.log('home page');

  const wbaLatestEvents = new WbaLatestEvents({
    elm: document.querySelector('.wba-latest-events'),
  });
};
