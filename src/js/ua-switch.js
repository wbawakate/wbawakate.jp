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

  if(isSp) {
    htmlElm.classList.add('is-sp');
  } else {
    htmlElm.classList.add('is-pc');
  }
  if(isTab) {
    htmlElm.classList.add('is-pc');
    htmlElm.classList.add('is-tab');
  }
})();
