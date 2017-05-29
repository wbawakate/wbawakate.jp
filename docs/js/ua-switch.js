(function uaSwitch() {
  // sp判定
  // タブレットはisPcとisTab両方trueとなる
  var u = window.navigator.userAgent.toLowerCase();
  var isSp, isPc, isTab;

  if(
    (u.indexOf("windows") !== -1 && u.indexOf("phone") !== -1)
    || u.indexOf("iphone") !== -1
    || u.indexOf("ipod") !== -1
    || (u.indexOf("android") !== -1 && u.indexOf("mobile") !== -1)
    || (u.indexOf("firefox") !== -1 && u.indexOf("mobile") !== -1)
    || u.indexOf("blackberry") !== -1
  ) {
    isSp = true;
    isPc = false;
  } else {
    isSp = false;
    isPc = true;
  }
  if(u.indexOf("ipad") !== -1) {
    isTab = true;
  }

  var htmlElm = document.querySelector('html');
  var htmlClassAttr = htmlElm.getAttribute('class') || '';

  if(isSp) {
    htmlElm.setAttribute('class', htmlClassAttr + ' is-sp');
  } else {
    htmlElm.setAttribute('class', htmlClassAttr + ' is-pc');
  }
  if(isTab) {
    htmlElm.setAttribute('class', htmlClassAttr + ' is-pc is-tab');
  }
})();
