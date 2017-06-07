import ns from '../module/ns';

export default () => {
  console.log('page common');

  setEnvClass();
};

function setEnvClass() {
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
