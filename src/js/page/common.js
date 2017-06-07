import ns from '../module/ns';

export default () => {
  console.log('page common');

  setEnvClass();
  fitWindow();
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

function fitWindow() {
  // resize event
  $(window).on('resize', (evt) => {
    const breakpoint = 480;

    // ブレークポイント近辺でスクロールバーが邪魔になるのでスクロールバーを配慮した構成に
    const globalW = window.innerWidth; // スクロールバー含む
    const windowW = $(window).width(); // スクロールバー含まない

    if(windowW < breakpoint) {
      $('html').css({
        "font-size": 100 * globalW / 750,
      });
      $('body').css({
        "width": windowW,
      });
      ns.isLarge = false;
    } else {
      $('html').css("font-size", "");
      $('body').css("width", "");
      ns.isLarge = true;
    }
  }).trigger('resize');
}
