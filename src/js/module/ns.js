/*
 * グローバル直下に変数を置かないよう、ネームスペースを切る。
 * ネームスペース以下の変数にアクセスしたいときは各クラスでこれをimportする
 */

window.Wba = window.Wba || {};
const ns = window.Wba;
export default ns;
